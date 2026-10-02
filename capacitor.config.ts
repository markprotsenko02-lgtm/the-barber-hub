import type { CapacitorConfig } from "@capacitor/cli";

// The app is server-rendered, so the native shell loads the live site.
// After publishing, replace server.url with the published URL.
const config: CapacitorConfig = {
  appId: "app.lovable.d6a82d4de0384f20a296d2a0d482fb96",
  appName: "BarberHub",
  webDir: "public",
  backgroundColor: "#0b0b0c",
  server: {
    url: "https://trim-talent-find.lovable.app",
  },
  ios: { contentInset: "always" },
};

export default config;
