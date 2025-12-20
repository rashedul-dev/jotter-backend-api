import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const generateToken = (id: string, email: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRE || "7d") as string,
  } as jwt.SignOptions);
};

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashed: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashed);
};
