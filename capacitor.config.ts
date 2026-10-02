import type { CapacitorConfig } from "@capacitor/cli";

// The app is server-rendered, so the native shell loads the live site.
// After publishing, replace server.url with the published URL.
const config: CapacitorConfig = {
  appId: "com.thebarberhub.app",
  appName: "BarberHub",
  webDir: "public",
  backgroundColor: "#0b0b0c",
  server: {
    url: "https://trim-talent-find.lovable.app?forceHideBadge=true",
  },
  ios: { contentInset: "always" },
};

export default config;
