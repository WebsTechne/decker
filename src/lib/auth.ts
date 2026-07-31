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
    sendResetPassword: async ({ user, url }) => {
      await transporter.sendMail({
        from: "Decker <decker.apps@gmail.com>",
        to: user.email,
        subject: "Reset your Decker password",
        text: `Reset your Decker password: ${url}\n\nIf you didn't request this, you can ignore this email.`,
        html: `<p>Click <a href="${url}">here</a> to reset your password.</p><p>If you didn't request this, you can ignore this email.</p>`,
      })
    },
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
