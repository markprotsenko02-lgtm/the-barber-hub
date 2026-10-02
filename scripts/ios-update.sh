#!/usr/bin/env bash
# BarberHub — update the iOS project and open Xcode.
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
setkey NSLocationWhenInUseUsageDescription "BarberHub usa tu ubicación para mostrarte barberías cerca de ti."
setkey NSCameraUsageDescription "BarberHub usa la cámara para que hagas fotos de tus cortes para tu portfolio."
setkey NSPhotoLibraryUsageDescription "BarberHub accede a tus fotos para añadir trabajos a tu portfolio."
setkey NSPhotoLibraryAddUsageDescription "BarberHub guarda las fotos que haces de tus cortes."
setkey NSMicrophoneUsageDescription "BarberHub usa el micrófono al grabar vídeos de tus cortes."

npx cap open ios
echo "Listo. En Xcode pulsa ▶. Si no ves los cambios, borra la app del simulador y vuelve a ejecutarla."
