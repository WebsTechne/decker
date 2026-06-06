import {
  createFileRoute,
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"
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
import { z } from "zod"
import { Spinner } from "#/components/ui/spinner"
import { Button } from "#/components/ui/button"
import { Input } from "#/components/ui/input"
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "#/components/ui/input-group"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons"
import { authClient } from "#/lib/auth-client"

export const Route = createFileRoute("/auth/sign-in/")({
  component: SignIn,
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
})

const formSchema = z.object({
  usernameEmail: z.string().min(1, "Provide your username or email"),
  password: z.string().min(6, "Password is at least 6 characters"),
})

function SignIn() {
  const navigate = useNavigate()
  const search = Route.useSearch()
  const routerState = useRouterState()

  const [error, setError] = useState("")
  const [view, setView] = useState(false)

  const form = useForm({
    defaultValues: {
      usernameEmail: "",
      password: "",
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = formSchema.safeParse(value)
        if (!result.success) {
          return result.error.issues.map((i) => i.message).join(", ")
        }
      },
    },
    onSubmit: async ({ value }) => {
      setError("")
      toast.loading("Signing in...", { id: "sign-in-toast" })

      try {
        // To check whether input is email or username
        const isEmail = value.usernameEmail.includes("@")

        const res = isEmail
          ? await authClient.signIn.email({
              email: value.usernameEmail,
              password: value.password,
            })
          : await authClient.signIn.username({
              username: value.usernameEmail,
              password: value.password,
            })

        if (res.error) {
          toast.dismiss("sign-in-toast")
          toast.error(res.error.message ?? "Failed to sign in")
          switch (res.error.code) {
            case "INVALID_EMAIL_OR_PASSWORD":
              setError("Incorrect username/email or password.")
              return
            default:
              setError(res.error.message ?? "Failed to sign in.")
              return
          }
        }

        toast.dismiss("sign-in-toast")
        toast.success("Sign in successful")
        navigate({ to: search.redirect ?? "/" })
      } catch (err) {
        console.error(err)
        toast.dismiss("sign-in-toast")
        toast.error("Sign in failed, please try again")
      }
    },
  })

  return (
    <>
      <Card size="sm" className="relative z-1000 mt-15 py-6! sm:max-w-md">
        <CardHeader>
          <CardTitle className="text-lg! font-bold">
            Sign In to Decker
          </CardTitle>
          <CardDescription>
            Sign in to Decker for the best experience. You get free access to
            all features.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <FieldGroup className="gap-5">
              <form.Field
                name="usernameEmail"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid} className="gap-1">
                      <FieldLabel htmlFor={field.name}>
                        Username or Email
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name="username"
                        type="text"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder=""
                        autoComplete="username"
                        className="h-10"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  )
                }}
              />

              <form.Field
                name="password"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid} className="gap-1">
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <InputGroup className="h-10">
                        <InputGroupInput
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="********"
                          autoComplete="current-password"
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

              {error && (
                <Field>
                  <FieldError className="text-center">{error}</FieldError>
                </Field>
              )}

              <Field>
                <Button
                  type="button"
                  className="h-10"
                  onClick={() => form.handleSubmit()}
                >
                  {form.state.isSubmitting ? (
                    <>
                      <Spinner />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <div className="w-full py-4 sm:max-w-md">
        <p className="text-muted-foreground text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            to="/auth/sign-up"
            search={{ redirect: routerState.location.href }}
            className="text-foreground underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </div>
    </>
  )
}
