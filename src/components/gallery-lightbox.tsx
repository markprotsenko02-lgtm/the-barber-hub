import * as React from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { GalleryItem } from "@/lib/barber-data";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [open, setOpen] = React.useState(false);
  const [index, setIndex] = React.useState(0);

  const show = (i: number) => {
    setIndex(i);
    setOpen(true);
  };
  const go = (delta: number) =>
    setIndex((i) => (i + delta + items.length) % items.length);

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
        Todavía no hay trabajos publicados en esta galería.
      </p>
    );
  }

  const current = items[index];

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => show(i)}
            aria-label={`Ver ${item.caption}`}
            className="group relative aspect-square overflow-hidden rounded-lg border border-border/70"
          >
            {item.type === "image" ? (
              <img
                src={item.url}
                alt={item.caption}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <video
                src={item.url}
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
            {item.type === "video" && (
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary/90 text-primary-foreground">
                  <Play className="h-4 w-4" />
                </span>
              </span>
            )}
            <span className="absolute bottom-2 left-2 right-2 truncate text-left text-[11px] text-foreground/90">
              {item.caption}
            </span>
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl border-border bg-background/95 p-3 sm:p-5">
          <DialogTitle className="pr-8 font-display text-base uppercase tracking-wider">
            {current?.caption}
          </DialogTitle>
          <div className="relative overflow-hidden rounded-lg bg-black">
            {current?.type === "image" ? (
              <img
                src={current.url}
                alt={current.caption}
                className="max-h-[70vh] w-full object-contain"
              />
            ) : (
              <video
                src={current?.url}
                controls
                autoPlay
                playsInline
                className="max-h-[70vh] w-full"
              />
            )}
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Anterior"
                  onClick={() => go(-1)}
                  className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Siguiente"
                  onClick={() => go(1)}
                  className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {index + 1} de {items.length}
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
