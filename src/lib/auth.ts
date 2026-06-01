import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { username } from "better-auth/plugins"
import { prisma } from "#/db"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
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
    "exp://10.198.*.*:*/**", // Trust 10.198.x.x IP range with any port and path,
    "http://10.198.*.*:*/**",
    "http://10.94.8.24:3000", // my phone's ipconfig
  ],

  plugins: [username(), tanstackStartCookies()],
})
