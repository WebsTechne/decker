import { useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { authClient } from "#/lib/auth-client"
import { toast } from "sonner"
import { Spinner } from "../ui/spinner"

function useResendVerification(email: string) {
  const [sending, setSending] = useState(false)

  const resend = async () => {
    setSending(true)
    const res = await authClient.sendVerificationEmail({
      email,
      callbackURL: "/",
    })

    if (res.error) {
      toast.error(res.error.message ?? "Couldn't send the email, try again")
    } else {
      toast.success("Verification email sent — check your inbox")
    }
    setSending(false)
  }

  return { resend, sending }
}

// The dismissable dialog for verifying email
const VerifyEmailDialog = ({
  email,
  open,
  onOpenChange,
}: {
  email: string
  open: boolean
  onOpenChange: (val: boolean) => void
}) => {
  const { resend, sending } = useResendVerification(email)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify your email</DialogTitle>
          <DialogDescription>
            Add a verified email so you can recover your account if you ever
            forget your password. Takes 10 seconds — we'll send a link to{" "}
            {email}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="[&_button]:h-10!">
          <DialogClose render={<Button variant="secondary" />}>
            Maybe later
          </DialogClose>
          <Button onClick={resend} disabled={sending}>
            {sending ? (
              <>
                <Spinner />
                Sending...
              </>
            ) : (
              "Resend verification email"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// The alert dialog for verifying email
const VerifyEmailAlertDialog = ({
  email,
  open,
  onOpenChange,
}: {
  email: string
  open: boolean
  onOpenChange: (val: boolean) => void
}) => {
  const { resend, sending } = useResendVerification(email)

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Please verify your email</AlertDialogTitle>
          <AlertDialogDescription>
            To keep your account secure and recoverable, Decker now requires a
            verified email. We've sent a link to {email} — click it to keep
            using Decker.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="[&_button]:h-10!">
          <Button onClick={resend} disabled={sending}>
            {sending ? (
              <>
                <Spinner />
                Sending...
              </>
            ) : (
              "Resend verification email"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { VerifyEmailDialog, VerifyEmailAlertDialog }
