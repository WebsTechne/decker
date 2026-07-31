import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
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
import { Button } from "#/components/ui/button"
import { Spinner } from "#/components/ui/spinner"
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "#/components/ui/input-group"
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons"
import { useState } from "react"

export const Route = createFileRoute("/auth/reset-password/")({
  component: ResetPassword,
  validateSearch: z.object({
    token: z.string().optional(),
    redirect: z.string().optional(),
  }),
})

const schema = z.object({
  password: z.string().min(6, "Password is at least 6 characters"),
})

function ResetPassword() {
  const navigate = useNavigate()
  const { token, redirect } = Route.useSearch()

  const [view, setView] = useState(false)

  const form = useForm({
    defaultValues: { password: "" },
    validators: {
      onSubmit: ({ value }) => {
        const result = schema.safeParse(value)
        if (!result.success)
          return result.error.issues.map((i) => i.message).join(", ")
      },
    },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error("Missing or invalid reset link")
        return
      }

      toast.loading("Resetting password...", { id: "reset-toast" })
      const res = await authClient.resetPassword({
        newPassword: value.password,
        token,
      })

      if (res.error) {
        toast.error(res.error.message ?? "Failed to reset password", {
          id: "reset-toast",
        })
        return
      }

      toast.success("Password reset. Sign in with your new password.", {
        id: "reset-toast",
      })
      navigate({ to: "/auth/sign-in", search: { redirect } })
    },
  })

  if (!token) {
    return (
      <Card size="sm" className="relative z-1000 mt-15 py-6! sm:max-w-md">
        <CardHeader>
          <CardTitle className="text-lg! font-bold">Invalid link</CardTitle>
          <CardDescription>
            This reset link is missing or has expired.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card size="sm" className="relative z-1000 mt-15 py-6! sm:max-w-md">
      <CardHeader>
        <CardTitle className="text-lg! font-bold">Set a new password</CardTitle>
        <CardDescription>
          Choose a new password for your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={(e) => e.preventDefault()}>
          <FieldGroup className="gap-5">
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid} className="gap-1">
                    <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                    <InputGroup className="h-10">
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="New password"
                        autoComplete="new-password"
                        type={!view ? "password" : "text"}
                      />
                      <InputGroupButton onClick={() => setView(!view)}>
                        <HugeiconsIcon
                          icon={!view ? ViewIcon : ViewOffSlashIcon}
                          className="size-5! duration-300"
                        />
                      </InputGroupButton>
                    </InputGroup>
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
                    Resetting...
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
