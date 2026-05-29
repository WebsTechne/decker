import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useForm, type ReactFormExtendedApi } from "@tanstack/react-form"
import { useState } from "react"
import { AccountStep } from "#/components/form/account-step"
import { ProfileStep } from "#/components/form/profile-step"
import { AvatarStep } from "#/components/form/avatar-step"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card"
import { FieldGroup } from "#/components/ui/field"
import { Separator } from "#/components/ui/separator"
import { cn } from "#/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"
import { z } from "zod"
import { Button } from "#/components/ui/button"
import { authClient } from "#/lib/auth-client"
import { toast } from "sonner"
import { uploadAvatar } from "#/lib/upload"
import { updateUserProfile, deleteUser } from "#/server/users"

export const Route = createFileRoute("/auth/sign-up/")({
  component: SignUp,
})

export type SignUpValues = {
  email: string
  username: string
  password: string
  confirmPassword: string
  schoolId: string
  departmentId: string
  image: File | undefined
}

export type SignUpForm = ReactFormExtendedApi<
  SignUpValues,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>

const formSchema = z.object({
  email: z.string().email("Invalid email"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  confirmPassword: z.string().min(1, "You must confirm your password"),
  schoolId: z.string().min(1, "You must select a school"),
  departmentId: z.string().min(1, "You must select a department"),
  image: z.instanceof(File).optional().or(z.undefined()),
})

function SignUp() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      schoolId: "",
      departmentId: "",
      image: undefined as File | undefined,
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
      toast.loading("Signing up...", { id: "sign-up-toast" })

      let userId: string | undefined

      try {
        // 1 Create user (better-auth)
        const res = await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: value.username,
          username: value.username,
          displayUsername: value.username,
        })

        console.log("signUp res:", JSON.stringify(res)) // 👈 add this

        if (!res.data?.user) {
          toast.dismiss("sign-up-toast")
          toast.error(res.error?.message ?? "Failed to create account") // 👈 show actual error
          return
        }

        userId = res.data.user.id
        if (!userId) throw new Error("Signup failed")

        // 2 Upload avatar if provided
        let avatarUrl: string | undefined
        if (value.image) {
          avatarUrl = await uploadAvatar(value.image, userId)
        }

        // 3 Update user profile (school, department, avatar)
        await updateUserProfile({
          data: {
            userId,
            schoolId: value.schoolId,
            departmentId: value.departmentId,
            image: avatarUrl,
          },
        })

        // 4 redirect
        toast.dismiss("sign-up-toast")
        toast.success("Sign up successful")
        navigate({ to: "/" })
      } catch (err) {
        console.error(err)
        // 5 cleanup — delete the created user
        if (userId) await deleteUser({ data: { userId } })

        toast.dismiss("sign-up-toast")
        toast.error("Sign up failed, please try again")
      }
    },
  })

  const Tick = () => (
    <HugeiconsIcon icon={Tick02Icon} size={20} strokeWidth={2} />
  )

  return (
    <>
      <section className="relative z-1000 flex h-15 w-full items-center gap-5 px-5 sm:max-w-md">
        <span
          className={cn("flex-center size-6 rounded-full select-none", {
            "bg-primary text-primary-foreground": step === 1,
            "bg-amber-200 text-gray-800 dark:bg-amber-300": step > 1,
          })}
        >
          {step === 1 ? 1 : <Tick />}
        </span>
        <Separator className="flex-1" />
        <span
          className={cn("flex-center size-6 rounded-full select-none", {
            "bg-muted text-muted-foreground": step < 2,
            "bg-primary text-primary-foreground": step === 2,
            "bg-amber-200 text-gray-800 dark:bg-amber-300": step > 2,
          })}
        >
          {step <= 2 ? 2 : <Tick />}
        </span>
        <Separator className="flex-1" />
        <span
          className={cn("flex-center size-6 rounded-full select-none", {
            "bg-muted text-muted-foreground": step < 3,
            "bg-primary text-primary-foreground": step === 3,
          })}
        >
          {step <= 3 ? 3 : <Tick />}
        </span>
      </section>

      <Card size="sm" className="relative z-1000 py-6! sm:max-w-md">
        <CardHeader>
          {step === 3 && (
            <CardAction>
              <Button
                variant="link"
                className="h-max! px-0! py-0!"
                disabled={form.state.isSubmitting}
                onClick={() => {
                  form.setFieldValue("image", undefined)
                  form.handleSubmit()
                }}
              >
                {form.state.isSubmitting ? "Submitting..." : "Skip"}
              </Button>
            </CardAction>
          )}

          <CardTitle className="text-lg! font-bold">
            Sign Up to Decker
          </CardTitle>
          <CardDescription>
            Sign up to Decker for the best experience. You get free access to
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
              {step === 1 && (
                <AccountStep form={form} onNext={() => setStep(2)} />
              )}

              <div className={step === 2 ? "contents" : "hidden"}>
                <ProfileStep
                  form={form}
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              </div>

              {step === 3 && (
                <AvatarStep
                  form={form}
                  onBack={() => setStep(2)}
                  onSubmit={() => form.handleSubmit()}
                  isSubmitting={form.state.isSubmitting}
                />
              )}
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* <section className="fixed top-0 right-0 hidden h-dvh w-[calc(100%-448px)] overflow-clip sm:block">
        <img
          src="/robert-anasch-McX3XuJRsUM-unsplash.jpg"
          alt=""
          className="size-full object-cover"
        />
        <div className="from-background to-background/20 absolute inset-0 bg-linear-to-r bg-blend-overlay" />
      </section> */}
    </>
  )
}
