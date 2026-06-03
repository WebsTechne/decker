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
import { ScrollArea } from "../ui/scroll-area"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer"

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

  const Content = () => {
    return (
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
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
          <div key={comment.id} className="flex gap-3">
            <Avatar className="size-8 shrink-0">
              <AvatarImage src={comment.user.image ?? ""} />
              <AvatarFallback>
                {comment.user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm font-medium">
                  {comment.user.username}
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
    )
  }

  if (isMobile) {
    return (
      <Drawer direction="bottom" open={open} onOpenChange={onOpenChange}>
        <DrawerContent lassName="min-h-90">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-lg">Comments</DrawerTitle>
          </DrawerHeader>
          <ScrollArea className="flex-1">
            <Content />
          </ScrollArea>
          <DrawerFooter className="flex flex-row! items-center gap-2">
            <Textarea
              placeholder="Leave a comment..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="max-h-32 min-h-10 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
            <Button
              onClick={handleSubmit}
              disabled={mutation.isPending || !body.trim()}
              className="self-end"
            >
              <HugeiconsIcon icon={SentIcon} strokeWidth={2} />
              Post
            </Button>
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
        <ScrollArea className="flex-1">
          <Content />
        </ScrollArea>

        {/* input */}
        {session && (
          <SheetFooter className="flex-row! items-center">
            <Textarea
              placeholder="Leave a comment..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="max-h-32 min-h-10 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />
            <Button
              onClick={handleSubmit}
              disabled={mutation.isPending || !body.trim()}
              className="self-end"
            >
              <HugeiconsIcon icon={SentIcon} strokeWidth={2} />
              Post
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
