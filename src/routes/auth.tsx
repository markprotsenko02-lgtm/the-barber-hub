import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { LogIn, UserPlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { lovable } from "@/integrations/lovable/index";
import { pendingRoute } from "@/lib/pending-draft";

const afterAuth = () => (pendingRoute() ?? "/") as "/";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceder o crear cuenta — BarberJobs" },
      {
        name: "description",
        content:
          "Inicia sesión o regístrate en BarberJobs con tu nombre, apellidos y correo para publicar tu portfolio u ofertas.",
      },
      { property: "og:title", content: "Acceder o crear cuenta — BarberJobs" },
      {
        property: "og:description",
        content: "Entra en BarberJobs para gestionar tu portfolio u ofertas de barbería.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const inputClass =
  "w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-primary";
const labelClass =
  "mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [mode, setMode] = React.useState<"login" | "signup">("signup");
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function validate() {
    const next: Record<string, string> = {};
    if (mode === "signup") {
      if (form.firstName.trim().length < 2) next["firstName"] = "Escribe tu nombre";
      if (form.lastName.trim().length < 2) next["lastName"] = "Escribe tus apellidos";
      if (form.password.length < 6) next["password"] = "Mínimo 6 caracteres";
      if (form.confirm !== form.password) next["confirm"] = "Las contraseñas no coinciden";
    } else if (form.password.length < 6) {
      next["password"] = "Mínimo 6 caracteres";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next["email"] = "Correo no válido";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              first_name: form.firstName.trim(),
              last_name: form.lastName.trim(),
            },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSent(true);
          toast.success("Cuenta creada. Confirma tu correo para entrar.");
        } else {
          toast.success("¡Cuenta creada!");
          navigate({ to: afterAuth() });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
        toast.success("Sesión iniciada");
        navigate({ to: afterAuth() });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Algo ha fallado";
      toast.error(
        message.includes("Invalid login credentials")
          ? "Correo o contraseña incorrectos"
          : message.includes("already registered")
            ? "Ese correo ya tiene cuenta. Inicia sesión."
            : message,
      );
    } finally {
      setBusy(false);
    }
  }

  async function oauth(provider: "google" | "apple") {
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
      ...(provider === "google" ? { extraParams: { prompt: "select_account" } } : {}),
    });
    if (result.error) {
      toast.error("No se pudo iniciar sesión");
      return;
    }
    if (result.redirected) return;
    toast.success("Sesión iniciada");
    navigate({ to: afterAuth() });
  }

  if (!loading && user) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="surface-panel rounded-2xl p-6 text-center">
          <h1 className="font-display text-2xl uppercase tracking-wide text-foreground">
            Ya has entrado
          </h1>
          <p className="mt-2 break-words text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/"
              className="rounded-lg bg-primary px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-wider text-primary-foreground"
            >
              Ir al muro
            </Link>
            <button
              onClick={() => signOut()}
              className="rounded-lg border border-border px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (sent) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="surface-panel rounded-2xl p-6 text-center">
          <h1 className="font-display text-2xl uppercase tracking-wide text-foreground">
            Revisa tu correo
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Te hemos enviado un enlace a <span className="text-foreground">{form.email}</span>{" "}
            para confirmar la cuenta. Ábrelo y ya podrás iniciar sesión.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-3xl uppercase tracking-wide text-foreground">
        {mode === "signup" ? "Crear cuenta" : "Iniciar sesión"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tu cuenta te permite publicar y editar tu portfolio o tus ofertas.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface/40 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setErrors({});
          }}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 font-display text-[11px] font-semibold uppercase tracking-wider transition-colors ${
            mode === "signup"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserPlus className="h-4 w-4" /> Registrarse
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setErrors({});
          }}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 font-display text-[11px] font-semibold uppercase tracking-wider transition-colors ${
            mode === "login"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LogIn className="h-4 w-4" /> Entrar
        </button>
      </div>

      <div className="mt-4 grid gap-2">
        <button type="button" onClick={() => oauth("google")} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-foreground px-4 py-3 text-sm font-semibold text-background">
          <span className="font-bold">G</span> Continuar con Google
        </button>
        <p className="text-center text-xs text-muted-foreground">o con tu correo</p>
      </div>

      <form onSubmit={onSubmit} className="surface-panel mt-4 space-y-4 rounded-2xl p-5">
        {mode === "signup" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="firstName">
                Nombre
              </label>
              <input
                id="firstName"
                className={inputClass}
                placeholder="Ej: Carlos"
                value={form.firstName}
                onChange={set("firstName")}
              />
              {errors["firstName"] && (
                <p className="mt-1 text-xs text-destructive">{errors["firstName"]}</p>
              )}
            </div>
            <div>
              <label className={labelClass} htmlFor="lastName">
                Apellidos
              </label>
              <input
                id="lastName"
                className={inputClass}
                placeholder="Ej: Méndez Ruiz"
                value={form.lastName}
                onChange={set("lastName")}
              />
              {errors["lastName"] && (
                <p className="mt-1 text-xs text-destructive">{errors["lastName"]}</p>
              )}
            </div>
          </div>
        )}

        <div>
          <label className={labelClass} htmlFor="email">
            Correo (Gmail u otro)
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            placeholder="Ej: carlos.mendez@gmail.com"
            value={form.email}
            onChange={set("email")}
          />
          {errors["email"] && (
            <p className="mt-1 text-xs text-destructive">{errors["email"]}</p>
          )}
        </div>

        <div>
          <label className={labelClass} htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className={inputClass}
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={set("password")}
          />
          {errors["password"] && (
            <p className="mt-1 text-xs text-destructive">{errors["password"]}</p>
          )}
        </div>

        {mode === "signup" && (
          <div>
            <label className={labelClass} htmlFor="confirm">
              Repetir contraseña
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              className={inputClass}
              placeholder="Vuelve a escribir la contraseña"
              value={form.confirm}
              onChange={set("confirm")}
            />
            {errors["confirm"] && (
              <p className="mt-1 text-xs text-destructive">{errors["confirm"]}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-display text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signup" ? "Crear mi cuenta" : "Entrar"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => navigate({ to: "/" })}
        className="mt-3 w-full rounded-lg border border-border px-4 py-3 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary"
      >
        Seguir como invitado
      </button>
    </main>
  );
}
