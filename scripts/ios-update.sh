#!/usr/bin/env bash
# BarberJobs — update the iOS project and open Xcode.
# Run from the project folder on your Mac:  bash scripts/ios-update.sh
set -e

git pull
npm install
[ -d ios ] || npx cap add ios
npx cap sync ios

PLIST="ios/App/App/Info.plist"
setkey() {
  /usr/libexec/PlistBuddy -c "Set :$1 $2" "$PLIST" 2>/dev/null || \
  /usr/libexec/PlistBuddy -c "Add :$1 string $2" "$PLIST"
}
setkey CFBundleDisplayName "BarberJobs"
setkey CFBundleName "BarberJobs"
setkey NSLocationWhenInUseUsageDescription "BarberJobs usa tu ubicación para mostrarte barberos y barberías cerca de ti."
setkey NSCameraUsageDescription "BarberJobs usa la cámara para que hagas fotos de tus cortes para tu portfolio."
setkey NSPhotoLibraryUsageDescription "BarberJobs accede a tus fotos para añadir trabajos a tu portfolio."
setkey NSPhotoLibraryAddUsageDescription "BarberJobs guarda las fotos que haces de tus cortes."
setkey NSMicrophoneUsageDescription "BarberJobs usa el micrófono al grabar vídeos de tus cortes."

ICON_DIR="ios/App/App/Assets.xcassets/AppIcon.appiconset"
if [ -f resources/icon.png ] && [ -d "$ICON_DIR" ]; then
  for f in "$ICON_DIR"/*.png; do cp resources/icon.png "$f"; done
fi

npx cap open ios
echo "Listo. En Xcode pulsa ▶. Si no ves los cambios, borra la app del simulador y vuelve a ejecutarla."
