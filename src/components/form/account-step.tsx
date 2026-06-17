import { Input } from "../ui/input"
import { Button } from "../ui/button"
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "../ui/input-group"
import { Field, FieldLabel, FieldError } from "../ui/field"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DiceFaces05Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import type { SignUpForm } from "#/routes/auth/sign-up"
import z from "zod"
import { generateUsername } from "#/lib/name"

export function AccountStep({
  form,
  onNext,
}: {
  form: SignUpForm
  onNext: () => void
}) {
  const [view, setView] = useState(false)
  const [confirmView, setConfirmView] = useState(false)

  const onNextAction = async () => {
    // touch all fields first so errors show even if untouched
    form.setFieldMeta("email", (prev) => ({ ...prev, isTouched: true }))
    form.setFieldMeta("username", (prev) => ({ ...prev, isTouched: true }))
    form.setFieldMeta("password", (prev) => ({ ...prev, isTouched: true }))
    form.setFieldMeta("confirmPassword", (prev) => ({
      ...prev,
      isTouched: true,
    }))

    const results = await Promise.all([
      form.validateField("email", "submit"),
      form.validateField("username", "submit"),
      form.validateField("password", "submit"),
      form.validateField("confirmPassword", "submit"),
    ])

    const isValid = results.every((errors) => errors.length === 0)
    if (isValid) onNext()
  }

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
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="user@example.com"
                autoComplete="email"
                className="h-10"
                type="email"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    onNextAction()
                  }
                }}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      />

      <form.Field
        name="username"
        validators={{
          onSubmit: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(20, "Username must be at most 20 characters")
            .regex(
              /^[a-zA-Z0-9._-]+$/,
              "Only letters, numbers, dots, hyphens and underscores",
            ),
        }}
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid} className="gap-1">
              <FieldLabel htmlFor={field.name}>Username</FieldLabel>
              <InputGroup className="h-10">
                <InputGroupInput
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="user.name_"
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      onNextAction()
                    }
                  }}
                />
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <InputGroupButton
                        className="active:[&_svg]:rotate-360 active:[&_svg]:duration-300"
                        onClick={() => field.handleChange(generateUsername())}
                      />
                    }
                  >
                    <HugeiconsIcon icon={DiceFaces05Icon} className="size-5!" />
                  </TooltipTrigger>
                  <TooltipContent>Generate Username</TooltipContent>
                </Tooltip>
              </InputGroup>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      />

      <form.Field
        name="password"
        validators={{
          onSubmit: z.string().min(6, "Password must be at least 6 characters"),
        }}
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
                  autoComplete="new-password"
                  type={!view ? "password" : "text"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      onNextAction()
                    }
                  }}
                />
                <InputGroupButton onClick={() => setView(!view)}>
                  <HugeiconsIcon
                    icon={!view ? ViewIcon : ViewOffSlashIcon}
                    className="size-5! duration-300"
                  />
                </InputGroupButton>
              </InputGroup>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      />

      <form.Field
        name="confirmPassword"
        validators={{
          onSubmit: ({ value, fieldApi }) => {
            const password = fieldApi.form.getFieldValue("password")
            if (value !== password) return "Passwords do not match"
          },
        }}
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid
          return (
            <Field data-invalid={isInvalid} className="gap-1">
              <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
              <InputGroup className="h-10">
                <InputGroupInput
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="********"
                  autoComplete="new-password"
                  type={!confirmView ? "password" : "text"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      onNextAction()
                    }
                  }}
                />
                <InputGroupButton onClick={() => setConfirmView(!confirmView)}>
                  <HugeiconsIcon
                    icon={!confirmView ? ViewIcon : ViewOffSlashIcon}
                    className="size-5! duration-300"
                  />
                </InputGroupButton>
              </InputGroup>
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      />

      <Field>
        <Button type="button" className="h-10" onClick={onNextAction}>
          Next
        </Button>
      </Field>
    </>
  )
}
