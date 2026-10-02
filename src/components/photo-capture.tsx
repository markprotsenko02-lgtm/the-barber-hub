import * as React from "react";
import { Camera, ImageUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/**
 * "Hacer foto" opens the camera (system asks for camera permission the first
 * time); "Desde galería" opens the photo library. The file is uploaded and
 * onUploaded receives a long-lived URL.
 */
export function PhotoCapture({
  onUploaded,
}: {
  onUploaded: (item: { url: string; type: "image" | "video" }) => void | Promise<void>;
}) {
  const { user } = useAuth();
  const [busy, setBusy] = React.useState(false);
  const cameraRef = React.useRef<HTMLInputElement>(null);
  const libraryRef = React.useRef<HTMLInputElement>(null);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!user) {
      toast.error("Inicia sesión para subir fotos");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || (file.type.startsWith("video") ? "mp4" : "jpg");
      const path = `${user.id}/${Date.now().toString(36)}.${ext}`;
      const { error } = await supabase.storage
        .from("portfolio")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data, error: urlErr } = await supabase.storage
        .from("portfolio")
        .createSignedUrl(path, TEN_YEARS);
      if (urlErr || !data) throw urlErr ?? new Error("url");
      await onUploaded({ url: data.signedUrl, type: file.type.startsWith("video") ? "video" : "image" });
      toast.success("Foto subida");
    } catch {
      toast.error("No se pudo subir la foto");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handle} />
      <input ref={libraryRef} type="file" accept="image/*,video/*" className="hidden" onChange={handle} />
      <Button type="button" disabled={busy} onClick={() => cameraRef.current?.click()} className="font-semibold">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} Hacer foto
      </Button>
      <Button type="button" variant="secondary" disabled={busy} onClick={() => libraryRef.current?.click()}>
        <ImageUp className="h-4 w-4" /> Desde galería
      </Button>
    </div>
  );
}
