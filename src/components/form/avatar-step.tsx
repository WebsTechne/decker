import { Field, FieldError, FieldLabel } from "../ui/field"
import { Button } from "../ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import type { SignUpForm } from "#/routes/auth/sign-up"
import { z } from "zod"
import { DropZone } from "./drop-zone"

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
      <form.Field
        name="email"
        validators={{
          onSubmit: z.string().email("Invalid email"),
        }}
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid} className="gap-1">
              <DropZone />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      />

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
