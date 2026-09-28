import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Lock, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Wraps contact/report actions. Guests (not signed in) get a notice that
 * they must register or sign in, plus a button to do so.
 */
export function AuthGate({ children, className }: { children: React.ReactNode; className?: string | undefined }) {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);

  function intercept(e: React.SyntheticEvent) {
    if (user) return;
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }

  return (
    <>
      <div className={className} onClickCapture={intercept} onSubmitCapture={intercept} onFocusCapture={(e) => {
        if (!user && (e.target as HTMLElement).tagName !== "BUTTON" && (e.target as HTMLElement).tagName !== "A") {
          (e.target as HTMLElement).blur();
          setOpen(true);
        }
      }}>
        {children}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display uppercase tracking-wide">
              <Lock className="h-5 w-5 text-primary" /> Solo para usuarios registrados
            </DialogTitle>
            <DialogDescription>
              Para contactar con barberos o barberías necesitas registrarte o iniciar sesión.
            </DialogDescription>
          </DialogHeader>
          <Button asChild className="w-full font-semibold">
            <Link to="/auth" onClick={() => setOpen(false)}>
              <LogIn className="h-4 w-4" /> Entrar / Registrarse
            </Link>
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
