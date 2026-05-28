import type { useForm } from "@tanstack/react-form"
import { Field } from "../ui/field"
import { Button } from "../ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import type { SignUpForm } from "#/routes/auth/sign-up"

export function AvatarStep({
  form,
  onBack,
  onSubmit,
}: {
  form: SignUpForm
  onBack: () => void
  onSubmit: () => void
}) {
  return (
    <>
      <Field orientation="horizontal" className="gap-5">
        <Button
          type="button"
          variant="secondary"
          className="h-10 flex-1 justify-start"
          onClick={onBack}
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            className="size-6!"
            strokeWidth={2}
          />
          Back
        </Button>
        <Button type="button" className="h-10 flex-1" onClick={onSubmit}>
          Submit
        </Button>
      </Field>
    </>
  )
}
