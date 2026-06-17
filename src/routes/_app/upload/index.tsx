import { DropZone } from "#/components/form/drop-zone"
import { Button } from "#/components/ui/button"
import {
  CardContent,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "#/components/ui/combobox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "#/components/ui/field"
import { Input } from "#/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "#/components/ui/input-group"
import { ScrollArea } from "#/components/ui/scroll-area"
import { Spinner } from "#/components/ui/spinner"
import { uploadPages } from "#/lib/pages/upload"
import { createCollection, deleteCollection } from "#/server/collections"
import { createPages } from "#/server/pages"
import { createTag, getTags } from "#/server/tags"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useForm } from "@tanstack/react-form"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"

export const Route = createFileRoute("/_app/upload/")({
  component: UploadPage,
})

const formSchema = z.object({
  name: z.string().min(1, "Collection name is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).min(1, "Select at least one tag"),
  images: z.array(z.file()).min(1, "Add at least one image"),
})

function UploadPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const maxChars = 200
  const [chars, setChars] = useState(0)
  const [step, setStep] = useState(1)

  const { data: tags = [], isLoading: isLoadingTags } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  })
  const [selectedTags, setSelectedTags] = useState<typeof tags>([])

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      tags: [] as string[],
      images: [] as File[],
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
      toast.loading("Creating collection...", { id: "upload-toast" })
      let collectionId: string | undefined

      try {
        // 1 Create collection in DB
        const collection = await createCollection({
          data: {
            name: value.name,
            description: value.description,
            tagIds: value.tags,
          },
        })

        // 2 Upload pages with progress
        let uploadedCount = 0
        const pages = await uploadPages(
          value.images,
          collection.id,
          0,
          (uploaded, total) => {
            uploadedCount = uploaded
            toast.loading(`Uploading ${uploaded} of ${total} pages...`, {
              id: "upload-toast",
            })
          },
        )

        // 3 Save page records to DB
        await createPages({
          data: {
            collectionId: collection.id,
            pages: pages.map(({ url, position, width, height }) => ({
              imageUrl: url,
              position,
              width,
              height,
            })),
          },
        })

        collectionId = collection.id

        toast.success("Collection created!", { id: "upload-toast" })
        navigate({ to: `/collections/${collection.id}` })
      } catch (err) {
        console.error(err)
        if (collectionId) {
          await deleteCollection({ data: { collectionId } })
        }
        toast.error("Failed to create collection", { id: "upload-toast" })
      }
    },
  })

  const onBackAction = () => {
    setStep(1)
  }
  const onNextAction = async () => {
    form.setFieldMeta("name", (prev) => ({ ...prev, isTouched: true }))
    form.setFieldMeta("description", (prev) => ({ ...prev, isTouched: true }))
    form.setFieldMeta("tags", (prev) => ({ ...prev, isTouched: true }))

    const results = await Promise.all([
      form.validateField("name", "submit"),
      form.validateField("description", "submit"),
      form.validateField("tags", "submit"),
    ])

    const isValid = results.every((errors) => errors.length === 0)
    if (isValid) setStep(2)
  }

  const onSubmitAction = async () => {
    form.setFieldMeta("images", (prev) => ({ ...prev, isTouched: true }))

    const results = await Promise.all([form.validateField("images", "submit")])

    const isValid = results.every((errors) => errors.length === 0)
    if (isValid) form.handleSubmit()
  }

  const anchor = useComboboxAnchor()
  const comboboxChipsInputRef = useRef<HTMLInputElement | null>(null)

  const handleCreateTag = async () => {
    toast.loading("Creating tag...", { id: "create-tag-toast" })
    try {
      await createTag({
        data: { tag: comboboxChipsInputRef.current?.value ?? "" },
      })
      queryClient.invalidateQueries({ queryKey: ["tags"] })
      toast.success("Tag created", { id: "create-tag-toast" })
    } catch (err) {
      toast.error("Failed to create tag.", { id: "create-tag-toast" })
      console.error("❌ createTag error:", err)
    }
  }

  return (
    <section className="flex h-auto flex-col gap-10 md:grid md:h-[calc(100dvh-48px)] md:grid-cols-[2fr_3fr] md:gap-4 md:overflow-clip">
      <ScrollArea className="h-full md:flex-1">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-lg! font-bold">New Collection</CardTitle>
            <CardDescription>
              {step === 1 ? "Collection metadata" : "Upload images"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
              }}
            >
              {step === 1 ? (
                <FieldGroup className="gap-5">
                  <form.Field
                    name="name"
                    validators={{
                      onSubmit: z
                        .string()
                        .min(1, "Collection name is required"),
                    }}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid} className="gap-1">
                          <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="text"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="MTH202 - Elementary Differential"
                            autoComplete="off"
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
                    name="description"
                    validators={{
                      onSubmit: z.string().min(1, "Description is required"),
                    }}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid} className="gap-1">
                          <FieldLabel htmlFor={field.name}>
                            Description
                          </FieldLabel>
                          <InputGroup>
                            <InputGroupTextarea
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              maxLength={maxChars}
                              aria-invalid={isInvalid}
                              placeholder="Notes on the topic of..."
                              autoComplete="off"
                              onChange={(e) => {
                                setChars(e.target.value.trim().length)
                                field.handleChange(e.target.value)
                              }}
                              // className="h-10"
                            ></InputGroupTextarea>

                            <InputGroupAddon align="block-end">
                              <InputGroupText className="gap-0">
                                <span
                                  className={
                                    chars >= maxChars - 10 ? "text-red-500" : ""
                                  }
                                >
                                  {chars}
                                </span>
                                /{maxChars}
                              </InputGroupText>
                            </InputGroupAddon>
                          </InputGroup>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      )
                    }}
                  />

                  <form.Field
                    name="tags"
                    validators={{
                      onSubmit: ({ value }) =>
                        value.length === 0
                          ? "Select at least one tag"
                          : undefined,
                    }}
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid} className="gap-1">
                          <FieldLabel htmlFor={field.name}>Tags</FieldLabel>
                          <Combobox
                            multiple
                            items={tags}
                            value={selectedTags}
                            itemToStringLabel={(tag) => tag.name}
                            autoHighlight
                            onValueChange={(selected) => {
                              const typed = selected
                              setSelectedTags(typed)
                              field.handleChange(typed.map((tag) => tag.id))
                            }}
                          >
                            <ComboboxChips
                              ref={anchor}
                              className="min-h-10 w-full"
                            >
                              <ComboboxValue>
                                {(values) => (
                                  <>
                                    {values.map(
                                      (tag: (typeof tags)[number]) => (
                                        <ComboboxChip key={tag.id}>
                                          {tag.name}
                                        </ComboboxChip>
                                      ),
                                    )}
                                    <ComboboxChipsInput
                                      ref={comboboxChipsInputRef}
                                    />
                                  </>
                                )}
                              </ComboboxValue>
                            </ComboboxChips>
                            <ComboboxContent anchor={anchor}>
                              {isLoadingTags ? (
                                <ComboboxList>
                                  <div className="flex-center h-25 w-full">
                                    <Spinner />
                                  </div>
                                </ComboboxList>
                              ) : (
                                <>
                                  <ComboboxEmpty>
                                    <Button
                                      variant="secondary"
                                      onClick={handleCreateTag}
                                    >
                                      Add tag
                                    </Button>
                                  </ComboboxEmpty>
                                  <ComboboxList>
                                    {(tag) => (
                                      <ComboboxItem key={tag.id} value={tag}>
                                        {tag.name}
                                      </ComboboxItem>
                                    )}
                                  </ComboboxList>
                                </>
                              )}
                            </ComboboxContent>
                          </Combobox>
                        </Field>
                      )
                    }}
                  />

                  <Field orientation="horizontal" className="gap-5">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-10 flex-1"
                      nativeButton={false}
                      render={<Link to="/" />}
                    >
                      Cancel
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
                </FieldGroup>
              ) : (
                <></>
              )}
              <div className={step === 2 ? "contents" : "hidden"}>
                <FieldGroup className="gap-5">
                  <form.Field
                    name="images"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid
                      return (
                        <Field data-invalid={isInvalid} className="gap-1">
                          <DropZone
                            onFiles={(files) => field.handleChange(files)}
                            multiple
                          />
                          <FieldDescription>
                            You can always re-order your collection later.
                          </FieldDescription>
                          {isInvalid && (
                            <FieldError errors={field.state.meta.errors} />
                          )}
                        </Field>
                      )
                    }}
                  />

                  <Field orientation="horizontal" className="gap-5">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-10 flex-1 justify-start"
                      onClick={onBackAction}
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
                      onClick={onSubmitAction}
                    >
                      {form.state.isSubmitting ? (
                        <>
                          <Spinner /> Creating...
                        </>
                      ) : (
                        "Create"
                      )}
                    </Button>
                  </Field>
                </FieldGroup>
              </div>
            </form>
          </CardContent>
        </Card>
      </ScrollArea>
      <ScrollArea className="h-full md:flex-1">
        <FieldSet>
          <FieldTitle className="font-heading text-lg! font-bold">
            Preview
          </FieldTitle>
          <FieldGroup className=""></FieldGroup>
        </FieldSet>
      </ScrollArea>
    </section>
  )
}
