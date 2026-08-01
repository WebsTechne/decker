import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { username } from "better-auth/plugins"
import { prisma } from "#/db"
import { transporter } from "./transporter"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      void transporter.sendMail({
        from: "Decker <decker.apps@gmail.com>",
        to: user.email,
        subject: "Reset your Decker password",
        text: `Reset your Decker password: ${url}\n\nIf you didn't request this, you can ignore this email.\n\nIf this landed in your spam folder, marking it "Not spam" helps make sure future emails from Decker reach your inbox properly.`,
        html: `<p>Click <a href="${url}">here</a> to reset your password.</p>
        <p>If you didn't request this, you can ignore this email.</p>
        <p style="color:#888;font-size:12px;">If this landed in spam, marking it "Not spam" helps us reach your inbox reliably next time.</p>`,
      })
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      void transporter.sendMail({
        from: "Decker <decker.apps@gmail.com>",
        to: user.email,
        subject: "Verify your Decker email",
        text: `Welcome to Decker! Verify your email to get started: ${url}\n\nIf you didn't create a Decker account, you can ignore this email.\n\nIf this landed in your spam folder, marking it "Not spam" helps make sure future emails from Decker reach your inbox properly.`,
        html: `<p>Welcome to Decker! Click below to verify your email and get started.</p>
          <p><a href="${url}">Verify my email</a></p>
          <p>If you didn't create a Decker account, you can ignore this email.</p>
          <p style="color:#888;font-size:12px;">If this landed in spam, marking it "Not spam" helps us reach your inbox reliably next time.</p>`,
      })
    },
    sendOnSignUp: true,
    sendOnSignIn: true, // to auto-resend if an unverified user tries to sign in
    autoSignInAfterVerification: true,
  },

  user: {
    additionalFields: {
      role: {
        type: ["USER", "ADMIN"],
        required: false,
        defaultValue: "USER",
        input: false,
      },
      username: {
        type: "string",
        required: true,
        input: true,
      },
    },
  },

  trustedOrigins: [
    "http://localhost:3000",
    "decker://", // Basic scheme
    "decker://*", // Wildcard support for all paths following the scheme
    "exp://", // Trust all Expo URLs (prefix matching)
    "exp://**", // Trust all Expo URLs (wildcard matching)
    "http://localhost:3001",
    "https://decker.pxxl.click",
  ],

  plugins: [username(), tanstackStartCookies()],
})
