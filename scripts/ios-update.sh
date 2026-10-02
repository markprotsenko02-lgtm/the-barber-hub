#!/usr/bin/env bash
# BarberJobs — script completo para Mac: instala todo, sincroniza iOS,
# pone nombre, icono y permisos (ubicación, cámara, fotos, micrófono,
# notificaciones) y abre Xcode.
# Uso (desde la carpeta del proyecto):  bash scripts/ios-update.sh
set -euo pipefail

say()  { printf "\n\033[1;33m▶ %s\033[0m\n" "$1"; }
fail() { printf "\n\033[1;31m✖ %s\033[0m\n" "$1"; exit 1; }

# 0. Comprobaciones previas ---------------------------------------------------
[ "$(uname)" = "Darwin" ] || fail "Este script solo funciona en un Mac."
command -v node >/dev/null || fail "Falta Node.js. Instálalo desde https://nodejs.org y repite."
command -v npm  >/dev/null || fail "Falta npm (viene con Node.js)."
command -v git  >/dev/null || fail "Falta git. Ejecuta: xcode-select --install"
command -v xcodebuild >/dev/null || fail "Falta Xcode. Instálalo desde la App Store."
[ -f package.json ] || fail "Ejecuta el script desde la carpeta del proyecto (donde está package.json)."

if ! command -v pod >/dev/null; then
  say "Instalando CocoaPods (hace falta para iOS)…"
  if command -v brew >/dev/null; then brew install cocoapods
  else sudo gem install cocoapods; fi
fi

# 1. Última versión del código ------------------------------------------------
say "Descargando los últimos cambios…"
git pull || echo "(sin cambios remotos o git no configurado; sigo)"

# 2. Dependencias (incluye Capacitor, ubicación y notificaciones) -------------
say "Instalando dependencias…"
npm install
npm install @capacitor/core @capacitor/ios @capacitor/geolocation @capacitor/local-notifications
npm install -D @capacitor/cli

# 3. Proyecto iOS -------------------------------------------------------------
if [ ! -d ios ]; then
  say "Creando el proyecto de iOS…"
  npx cap add ios
fi
say "Sincronizando con iOS (plugins incluidos)…"
npx cap sync ios

# 4. Nombre y permisos en Info.plist -----------------------------------------
PLIST="ios/App/App/Info.plist"
[ -f "$PLIST" ] || fail "No encuentro $PLIST"

setkey() {
  /usr/libexec/PlistBuddy -c "Set :$1 $2" "$PLIST" 2>/dev/null || \
  /usr/libexec/PlistBuddy -c "Add :$1 string $2" "$PLIST"
}

say "Configurando nombre y permisos…"
setkey CFBundleDisplayName "BarberJobs"
setkey CFBundleName "BarberJobs"
setkey NSLocationWhenInUseUsageDescription "BarberJobs usa tu ubicación para mostrarte barberos y barberías a menos de 5 km."
setkey NSLocationAlwaysAndWhenInUseUsageDescription "BarberJobs usa tu ubicación para mostrarte barberos y barberías cerca de ti."
setkey NSCameraUsageDescription "BarberJobs usa la cámara para que hagas fotos de tus cortes para tu portfolio."
setkey NSPhotoLibraryUsageDescription "BarberJobs accede a tus fotos para añadir trabajos a tu portfolio."
setkey NSPhotoLibraryAddUsageDescription "BarberJobs guarda las fotos que haces de tus cortes."
setkey NSMicrophoneUsageDescription "BarberJobs usa el micrófono al grabar vídeos de tus cortes."

# 5. Icono (navaja y barra dorada) -------------------------------------------
ICON_DIR="ios/App/App/Assets.xcassets/AppIcon.appiconset"
if [ -f resources/icon.png ] && [ -d "$ICON_DIR" ]; then
  say "Aplicando el icono de BarberJobs…"
  for f in "$ICON_DIR"/*.png; do cp resources/icon.png "$f"; done
fi

# 6. Resumen y Xcode ---------------------------------------------------------
say "Abriendo Xcode…"
npx cap open ios

cat <<'EOF'

✔ Listo. En Xcode:
  1. Arriba elige un iPhone (simulador o tu móvil) y pulsa ▶.
  2. Para tu iPhone real: Signing & Capabilities → Team → tu cuenta Apple.
  3. Para la App Store: Product → Archive (requiere Apple Developer, 99 $/año).

Si antes pulsaste "No permitir" en algún aviso, iOS no lo repite:
borra la app del simulador/iPhone y vuelve a pulsar ▶.
Recuerda publicar la web antes, porque la app carga la web publicada.
EOF
