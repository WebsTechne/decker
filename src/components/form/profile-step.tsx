import { Field, FieldError, FieldLabel } from "../ui/field"
import { Button } from "../ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import type { SignUpForm } from "#/routes/auth/sign-up"
import { useQuery } from "@tanstack/react-query"
import { getDepartments } from "#/server/departments"
import { getSchools } from "#/server/schools"
import z from "zod"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../ui/combobox"

export function ProfileStep({
  form,
  onNext,
  onBack,
}: {
  form: SignUpForm
  onNext: () => void
  onBack: () => void
}) {
  const { data: schools = [], isLoading: isLoadingSchools } = useQuery({
    queryKey: ["schools"],
    queryFn: getSchools,
  })

  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  })

  const onNextAction = async () => {
    // touch all fields first so errors show even if untouched
    form.setFieldMeta("schoolId", (prev) => ({ ...prev, isTouched: true }))
    form.setFieldMeta("departmentId", (prev) => ({ ...prev, isTouched: true }))

    const results = await Promise.all([
      form.validateField("schoolId", "submit"),
      form.validateField("departmentId", "submit"),
    ])

    const isValid = results.every((errors) => errors.length === 0)
    if (isValid) onNext()
  }

  return (
    <>
      <form.Field
        name="schoolId"
        validators={{
          onSubmit: z.string().min(1, "Select a school"),
        }}
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid} className="gap-1">
              <FieldLabel htmlFor={field.name}>School</FieldLabel>
              <Combobox
                items={schools}
                value={schools.find((s) => s.id === field.state.value) ?? null}
                itemToStringLabel={(item) => item.name}
                onValueChange={(item) => field.handleChange(item?.id ?? "")}
              >
                <ComboboxInput
                  placeholder="Enter you school's full name"
                  showClear={true}
                />
                <ComboboxContent>
                  <ComboboxEmpty>
                    <Button variant="secondary" onClick={() => {}}>
                      Add school
                    </Button>
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item.id} value={item}>
                        {item.name}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      />

      <form.Field
        name="departmentId"
        validators={{
          onSubmit: z.string().min(1, "Select a department"),
        }}
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid} className="gap-1">
              <FieldLabel htmlFor={field.name}>Department</FieldLabel>
              <Combobox
                items={departments}
                value={departments.find((d) => d.id === field.state.value)}
                itemToStringLabel={(item) => item.name}
                onValueChange={(item) => field.handleChange(item?.id ?? "")}
              >
                <ComboboxInput
                  placeholder="Enter you department"
                  showClear={true}
                />
                <ComboboxContent>
                  <ComboboxEmpty>
                    <Button variant="secondary" onClick={() => {}}>
                      Add department
                    </Button>
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item.id} value={item}>
                        {item.name}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
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
          className="h-10 flex-1 justify-end"
          onClick={onNextAction}
        >
          Next
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="size-6!"
            strokeWidth={2}
          />
        </Button>
      </Field>
    </>
  )
}
