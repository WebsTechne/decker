import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet"
import { Textarea } from "../ui/textarea"
import { Spinner } from "../ui/spinner"
import { toast } from "sonner"
import { authClient } from "#/lib/auth-client"
import { createComment, getComments } from "#/server/comments"
import { formatListTimestamp } from "#/lib/format-timestamp"
import { HugeiconsIcon } from "@hugeicons/react"
import { SentIcon } from "@hugeicons/core-free-icons"
import { useIsMobile } from "#/hooks/use-mobile"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer"
import { Link } from "@tanstack/react-router"

type Comment = {
  id: string
  body: string
  pinned: boolean
  createdAt: Date
  user: {
    username: string
    displayUsername: string | null
    image: string | null
  }
}

function CommentsContent({
  comments,
  isLoading,
}: {
  comments: Comment[]
  isLoading: boolean
}) {
  return (
    <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-1 flex-col gap-4 px-4">
        {isLoading && (
          <div className="flex-center h-20">
            <Spinner className="size-7" />
          </div>
        )}
        {!isLoading && comments.length === 0 && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No comments yet. Be the first!
          </p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3">
            <Link
              to="/u/$username"
              params={{ username: comment.user.username }}
              className="contents"
            >
              <Avatar className="shrink-0">
                {comment.user.image && <AvatarImage src={comment.user.image} />}
                <AvatarFallback>
                  {comment.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm font-medium">
                  {comment.user.displayUsername ?? comment.user.username}
                </span>
                {comment.pinned && (
                  <span className="text-primary text-xs">Author</span>
                )}
                <span className="text-muted-foreground ml-auto text-xs">
                  {formatListTimestamp({
                    createdAt: comment.createdAt,
                    now: new Date(),
                  })}
                </span>
              </div>
              <p className="mt-0.5 text-sm wrap-break-word">{comment.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CommentInput({
  body,
  setBody,
  onSubmit,
  isPending,
}: {
  body: string
  setBody: (val: string) => void
  onSubmit: () => void
  isPending: boolean
}) {
  return (
    <>
      <Textarea
        placeholder="Leave a comment..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="max-h-32 min-h-10 resize-none"
        rows={4}
        onPointerDownCapture={(e) => e.stopPropagation()} // 👈 prevents vaul from intercepting
      />
      <Button
        type="button"
        size="lg"
        onClick={onSubmit}
        disabled={isPending || !body.trim()}
        className="self-end"
      >
        <HugeiconsIcon
          icon={SentIcon}
          strokeWidth={2}
          fill="var(--primary-foreground)"
          className="text-primary size-5!"
        />
        Post
      </Button>
    </>
  )
}

export function CommentsSheet({
  collectionId,
  open,
  onOpenChange,
}: {
  collectionId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: session } = authClient.useSession()
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()
  const [body, setBody] = useState("")

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", collectionId],
    queryFn: () => getComments({ data: { collectionId } }),
    enabled: open, // only fetch when sheet is open
  })

  const mutation = useMutation({
    mutationFn: () => createComment({ data: { collectionId, body } }),
    onSuccess: () => {
      setBody("")
      queryClient.invalidateQueries({ queryKey: ["comments", collectionId] })
      // also update comment count in collection
      queryClient.invalidateQueries({ queryKey: ["collection", collectionId] })
    },
    onError: () => toast.error("Failed to post comment"),
  })

  const handleSubmit = () => {
    if (!body.trim()) return
    mutation.mutate()
  }

  if (isMobile) {
    return (
      <Drawer
        direction="bottom"
        open={open}
        onOpenChange={onOpenChange}
        repositionInputs={false}
      >
        <DrawerContent className="h-[90svh] overflow-hidden">
          <DrawerHeader>
            <DrawerTitle className="text-lg">Comments</DrawerTitle>
          </DrawerHeader>
          <CommentsContent comments={comments} isLoading={isLoading} />
          <DrawerFooter className="sticky bottom-0 flex flex-row! items-center gap-2">
            <CommentInput
              body={body}
              setBody={setBody}
              onSubmit={handleSubmit}
              isPending={mutation.isPending}
            />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-lg">Comments</SheetTitle>
        </SheetHeader>

        {/* comment list */}

        <CommentsContent comments={comments} isLoading={isLoading} />

        {/* input */}
        {session && (
          <SheetFooter className="flex-row! items-center">
            <CommentInput
              body={body}
              setBody={setBody}
              onSubmit={handleSubmit}
              isPending={mutation.isPending}
            />
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
