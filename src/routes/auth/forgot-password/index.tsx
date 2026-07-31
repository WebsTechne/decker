import { createFileRoute, Link } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"
import { z } from "zod"
import { toast } from "sonner"
import { authClient } from "#/lib/auth-client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card"
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "#/components/ui/field"
import { Input } from "#/components/ui/input"
import { Button } from "#/components/ui/button"
import { Spinner } from "#/components/ui/spinner"

export const Route = createFileRoute("/auth/forgot-password/")({
  component: ForgotPassword,
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
})

const schema = z.object({
  email: z.string().email("Enter a valid email"),
})

function ForgotPassword() {
  const search = Route.useSearch()

  const [sent, setSent] = useState(false)

  const form = useForm({
    defaultValues: { email: "" },
    validators: {
      onSubmit: ({ value }) => {
        const result = schema.safeParse(value)
        if (!result.success)
          return result.error.issues.map((i) => i.message).join(", ")
      },
    },
    onSubmit: async ({ value }) => {
      toast.loading("Sending reset link...", { id: "forgot-toast" })

      const resetUrl = new URL("/auth/reset-password", window.location.origin)
      if (search.redirect)
        resetUrl.searchParams.set("redirect", search.redirect)

      const res = await authClient.requestPasswordReset({
        email: value.email,
        redirectTo: resetUrl.toString(),
      })

      if (res.error) {
        toast.error(res.error.message ?? "Something went wrong", {
          id: "forgot-toast",
        })
        return
      }

      toast.success("Check your email", { id: "forgot-toast" })
      setSent(true)
    },
  })

  return (
    <Card size="sm" className="relative z-1000 mt-15 py-6! sm:max-w-md">
      <CardHeader>
        <CardTitle className="text-lg! font-bold">
          Reset your password
        </CardTitle>
        <CardDescription>
          {sent
            ? "If an account exists for that email, a reset link is on its way. Check your inbox — and your spam folder, just in case it lands there."
            : "Enter your email and we'll send you a reset link."}
        </CardDescription>
      </CardHeader>

      {!sent && (
        <CardContent>
          <form onSubmit={(e) => e.preventDefault()}>
            <FieldGroup className="gap-5">
              <form.Field
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid} className="gap-1">
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="email"
                        className="h-10"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />
              <Field>
                <Button
                  type="button"
                  className="h-10"
                  onClick={() => form.handleSubmit()}
                >
                  {form.state.isSubmitting ? (
                    <>
                      <Spinner />
                      Sending...
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      )}

      <div className="w-full py-2 text-center">
        <Link
          to="/auth/sign-in"
          search={{ redirect: search.redirect ?? "/" }}
          className="text-foreground text-sm underline underline-offset-4"
        >
          Back to sign in
        </Link>
      </div>
    </Card>
  )
}
