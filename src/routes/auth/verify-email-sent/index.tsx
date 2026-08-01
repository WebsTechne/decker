import { Button } from "#/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card"
import { Spinner } from "#/components/ui/spinner"
import { authClient } from "#/lib/auth-client"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

export const Route = createFileRoute("/auth/verify-email-sent/")({
  component: VerifyEmailSent,
  validateSearch: z.object({ email: z.string().optional() }),
})

function VerifyEmailSent() {
  const { email } = Route.useSearch()
  const [resending, setResending] = useState(false)

  const resend = async () => {
    if (!email) return
    setResending(true)
    const res = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/",
    })
    if (res.error) toast.error(res.error.message ?? "Couldn't resend email")
    else toast.success("Verification email sent")
    setResending(false)
  }

  return (
    <Card size="sm" className="relative z-1000 mt-15 py-6! sm:max-w-md">
      <CardHeader>
        <CardTitle className="text-lg! font-bold">Almost there!</CardTitle>
        <CardDescription>
          We sent a verification link to {email ?? "your email"}. Click it to
          activate your Decker account — check spam if you don't see it in a
          couple minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="secondary"
          className="h-10 w-full"
          onClick={resend}
          disabled={resending}
        >
          {resending ? (
            <>
              <Spinner />
              Resending...
            </>
          ) : (
            "Resend email"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
