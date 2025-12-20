import nodemailer from "nodemailer"

export const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = createTransporter()

  const mailOptions = {
    from: `"Jotter" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error("Email sending error:", error)
    throw new Error("Email could not be sent")
  }
}
