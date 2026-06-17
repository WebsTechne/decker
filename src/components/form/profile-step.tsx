import { Field, FieldError, FieldLabel } from "../ui/field"
import { Button } from "../ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import type { SignUpForm } from "#/routes/auth/sign-up"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createDepartment, getDepartments } from "#/server/departments"
import { createSchool, getSchools } from "#/server/schools"
import z from "zod"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../ui/combobox"
import { Spinner } from "../ui/spinner"
import { useRef } from "react"
import { toast } from "sonner"

export function ProfileStep({
  form,
  onNext,
  onBack,
}: {
  form: SignUpForm
  onNext: () => void
  onBack: () => void
}) {
  const queryClient = useQueryClient()

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

  const schoolInputRef = useRef<HTMLInputElement | null>(null)
  const departmentInputRef = useRef<HTMLInputElement | null>(null)

  const handleCreateSchool = async () => {
    toast.loading("Adding school...", { id: "create-school-toast" })
    try {
      await createSchool({
        data: { school: schoolInputRef.current?.value ?? "" },
      })
      queryClient.invalidateQueries({ queryKey: ["schools"] })
      toast.success("School added", { id: "create-school-toast" })
    } catch (err) {
      toast.error("Failed to add school.", { id: "create-school-toast" })
      console.error("❌ createSchool error:", err)
    }
  }
  const handleCreateDepartment = async () => {
    toast.loading("Adding department...", { id: "create-department-toast" })
    try {
      await createDepartment({
        data: { department: departmentInputRef.current?.value ?? "" },
      })
      queryClient.invalidateQueries({ queryKey: ["departments"] })
      toast.success("Department added", { id: "create-school-toast" })
    } catch (err) {
      toast.error("Failed to add department.", { id: "create-school-toast" })
      console.error("❌ createDepartment error:", err)
    }
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
                autoHighlight
              >
                <ComboboxInput
                  ref={schoolInputRef}
                  placeholder="Enter you school's full name"
                  showClear={true}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      onNextAction()
                    }
                  }}
                />
                <ComboboxContent>
                  <ComboboxEmpty>
                    <Button variant="secondary" onClick={handleCreateSchool}>
                      Add school
                    </Button>
                  </ComboboxEmpty>
                  <ComboboxList>
                    {isLoadingSchools ? (
                      <div className="flex-center h-25 w-full">
                        <Spinner />
                      </div>
                    ) : (
                      (item) => (
                        <ComboboxItem key={item.id} value={item}>
                          {item.name}
                        </ComboboxItem>
                      )
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
                value={
                  departments.find((d) => d.id === field.state.value) ?? null
                }
                itemToStringLabel={(item) => item.name}
                onValueChange={(item) => field.handleChange(item?.id ?? "")}
                autoHighlight
              >
                <ComboboxInput
                  ref={departmentInputRef}
                  placeholder="Enter you department"
                  showClear={true}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      onNextAction()
                    }
                  }}
                />
                <ComboboxContent>
                  <ComboboxEmpty>
                    <Button
                      variant="secondary"
                      onClick={handleCreateDepartment}
                    >
                      Add department
                    </Button>
                  </ComboboxEmpty>
                  <ComboboxList>
                    {isLoadingDepartments ? (
                      <div className="flex-center h-25 w-full">
                        <Spinner />
                      </div>
                    ) : (
                      (item) => (
                        <ComboboxItem key={item.id} value={item}>
                          {item.name}
                        </ComboboxItem>
                      )
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
