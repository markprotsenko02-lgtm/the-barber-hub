import * as React from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  shop: z.string().trim().min(2, "Indica el nombre de tu barbería").max(80),
  email: z.string().trim().email("Email no válido").max(255),
  message: z.string().trim().min(10, "Cuéntale algo más de la oferta").max(1000),
});

export function ContactForm({ barberName }: { barberName: string }) {
  const [values, setValues] = React.useState({ shop: "", email: "", message: "" });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setValues({ shop: "", email: "", message: "" });
    toast.success(`Mensaje enviado a ${barberName}`, {
      description: "Te responderá directamente a tu email.",
    });
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-xl border border-border/70 bg-card p-4"
      noValidate
    >
      <h2 className="font-display text-lg uppercase tracking-wide">Contacto rápido</h2>
      <p className="text-xs text-muted-foreground">
        Para barberías interesadas en fichar a {barberName}.
      </p>
      <div>
        <Input
          placeholder="Nombre de la barbería"
          value={values.shop}
          maxLength={80}
          onChange={(e) => setValues((v) => ({ ...v, shop: e.target.value }))}
        />
        {errors["shop"] && <p className="mt-1 text-xs text-destructive">{errors["shop"]}</p>}
      </div>
      <div>
        <Input
          type="email"
          placeholder="Email de contacto"
          value={values.email}
          maxLength={255}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
        {errors["email"] && <p className="mt-1 text-xs text-destructive">{errors["email"]}</p>}
      </div>
      <div>
        <Textarea
          placeholder="Turnos, condiciones, salario…"
          rows={4}
          value={values.message}
          maxLength={1000}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
        />
        {errors["message"] && <p className="mt-1 text-xs text-destructive">{errors["message"]}</p>}
      </div>
      <Button type="submit" className="w-full font-semibold">
        Enviar propuesta
      </Button>
    </form>
  );
}
