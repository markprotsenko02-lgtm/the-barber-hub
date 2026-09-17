import { Lightbulb, Check } from "lucide-react";

export function TipsPanel({
  title,
  intro,
  tips,
}: {
  title: string;
  intro: string;
  tips: { title: string; text: string }[];
}) {
  return (
    <section className="surface-panel rounded-xl border border-border/70 p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/15 text-primary">
          <Lightbulb className="h-4 w-4" />
        </span>
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide">{title}</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{intro}</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {tips.map((t) => (
          <li
            key={t.title}
            className="flex gap-2.5 rounded-lg border border-border/60 bg-card/70 p-3"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">{t.title}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                {t.text}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
