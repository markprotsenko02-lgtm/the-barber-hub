import { Capacitor } from "@capacitor/core";

export const isNative = () => typeof window !== "undefined" && Capacitor.isNativePlatform();

/** Asks the OS for location permission (system prompt) and returns coords. */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 60000,
    });
  });
}

export async function reverseGeocodeCity(lat: number, lon: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&accept-language=es`,
  );
  if (!res.ok) throw new Error("geocode");
  const j = (await res.json()) as { name?: string; address?: { city?: string; town?: string; village?: string } };
  return j.address?.city || j.address?.town || j.address?.village || j.name || "";
}

export type NotifPermission = "granted" | "denied" | "prompt" | "unsupported";

export async function getNotificationPermission(): Promise<NotifPermission> {
  if (isNative()) {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const r = await LocalNotifications.checkPermissions();
    return r.display === "granted" ? "granted" : r.display === "denied" ? "denied" : "prompt";
  }
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission === "default" ? "prompt" : Notification.permission;
}

/** Shows the system "Allow notifications?" prompt. */
export async function requestNotificationPermission(): Promise<NotifPermission> {
  if (isNative()) {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const r = await LocalNotifications.requestPermissions();
    return r.display === "granted" ? "granted" : "denied";
  }
  if (typeof Notification === "undefined") return "unsupported";
  const r = await Notification.requestPermission();
  return r === "default" ? "prompt" : r;
}

export async function showNotification(title: string, body: string) {
  if ((await getNotificationPermission()) !== "granted") return false;
  if (isNative()) {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.schedule({
      notifications: [{ id: Math.floor(Date.now() % 2147483647), title, body }],
    });
    return true;
  }
  new Notification(title, { body, icon: "/icon-192.png" });
  return true;
}
