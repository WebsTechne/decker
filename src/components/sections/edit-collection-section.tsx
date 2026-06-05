import { updateCollection, type CollectionData } from "#/server/collections"
import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "@tanstack/react-form"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "#/components/ui/field"
import { Input } from "#/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "#/components/ui/input-group"
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
import { toast } from "sonner"
import { z } from "zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createTag, getTags } from "#/server/tags"
import { Spinner } from "../ui/spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"
import { useStore } from "@tanstack/react-store"

const formSchema = z.object({
  name: z.string().min(1, "Collection name is required"),
  description: z.string().min(1, "Description is required"),
  tags: z.array(z.string()).min(1, "Select at least one tag"),
  // images: z.array(z.file()).min(1, "Add at least one image"),
})

function EditCollectionSheet({
  collection,
  open,
  onOpenChange,
}: {
  collection: CollectionData
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const maxChars = 200
  const [chars, setChars] = useState(collection.description?.length ?? 0)

  const { data: tags = [], isLoading: isLoadingTags } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  })

  const queryClient = useQueryClient()
  const currentTagIds = collection.tags.map((t) => t.tagId)
  const [selectedTags, setSelectedTags] = useState<typeof tags>([])
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)

  const originalValues = useMemo(
    () => ({
      name: collection.name,
      description: collection.description ?? "",
      tags: collection.tags.map((t) => t.tagId).sort(),
    }),
    [collection],
  )

  const form = useForm({
    defaultValues: {
      name: collection.name,
      description: collection.description ?? "",
      tags: currentTagIds,
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
      toast.loading("Updating collection...", { id: "update-collection-toast" })
      const collectionId = collection.id
      const { name, description, tags: tagIds } = value

      try {
        await updateCollection({
          data: { collectionId, name, description, tagIds },
        })
        toast.dismiss("update-collection-toast")
        toast.success("Collection updated!")
        onOpenChange(false)
        queryClient.invalidateQueries({
          queryKey: ["collections"],
        })
      } catch (err) {
        console.error(err)
        toast.dismiss("update-collection-toast")
        toast.error("Failed to update collection")
      }
    },
  })

  useEffect(() => {
    form.reset({
      name: collection.name,
      description: collection.description ?? "",
      tags: collection.tags.map((t) => t.tagId),
      images: [],
    })
  }, [collection])

  const isDirty = useStore(form.store, (state) => {
    const current = state.values
    return (
      current.name !== originalValues.name ||
      current.description !== originalValues.description ||
      [...current.tags].sort().join() !== originalValues.tags.join()
    )
  })

  useEffect(() => {
    if (tags.length > 0 && collection.tags.length > 0) {
      const matched = tags.filter((t) => currentTagIds.includes(t.id))
      setSelectedTags(matched)
      form.setFieldValue("tags", currentTagIds)
    }
  }, [tags])

  const handleCancel = () => {
    if (isDirty) {
      setConfirmCancelOpen(true)
    } else {
      onOpenChange(false)
    }
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
      toast.dismiss("create-tag-toast")
      toast.success("Tag created")
    } catch (err) {
      toast.dismiss("create-tag-toast")
      toast.error("Failed to create tag.")
      console.error("❌ createTag error:", err)
    }
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(val) => {
          if (!val && isDirty) {
            setConfirmCancelOpen(true)
          } else {
            onOpenChange(val)
          }
        }}
      >
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-full! not-md:max-w-md!"
        >
          <SheetHeader>
            <SheetTitle className="text-lg">Edit Collection</SheetTitle>
            <SheetDescription className="text-base">
              Edit your collection metadata and re-order pages
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="px-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                }}
              >
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
                </FieldGroup>
              </form>
            </div>
          </ScrollArea>

          <SheetFooter>
            <SheetClose
              render={<Button variant="outline" onClick={handleCancel} />}
            >
              Cancel
            </SheetClose>
            <Button
              disabled={!isDirty || form.state.isSubmitting}
              onClick={() => form.handleSubmit()}
            >
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setConfirmCancelOpen(false)
                onOpenChange(false)
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
export { EditCollectionSheet }
