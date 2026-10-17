import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/privacidad")({
  component: PrivacidadPage,
  head: () => ({
    meta: [
      { title: "Política de privacidad — BarberJobs" },
      {
        name: "description",
        content:
          "Qué datos guarda BarberJobs, para qué los usa, cuánto tiempo y cómo ejercer tus derechos (RGPD).",
      },
      { property: "og:title", content: "Política de privacidad — BarberJobs" },
      {
        property: "og:description",
        content: "Cómo tratamos tus datos en barberjobs.es y cómo pedir que se borren.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://barberjobs.es/privacidad" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://barberjobs.es/privacidad" }],
  }),
});

function S({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8 border-t border-border/60 pt-6">
      <h2 className="font-display text-lg font-semibold uppercase tracking-wider text-primary">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function PrivacidadPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <h1 className="font-display text-3xl font-semibold uppercase">Política de privacidad</h1>
      </div>

      <S title="Responsable">
        <p>
          Mark Protsenko (NIE Y4412673E), Calle Luis Berlanga Martí 11, 46023 Valencia. Contacto:{" "}
          <a className="text-primary underline" href="mailto:markprotsenko02@gmail.com">
            markprotsenko02@gmail.com
          </a>
          .
        </p>
      </S>
      <S title="Qué datos guardamos">
        <p>
          Al registrarte: nombre, apellidos, email y contraseña (cifrada). Al publicar: nombre de la
          barbería o del barbero, ciudad, barrio, sueldo, WhatsApp, email opcional, fotos y textos
          que tú escribas. También guardamos de forma anónima visitas y toques en los botones de
          contacto, y estadísticas de Google Analytics solo si aceptas las cookies.
        </p>
      </S>
      <S title="Para qué los usamos">
        <p>
          Para mostrar tu portfolio u oferta en el muro, permitir que otros usuarios registrados te
          contacten, moderar contenido, avisarte de nuevas publicaciones si lo pides y mejorar la
          web. No vendemos tus datos ni los cedemos a terceros para publicidad.
        </p>
      </S>
      <S title="Base legal">
        <p>
          Tu consentimiento al registrarte y publicar, y la prestación del servicio que nos pides
          (art. 6.1 a) y b) RGPD).
        </p>
      </S>
      <S title="Cuánto tiempo">
        <p>
          Mientras tengas la cuenta abierta. Si la borras, eliminamos tu cuenta, portfolio y ofertas
          al momento.
        </p>
      </S>
      <S title="Quién nos ayuda">
        <p>
          Alojamiento y base de datos en proveedores en la nube con garantías del RGPD, Google
          (inicio de sesión y estadísticas) y WhatsApp cuando tú pulsas para contactar.
        </p>
      </S>
      <S title="Tus derechos">
        <p>
          Puedes acceder, corregir, borrar, oponerte, limitar o llevarte tus datos. Puedes editar tu
          publicación y borrar tu cuenta tú mismo desde{" "}
          <Link to="/panel" className="text-primary underline">
            tu panel
          </Link>
          , o escribirnos al email de arriba. Si no te atendemos bien, puedes reclamar ante la
          Agencia Española de Protección de Datos (aepd.es).
        </p>
      </S>
    </main>
  );
}
