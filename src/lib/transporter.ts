import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "decker.app@gmail.com",
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export { transporter }
