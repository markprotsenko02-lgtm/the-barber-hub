import * as React from "react";
import { SEED_BARBERS, type Barber, type GalleryItem } from "./barber-data";
import { SEED_OFFERS, type ShopOffer } from "./shop-data";

const BARBERS_KEY = "barbermatch.barbers.v2";
const OFFERS_KEY = "barbermatch.offers.v2";

type Ctx = {
  barbers: Barber[];
  offers: ShopOffer[];
  updateBarber: (id: string, patch: Partial<Barber>) => void;
  addBarber: (barber: Barber) => void;
  addGalleryItem: (id: string, item: Omit<GalleryItem, "id">) => void;
  removeGalleryItem: (id: string, itemId: string) => void;
  addOffer: (offer: ShopOffer) => void;
};

const BarberContext = React.createContext<Ctx | null>(null);

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as T[];
      if (Array.isArray(parsed) && parsed.length >= 0) return parsed;
    }
  } catch {
    /* ignore corrupt storage */
  }
  return fallback;
}

function save<T>(key: string, value: T[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export function BarberProvider({ children }: { children: React.ReactNode }) {
  const [barbers, setBarbers] = React.useState<Barber[]>(SEED_BARBERS);
  const [offers, setOffers] = React.useState<ShopOffer[]>(SEED_OFFERS);

  React.useEffect(() => {
    setBarbers(load(BARBERS_KEY, SEED_BARBERS));
    setOffers(load(OFFERS_KEY, SEED_OFFERS));
  }, []);

  const persistBarbers = React.useCallback((next: Barber[]) => {
    setBarbers(next);
    save(BARBERS_KEY, next);
  }, []);

  const persistOffers = React.useCallback((next: ShopOffer[]) => {
    setOffers(next);
    save(OFFERS_KEY, next);
  }, []);

  const value = React.useMemo<Ctx>(
    () => ({
      barbers,
      offers,
      updateBarber: (id, patch) =>
        persistBarbers(barbers.map((b) => (b.id === id ? { ...b, ...patch } : b))),
      addBarber: (barber) => persistBarbers([barber, ...barbers]),
      addGalleryItem: (id, item) =>
        persistBarbers(
          barbers.map((b) =>
            b.id === id
              ? {
                  ...b,
                  gallery: [
                    { ...item, id: `g-${Date.now().toString(36)}` },
                    ...b.gallery,
                  ],
                }
              : b,
          ),
        ),
      removeGalleryItem: (id, itemId) =>
        persistBarbers(
          barbers.map((b) =>
            b.id === id
              ? { ...b, gallery: b.gallery.filter((g) => g.id !== itemId) }
              : b,
          ),
        ),
      addOffer: (offer) => persistOffers([offer, ...offers]),
    }),
    [barbers, offers, persistBarbers, persistOffers],
  );

  return <BarberContext.Provider value={value}>{children}</BarberContext.Provider>;
}

export function useBarbers() {
  const ctx = React.useContext(BarberContext);
  if (!ctx) throw new Error("useBarbers must be used inside BarberProvider");
  return ctx;
}
