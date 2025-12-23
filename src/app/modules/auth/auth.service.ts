import nodemailer from "nodemailer";
import User from "./auth.model";
import VerificationCode from "./verification.model";
import { hashPassword, comparePassword, generateVerificationCode, generateToken } from "./auth.utils";
import { AppError } from "../../middlewares/error.middleware";
import jwt from "jsonwebtoken";

// Debug: Log SMTP configuration
console.log("🔍 SMTP Configuration Check:");
console.log("SMTP_HOST:", process.env.SMTP_HOST || "NOT SET");
console.log("SMTP_PORT:", process.env.SMTP_PORT || "NOT SET");
console.log("SMTP_USER:", process.env.SMTP_USER ? "SET ✓" : "NOT SET ✗");
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "SET ✓" : "NOT SET ✗");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify connection
transporter.verify((error: any, success: any) => {
  if (error) {
    console.error("❌ SMTP Connection Failed:", error.message);
    console.error("Check your .env file and Gmail App Password");
  } else {
    console.log("✅ SMTP Server is ready to send emails");
  }
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  const mailOptions = {
    from: `"Jotter" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending error:", error);
    throw new AppError("Email could not be sent", 500);
  }
};

// Rest of your code...
export const sendVerificationEmail = async (email: string, code: string) => {
  const subject = "Jotter - Verify your email";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #333;">Welcome to Jotter!</h2>
      <p>Please use the following code to verify your email address:</p>
      <div style="font-size: 32px; font-weight: bold; padding: 20px; background: #f4f4f4; text-align: center; border-radius: 5px; margin: 20px 0;">
        ${code}
      </div>
      <p>This code will expire in 15 minutes.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

export const sendResetPasswordEmail = async (email: string, code: string) => {
  const subject = "Jotter - Reset your password";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Please use the following code to reset your password:</p>
      <div style="font-size: 32px; font-weight: bold; padding: 20px; background: #f4f4f4; text-align: center; border-radius: 5px; margin: 20px 0;">
        ${code}
      </div>
      <p>This code will expire in 15 minutes.</p>
      <p>If you didn't request a password reset, please secure your account immediately.</p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

export const registerUserService = async (userData: any) => {
  const { username, email, password } = userData;

  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    throw new AppError("User already exists", 409);
  }

  const hashedPassword = await hashPassword(password);
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    isEmailVerified: false,
  });

  await VerificationCode.create({
    email,
    code,
    type: "email_verify",
    expiresAt,
  });

  await sendVerificationEmail(email, code);
  return user;
};

export const verifyEmailService = async (email: string, code: string) => {
  const verification = await VerificationCode.findOne({
    email,
    code,
    type: "email_verify",
  });

  if (!verification) {
    throw new AppError("Invalid or expired verification code", 400);
  }

  if (verification.expiresAt < new Date()) {
    await VerificationCode.deleteOne({ _id: verification._id });
    throw new AppError("Verification code has expired", 410);
  }

  const user = await User.findOneAndUpdate({ email }, { isEmailVerified: true }, { new: true });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await VerificationCode.deleteOne({ _id: verification._id });

  const token = generateToken(user._id, user.email);
  return { token, user };
};

export const loginUserService = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email first", 403);
  }

  const isMatch = await comparePassword(password, user.password!);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken(user._id, user.email);
  return { token, user };
};

export const forgotPasswordService = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.isEmailVerified) {
    throw new AppError("Please verify your email first", 403);
  }

  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await VerificationCode.findOneAndUpdate(
    { email, type: "password_reset" },
    { code, expiresAt },
    { upsert: true, new: true }
  );

  await sendResetPasswordEmail(email, code);
};

export const verifyResetCodeService = async (email: string, code: string) => {
  const verification = await VerificationCode.findOne({
    email,
    code,
    type: "password_reset",
  });

  if (!verification) {
    throw new AppError("Invalid or expired reset code", 400);
  }

  if (verification.expiresAt < new Date()) {
    await VerificationCode.deleteOne({ _id: verification._id });
    throw new AppError("Reset code has expired", 410);
  }

  const resetToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: "10m" });
  return resetToken;
};

export const resetPasswordService = async (resetToken: string, newPassword: string) => {
  let decoded: any;
  try {
    decoded = jwt.verify(resetToken, process.env.JWT_SECRET!);
  } catch (err) {
    throw new AppError("Invalid or expired reset token", 401);
  }

  const email = decoded.email;
  const hashedPassword = await hashPassword(newPassword);

  const user = await User.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await VerificationCode.deleteOne({ email, type: "password_reset" });
};

export const resendVerificationService = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("Email is already verified", 400);
  }

  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await VerificationCode.findOneAndUpdate(
    { email, type: "email_verify" },
    { code, expiresAt },
    { upsert: true, new: true }
  );

  await sendVerificationEmail(email, code);
};
