import { Capacitor } from "@capacitor/core";

export const isNative = () => typeof window !== "undefined" && Capacitor.isNativePlatform();

export type Coords = { lat: number; lng: number };

/** Asks the OS for location permission (native iOS prompt in the app) and returns coords. */
export async function getCurrentPosition(): Promise<Coords> {
  if (isNative() && Capacitor.isPluginAvailable("Geolocation")) {
    try {
      const { Geolocation } = await import("@capacitor/geolocation");
      // getCurrentPosition shows the iOS "Allow location?" prompt by itself when needed.
      const p = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 20000 });
      return { lat: p.coords.latitude, lng: p.coords.longitude };
    } catch (e) {
      const msg = String((e as Error)?.message ?? e).toLowerCase();
      console.warn("native geolocation failed", e);
      if (msg.includes("denied")) throw Object.assign(new Error("denied"), { code: 1 });
      // fall through to the web API
    }
  }
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      (err) => {
        console.warn("web geolocation failed", err.code, err.message);
        reject(err);
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 300000 },
    );
  });
}

/** Centre coordinates of the supported cities. */
export const CITY_COORDS: Record<string, Coords> = {
  Madrid: { lat: 40.4168, lng: -3.7038 },
  Barcelona: { lat: 41.3874, lng: 2.1686 },
  Valencia: { lat: 39.4699, lng: -0.3763 },
  Sevilla: { lat: 37.3891, lng: -5.9845 },
  Bilbao: { lat: 43.263, lng: -2.935 },
  Málaga: { lat: 36.7213, lng: -4.4214 },
  Zaragoza: { lat: 41.6488, lng: -0.8891 },
};

export function distanceKm(a: Coords, b: Coords) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const NEAR_RADIUS_KM = 5;

/** True when the listing's city is within the near-me radius of the user. */
export function isNear(user: Coords, city: string) {
  const c = CITY_COORDS[city];
  return !!c && distanceKm(user, c) <= NEAR_RADIUS_KM;
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
