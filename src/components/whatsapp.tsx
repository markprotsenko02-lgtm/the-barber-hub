import { Input } from "@/components/ui/input";
import { AuthGate } from "@/components/auth-gate";

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.25-1.5A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.2-1.15l-.3-.18-3.1.89.9-3.02-.2-.31a8.2 8.2 0 1 1 6.9 3.77Zm4.5-6.14c-.25-.12-1.46-.72-1.69-.8-.23-.09-.39-.12-.55.12-.17.25-.64.8-.78.96-.14.17-.29.19-.53.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.72-1.33.08-.17.04-.31-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.17 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.17 1.73 2.64 4.2 3.7 1.56.67 2.17.73 2.95.61.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.23-.17-.47-.29Z" />
    </svg>
  );
}

/** Spanish mobile number input with a fixed +34 prefix; the value is the 9 local digits. */
export function WhatsAppInput({ value, onChange }: { value: string; onChange: (digits: string) => void }) {
  return (
    <div className="flex">
      <span className="flex items-center rounded-l-md border border-r-0 border-input bg-secondary px-3 text-sm font-medium">
        +34
      </span>
      <Input
        inputMode="numeric"
        className="rounded-l-none"
        placeholder="Ej: 600123456"
        value={value}
        maxLength={16}
        onChange={(e) => {
          let d = e.target.value.replace(/\D/g, "");
          if (d.length > 9 && d.startsWith("34")) d = d.slice(2);
          onChange(d.slice(0, 9));
        }}
      />
    </div>
  );
}

/** Small WhatsApp logo + hidden number; one tap opens the person's WhatsApp (registered users only). */
export function WhatsAppLink({ phone, message, className }: { phone: string; message: string; className?: string }) {
  const prefix = phone.length > 9 ? `+${phone.slice(0, phone.length - 9)}` : "+34";
  return (
    <AuthGate className={className}>
      <a
        href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Abrir WhatsApp"
        className="flex items-center gap-2 rounded-md border border-border/70 bg-secondary px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-primary/60"
      >
        <WhatsAppIcon className="h-4 w-4 shrink-0 text-emerald-500" />
        <span className="tracking-wider text-muted-foreground">{prefix} ••• ••• •••</span>
      </a>
    </AuthGate>
  );
}
