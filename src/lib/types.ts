import type { auth } from "./auth"

export type ServerSession = typeof auth.$Infer.Session | null
