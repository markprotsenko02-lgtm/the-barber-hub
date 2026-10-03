import * as React from "react";
import { Check } from "lucide-react";
import { PhotoCapture } from "@/components/photo-capture";

export const AVATARS = Array.from({ length: 15 }, (_, i) => `/avatars/avatar-${String(i + 1).padStart(2, "0")}.svg`);

/** 15 ready-made avatars, or upload/take your own profile photo. */
export function AvatarPicker({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const custom = value && !AVATARS.includes(value);
  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-5 gap-2 sm:grid-cols-8">
        {AVATARS.map((a) => (
          <li key={a}>
            <button
              type="button"
              onClick={() => onChange(a)}
              aria-label="Elegir avatar"
              aria-pressed={value === a}
              className={`relative block w-full overflow-hidden rounded-full border-2 transition-colors ${
                value === a ? "border-primary" : "border-border/70 hover:border-primary/60"
              }`}
            >
              <img src={a} alt="" className="aspect-square w-full object-cover" />
              {value === a && (
                <span className="absolute inset-0 grid place-items-center bg-background/50 text-primary">
                  <Check className="h-5 w-5" />
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      {custom && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <img src={value} alt="Tu foto" className="h-12 w-12 rounded-full border-2 border-primary object-cover" />
          Tu foto de perfil
        </div>
      )}
      <p className="text-xs text-muted-foreground">O sube tu propia foto:</p>
      <PhotoCapture onUploaded={({ url, type }) => type === "image" && onChange(url)} />
    </div>
  );
}
