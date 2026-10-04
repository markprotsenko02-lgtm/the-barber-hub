import { supabase } from "@/integrations/supabase/client";

export type DraftKind = "portfolio" | "offer";
const ROUTES: Record<DraftKind, string> = {
  portfolio: "/publicar-portfolio",
  offer: "/publicar-oferta",
};
const key = (k: DraftKind) => `bj-draft-${k}`;
const PENDING = "bj-pending-route";

function deviceId() {
  let id = localStorage.getItem("bj-device");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("bj-device", id);
  }
  return id;
}

function track(kind: DraftKind, published: boolean) {
  try {
    const flag = `bj-tracked-${kind}${published ? "-pub" : ""}`;
    if (localStorage.getItem(flag)) return;
    localStorage.setItem(flag, "1");
    void supabase.rpc("track_draft", { _device: deviceId(), _kind: kind, _published: published });
  } catch {
    /* ignore */
  }
}

export function saveDraft(kind: DraftKind, data: unknown, pending: boolean) {
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(key(kind), json);
    if (/":"[^"]+"/.test(json)) track(kind, false);
    if (pending) localStorage.setItem(PENDING, ROUTES[kind]);
    return true;
  } catch {
    return false;
  }
}

export function loadDraft<T>(kind: DraftKind): T | null {
  try {
    const raw = localStorage.getItem(key(kind));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function isPending(kind: DraftKind) {
  try {
    return localStorage.getItem(PENDING) === ROUTES[kind];
  } catch {
    return false;
  }
}

export function pendingRoute() {
  try {
    return localStorage.getItem(PENDING);
  } catch {
    return null;
  }
}

export function clearDraft(kind: DraftKind) {
  track(kind, true);
  try {
    localStorage.removeItem(key(kind));
    if (localStorage.getItem(PENDING) === ROUTES[kind]) localStorage.removeItem(PENDING);
  } catch {
    /* ignore */
  }
}

/** Resize an image file to a compact JPEG data URL so guests can keep photos locally. */
export function fileToDataUrl(file: File, max = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("img"));
    };
    img.src = url;
  });
}

/** Upload a locally-kept data URL photo; non data URLs are returned unchanged. */
export async function ensureUploaded(userId: string, url: string): Promise<string> {
  if (!url.startsWith("data:")) return url;
  const blob = await (await fetch(url)).blob();
  const path = `${userId}/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}.jpg`;
  const { error } = await supabase.storage
    .from("portfolio")
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage
    .from("portfolio")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
  if (e2 || !data) throw e2 ?? new Error("url");
  return data.signedUrl;
}
