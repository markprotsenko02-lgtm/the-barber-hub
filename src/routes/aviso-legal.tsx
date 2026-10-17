import { createFileRoute, Link } from "@tanstack/react-router";
import { Scale } from "lucide-react";

export const Route = createFileRoute("/aviso-legal")({
  component: AvisoLegalPage,
  head: () => ({
    meta: [
      { title: "Aviso legal — BarberJobs" },
      {
        name: "description",
        content:
          "Aviso legal de barberjobs.es: titular de la web, condiciones de uso, protección de datos y contacto.",
      },
      { property: "og:title", content: "Aviso legal — BarberJobs" },
      {
        property: "og:description",
        content:
          "Quién está detrás de BarberJobs y qué reglas y derechos aplicamos a los datos de la web.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://barberjobs.es/aviso-legal" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "canonical", href: "https://barberjobs.es/aviso-legal" },
    ],
  }),
});

const TITULAR = {
  nombre: "Mark Protsenko",
  nif: "NIE: Y4412673E",
  domicilio: "Calle Luis Berlanga Martí 11, 46023 Valencia (España)",
  email: "markprotsenko02@gmail.com",
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-border/60 pt-6 first-of-type:mt-0 first-of-type:border-0 first-of-type:pt-0">
      <h2 className="font-display text-lg font-semibold uppercase tracking-wider text-primary">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function AvisoLegalPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
          <Scale className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold uppercase tracking-wider text-foreground sm:text-3xl">
            Aviso legal
          </h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            barberjobs.es
          </p>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Esta página cumple el artículo 10 de la Ley 34/2002 (LSSI-CE) y explica
        quién está detrás de BarberJobs, qué puedes hacer en la web y qué hacemos
        con tus datos.
      </p>

      <div className="mt-8">
        <Section title="1. Datos del titular">
          <p className="text-foreground">
            <span className="font-semibold">{TITULAR.nombre}</span>
            <br />
            {TITULAR.nif}
            <br />
            {TITULAR.domicilio}
            <br />
            Contacto:{" "}
            <a
              className="text-primary underline underline-offset-4"
              href={`mailto:${TITULAR.email}`}
            >
              {TITULAR.email}
            </a>
          </p>
          <p>
            Titular y responsable del sitio web barberjobs.es, una plataforma
            que muestra portfolios de barberos y ofertas de barberías en España.
          </p>
        </Section>

        <Section title="2. Qué es BarberJobs">
          <p>
            BarberJobs es un escaparate donde los barberos publican su trabajo y
            las barberías publican que buscan personal. No somos una agencia de
            contratación ni una empresa de trabajo temporal: no intervenimos en
            las conversaciones, negociaciones o contratos que se firmen entre
            barbero y barbería.
          </p>
        </Section>

        <Section title="3. Condiciones de uso">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Publicar es gratuito durante la promoción de las primeras 100
              barberías; la plataforma puede cambiar sus condiciones avisando
              con antelación.
            </li>
            <li>
              Eres responsable de que lo que publicas sea tuyo o esté
              autorizado: fotos de cortes, textos y datos de contacto.
            </li>
            <li>
              Está prohibido publicar contenido ilegal, discriminatorio,
              violento, sexualmente explícito o que suplante a otra persona o
              negocio.
            </li>
            <li>
              Podemos retirar o corregir cualquier anuncio o portfolio que
              incumpla estas reglas o que se señale con el botón «Reportar».
            </li>
          </ul>
        </Section>

        <Section title="4. Responsabilidad">
          <p>
            BarberJobs no garantiza la veracidad de los anuncios ni de los
            portfolios, ni la disponibilidad de las personas que aparecen. El
            contacto, la entrevista y cualquier acuerdo se hacen directamente
            entre las partes, bajo su propia responsabilidad.
          </p>
        </Section>

        <Section title="5. Protección de datos">
          <p>
            Los datos que nos facilitas (nombre, email, teléfono de contacto,
            fotos y la información de tu anuncio) se usan solo para que la
            plataforma funcione: mostrar tu perfil u oferta, permitir el
            contacto entre usuarios registrados y avisarte de novedades si te
            suscribes a los avisos.
          </p>
          <p>
            La base legal es tu consentimiento al registrarte y el interés
            legítimo en mantener la plataforma operativa. No vendemos tus datos
            ni los cedemos a terceros salvo obligación legal o a los proveedores
            necesarios para prestar el servicio (alojamiento y correo).
          </p>
          <p>
            Puedes acceder, rectificar, pedir el borrado de tus datos, oponerte
            a su tratamiento o reclamar ante la Agencia Española de Protección
            de Datos escribiendo a{" "}
            <a
              className="text-primary underline underline-offset-4"
              href={`mailto:${TITULAR.email}`}
            >
              {TITULAR.email}
            </a>
            . Si borras tu cuenta, tus anuncios y fotos dejan de mostrarse.
          </p>
        </Section>

        <Section title="6. Menores de edad">
          <p>
            Para registrar una cuenta y publicar un portfolio u oferta hay que
            tener 18 años. Si tienes menos de 18, necesitas el permiso de tu
            padre, madre o tutor legal antes de registrarte, y ese permiso debe
            poder acreditarse si lo pedimos.
          </p>
        </Section>

        <Section title="7. Cookies">
          <p>
            Usamos cookies técnicas necesarias para que la web funcione y
            guardamos en tu dispositivo tus preferencias de avisos. También
            usamos Google Analytics para saber cuántas personas visitan la web y
            desde dónde; esa cookie solo se instala si aceptas las cookies al
            entrar. Puedes borrarlas desde la configuración de tu navegador.
          </p>
        </Section>

        <Section title="8. Propiedad intelectual">
          <p>
            Las fotos y textos que publicas siguen siendo tuyos. Nos concedes
            únicamente el permiso de mostrarlos en BarberJobs para que las
            barberías y barberos puedan verte.
          </p>
        </Section>

        <Section title="9. Legislación aplicable">
          <p>
            Este aviso se rige por la legislación española. Para cualquier
            incidencia puedes escribir a{" "}
            <a
              className="text-primary underline underline-offset-4"
              href={`mailto:${TITULAR.email}`}
            >
              {TITULAR.email}
            </a>
            .
          </p>
        </Section>
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-border/60 pt-6">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Volver al inicio
        </Link>
        <span className="text-xs text-muted-foreground">
          Última revisión: octubre de 2026
        </span>
      </div>
    </main>
  );
}
