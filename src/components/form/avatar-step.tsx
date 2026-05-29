import { Field, FieldDescription, FieldError } from "../ui/field"
import { Button } from "../ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import type { SignUpForm } from "#/routes/auth/sign-up"
import { DropZone } from "./drop-zone"
import { Spinner } from "../ui/spinner"

export function AvatarStep({
  form,
  onBack,
  onSubmit,
  isSubmitting,
}: {
  form: SignUpForm
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}) {
  return (
    <>
      <form.Field
        name="image"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid} className="gap-1">
              <DropZone
                onFiles={(files) => field.handleChange(files[0])}
                onClear={() => field.handleChange(undefined)}
                preview={field.state.value}
              />
              <FieldDescription>
                We recommend uploading a square image
              </FieldDescription>
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
        <Button
          type="button"
          className="h-10 flex-1"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {!isSubmitting ? (
            "Submit"
          ) : (
            <>
              <Spinner />
              Submitting...
            </>
          )}
        </Button>
      </Field>
    </>
  )
}
