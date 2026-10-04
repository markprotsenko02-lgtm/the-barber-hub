import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Mail, Trash2, Pencil, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CITY_COORDS } from "@/lib/native";
import { WhatsAppIcon } from "@/components/whatsapp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Administración | BarberJobs" },
      { name: "description", content: "Panel interno de administración de BarberJobs." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Administración | BarberJobs" },
      { property: "og:description", content: "Panel interno de administración de BarberJobs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

const DAY = 86400000;
const fmt = (d: string | Date) => new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
const fmtT = (d: string) => new Date(d).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

function useAdminData(enabled: boolean) {
  return useQuery({
    queryKey: ["admin-all"],
    enabled,
    refetchInterval: 15000,
    queryFn: async () => {
      const [u, b, o, c, n, r] = await Promise.all([
        supabase.rpc("admin_users"),
        supabase.from("barbers").select("*").order("created_at", { ascending: false }),
        supabase.from("shop_offers").select("*").order("created_at", { ascending: true }),
        supabase.from("contact_clicks").select("*"),
        supabase.from("admin_notes").select("*").order("created_at", { ascending: false }),
        supabase.from("reports").select("*").order("created_at", { ascending: false }),
      ]);
      const err = u.error || b.error || o.error || c.error || n.error;
      if (err) throw err;
      return {
        users: u.data ?? [],
        barbers: b.data ?? [],
        offers: o.data ?? [],
        clicks: c.data ?? [],
        notes: n.data ?? [],
        reports: r.data ?? [],
      };
    },
  });
}

function AdminPage() {
  const { user, loading } = useAuth();
  const isAdmin = useQuery({
    queryKey: ["is-admin", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("role", "admin");
      return (data?.length ?? 0) > 0;
    },
  });
  const q = useAdminData(!!isAdmin.data);

  if (loading || (user && isAdmin.isLoading)) return <p className="p-10 text-center text-sm text-muted-foreground">Cargando…</p>;
  if (!user || !isAdmin.data)
    return (
      <div className="p-10 text-center">
        <p className="text-sm text-muted-foreground">Esta página no existe.</p>
        <Button asChild className="mt-4"><Link to="/">Volver</Link></Button>
      </div>
    );
  if (!q.data) return <p className="p-10 text-center text-sm text-muted-foreground">{q.error ? "Error cargando datos" : "Cargando datos…"}</p>;
  return <Dashboard d={q.data} />;
}

type D = NonNullable<ReturnType<typeof useAdminData>["data"]>;

function Dashboard({ d }: { d: D }) {
  const now = Date.now();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const week = now - 7 * DAY;

  // Free plan: first 100 barbershops (by first offer). 1-50 → 1 month, 51-100 → 2 weeks.
  const firstOffer = new Map<string, (typeof d.offers)[number]>();
  for (const o of d.offers) if (!firstOffer.has(o.user_id)) firstOffer.set(o.user_id, o);
  const shops = [...firstOffer.values()].map((o, i) => {
    const rank = i + 1;
    const start = new Date(o.created_at);
    const end = rank <= 50 ? new Date(start.getFullYear(), start.getMonth() + 1, start.getDate()) : new Date(start.getTime() + 14 * DAY);
    const daysLeft = Math.ceil((end.getTime() - now) / DAY);
    return { o, rank, end, daysLeft, free: rank <= 100 };
  });
  const freeUsed = Math.min(shops.length, 100);
  const expiring = shops.filter((s) => s.free && s.daysLeft >= 0 && s.daysLeft <= 7);

  const clicksBy = (id: string) => d.clicks.filter((c) => c.target_id === id).length;
  const stale = d.offers.filter((o) => new Date(o.created_at).getTime() < week && clicksBy(o.id) === 0);
  const shopUsers = new Set(d.offers.map((o) => o.user_id));
  const noCv = d.users.filter((u) => !u.has_portfolio && !shopUsers.has(u.id));
  const regsToday = d.users.filter((u) => new Date(u.created_at) >= today).length;

  const big = [
    { n: expiring.length, l: "Gratis se acaba en ≤7 días", sub: "llamar para cobrar" },
    { n: stale.length, l: "Ofertas 7 días sin candidatos", sub: "ofrecer boost" },
    { n: noCv.length, l: "Registrados sin portfolio", sub: "empujar a publicar" },
    { n: regsToday, l: "Registros hoy", sub: `${d.users.length} en total` },
  ];

  const shopsToday = d.offers.filter((o) => new Date(o.created_at) >= today).length;
  const shopsWeek = d.offers.filter((o) => new Date(o.created_at).getTime() >= week).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-2xl font-semibold uppercase text-primary">Administración</h1>
        <Button size="sm" variant="outline" onClick={() => exportExcel(d, shops)}><Download className="h-4 w-4" /> Exportar Excel</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {big.map((b) => (
          <div key={b.l} className="rounded-xl border border-primary/40 bg-card p-4">
            <p className="font-display text-5xl font-bold text-primary">{b.n}</p>
            <p className="mt-1 text-sm font-medium">{b.l}</p>
            <p className="text-xs text-muted-foreground">{b.sub}</p>
          </div>
        ))}
      </div>

      <Section title="Dinero y negocio">
        <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          <Stat n={shopsToday} l="Ofertas de barbería hoy" />
          <Stat n={shopsWeek} l="Ofertas esta semana" />
          <Stat n={d.barbers.length} l="Barberos buscando curro" />
          <Stat n={`${freeUsed}/100`} l="Plazas gratis gastadas" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Plazas 1–50: 1 mes gratis · 51–100: 2 semanas · desde su primera oferta.</p>
        <List empty="Aún no hay barberías con plan gratis.">
          {shops.filter((s) => s.free).sort((a, b) => a.daysLeft - b.daysLeft).map((s) => (
            <Row key={s.o.id}>
              <span className="font-medium">#{s.rank} {s.o.shop_name}</span>
              <span className={s.daysLeft <= 7 ? "text-primary" : "text-muted-foreground"}>
                {s.daysLeft < 0 ? `Acabó el ${fmt(s.end)}` : `Acaba el ${fmt(s.end)} (${s.daysLeft} d)`}
              </span>
              <Contact wa={s.o.whatsapp} email={s.o.email} />
            </Row>
          ))}
        </List>
      </Section>

      <Section title="Mapa: dónde buscan y dónde hay barberos">
        <HeatMap barbers={d.barbers} offers={d.offers} />
      </Section>

      <Section title="Chivato de actividad">
        <h3 className="text-sm font-semibold">Últimos registros</h3>
        <List empty="Nadie aún.">
          {d.users.slice(0, 10).map((u) => (
            <Row key={u.id}>
              <span className="font-medium">{`${u.first_name} ${u.last_name}`.trim() || "—"}</span>
              <span className="text-muted-foreground">{u.email}</span>
              <span className="text-xs text-muted-foreground">{fmtT(u.created_at)}</span>
            </Row>
          ))}
        </List>
        <h3 className="mt-4 text-sm font-semibold">Ofertas con 7 días sin candidatos</h3>
        <List empty="Ninguna.">
          {stale.map((o) => (
            <Row key={o.id}><span className="font-medium">{o.shop_name}</span><span className="text-muted-foreground">{o.city} · desde {fmt(o.created_at)}</span><Contact wa={o.whatsapp} email={o.email} msg={`Hola ${o.shop_name}, somos BarberJobs. Os hacemos un boost a la oferta?`} /></Row>
          ))}
        </List>
        <h3 className="mt-4 text-sm font-semibold">Registrados sin portfolio ni oferta</h3>
        <List empty="Ninguno.">
          {noCv.map((u) => (
            <Row key={u.id}><span className="font-medium">{`${u.first_name} ${u.last_name}`.trim() || "—"}</span><Contact email={u.email ?? ""} /></Row>
          ))}
        </List>
      </Section>

      <Section title={`Moderación: ofertas de barberías (${d.offers.length})`}>
        <List empty="Sin ofertas.">
          {[...d.offers].reverse().map((o) => (
            <ModItem key={o.id} kind="offer" id={o.id} name={o.shop_name} city={o.city} wa={o.whatsapp} email={o.email}
              photos={[o.logo, o.cover].filter(Boolean)} extra={`${clicksBy(o.id)} candidatos`} notes={d.notes} />
          ))}
        </List>
      </Section>

      <Section title={`Moderación: portfolios de barberos (${d.barbers.length})`}>
        <List empty="Sin portfolios.">
          {d.barbers.map((b) => (
            <ModItem key={b.id} kind="barber" id={b.id} name={b.name} city={b.city} wa={b.whatsapp} email={b.email}
              photos={[b.avatar, ...((b.gallery as { url?: string }[]) ?? []).map((g) => g?.url ?? "")].filter((x) => x && !x.startsWith("/avatars"))}
              extra={`${clicksBy(b.id)} contactos`} notes={d.notes} />
          ))}
        </List>
      </Section>

      {d.reports.length > 0 && (
        <Section title={`Reportes (${d.reports.length})`}>
          <List empty="">
            {d.reports.map((r) => (
              <Row key={r.id}><span className="font-medium">{r.target_name}</span><span className="text-muted-foreground">{r.reason}</span><span className="text-xs text-muted-foreground">por {r.reporter_email} · {fmt(r.created_at)}</span></Row>
            ))}
          </List>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border border-border/70 bg-card p-4"><h2 className="mb-3 font-display text-lg font-semibold uppercase">{title}</h2>{children}</section>;
}
function Stat({ n, l }: { n: React.ReactNode; l: string }) {
  return <div className="rounded-lg bg-muted p-3"><p className="text-2xl font-bold text-primary">{n}</p><p className="text-xs text-muted-foreground">{l}</p></div>;
}
function List({ children, empty }: { children: React.ReactNode; empty: string }) {
  const has = React.Children.count(children) > 0;
  return <div className="mt-2 divide-y divide-border/60">{has ? children : <p className="py-2 text-sm text-muted-foreground">{empty}</p>}</div>;
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">{children}</div>;
}
function Contact({ wa, email, msg }: { wa?: string; email?: string; msg?: string }) {
  return (
    <span className="ml-auto flex gap-2">
      {wa && <a className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs" target="_blank" rel="noreferrer" href={`https://wa.me/${wa}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`}><WhatsAppIcon className="h-3.5 w-3.5 text-emerald-500" />+{wa}</a>}
      {email && <a className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs" href={`mailto:${email}`}><Mail className="h-3.5 w-3.5 text-primary" />{email}</a>}
    </span>
  );
}

function ModItem({ kind, id, name, city, wa, email, photos, extra, notes }: {
  kind: "barber" | "offer"; id: string; name: string; city: string; wa: string; email: string; photos: string[]; extra: string; notes: D["notes"];
}) {
  const qc = useQueryClient();
  const [edit, setEdit] = React.useState(false);
  const [f, setF] = React.useState({ name, city, wa, email });
  const [note, setNote] = React.useState("");
  const table = kind === "barber" ? "barbers" : "shop_offers";
  const myNotes = notes.filter((n) => n.target_id === id);
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-all"] });

  async function save() {
    const patch = kind === "barber"
      ? { name: f.name, city: f.city, whatsapp: f.wa.replace(/\D/g, ""), email: f.email }
      : { shop_name: f.name, city: f.city, whatsapp: f.wa.replace(/\D/g, ""), email: f.email };
    const { error } = await supabase.from(table).update(patch as never).eq("id", id);
    if (error) { toast.error("No se pudo guardar"); return; }
    toast.success("Guardado"); setEdit(false); refresh();
  }
  async function remove() {
    if (!confirm(`¿Borrar "${name}"? No se puede deshacer.`)) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) { toast.error("No se pudo borrar"); return; }
    toast.success("Borrado"); refresh();
  }
  async function addNote() {
    if (!note.trim()) return;
    const { error } = await supabase.from("admin_notes").insert({ target_type: kind, target_id: id, note: note.trim() });
    if (error) { toast.error("No se pudo guardar la nota"); return; }
    setNote(""); refresh();
  }

  return (
    <div className="space-y-2 py-3 text-sm">
      {edit ? (
        <div className="grid gap-2 md:grid-cols-4">
          <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Nombre" />
          <Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} placeholder="Ciudad" />
          <Input value={f.wa} onChange={(e) => setF({ ...f, wa: e.target.value })} placeholder="WhatsApp con 34" />
          <Input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Email" />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-3">
          <Link to={kind === "barber" ? "/barberos/$barberId" : "/"} params={{ barberId: id }} className="font-medium hover:text-primary">{name}</Link>
          <span className="text-muted-foreground">{city} · {extra}</span>
          <Contact wa={wa} email={email} />
        </div>
      )}
      {photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {photos.map((p) => <a key={p} href={p} target="_blank" rel="noreferrer"><img src={p} alt="" className="h-16 w-16 shrink-0 rounded-md object-cover" /></a>)}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {edit ? (
          <><Button size="sm" onClick={save}><Save className="h-4 w-4" /> Guardar</Button><Button size="sm" variant="outline" onClick={() => setEdit(false)}><X className="h-4 w-4" /></Button></>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setEdit(true)}><Pencil className="h-4 w-4" /> Corregir</Button>
        )}
        <Button size="sm" variant="outline" onClick={remove}><Trash2 className="h-4 w-4" /> Borrar</Button>
      </div>
      {myNotes.map((n) => (
        <p key={n.id} className="rounded-md bg-muted px-2 py-1 text-xs">📝 {n.note} <span className="text-muted-foreground">· {fmt(n.created_at)}</span>
          <button className="ml-2 text-muted-foreground hover:text-foreground" onClick={async () => { await supabase.from("admin_notes").delete().eq("id", n.id); refresh(); }}>×</button></p>
      ))}
      <div className="flex gap-2">
        <Textarea rows={1} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota interna: Ej: paga tarde, avisar" className="min-h-9" />
        <Button size="sm" variant="secondary" onClick={addNote}>Añadir</Button>
      </div>
    </div>
  );
}

function HeatMap({ barbers, offers }: { barbers: D["barbers"]; offers: D["offers"] }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const cities = React.useMemo(() => {
    const m = new Map<string, { b: number; o: number }>();
    for (const b of barbers) { const c = m.get(b.city) ?? { b: 0, o: 0 }; c.b++; m.set(b.city, c); }
    for (const o of offers) { const c = m.get(o.city) ?? { b: 0, o: 0 }; c.o++; m.set(o.city, c); }
    return [...m.entries()].sort((a, b) => b[1].b + b[1].o - (a[1].b + a[1].o));
  }, [barbers, offers]);

  React.useEffect(() => {
    let cancelled = false;
    let map: import("leaflet").Map | undefined;
    (async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !ref.current) return;
      map = L.map(ref.current).setView([39.4699, -0.3763], 7);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 19 }).addTo(map);
      for (const [city, c] of cities) {
        const p = CITY_COORDS[city];
        if (!p) continue;
        if (c.o) L.circleMarker([p.lat + 0.01, p.lng], { radius: 6 + c.o * 3, color: "#d4af37", fillOpacity: 0.5 }).bindTooltip(`${city}: ${c.o} barberías buscan`).addTo(map);
        if (c.b) L.circleMarker([p.lat - 0.01, p.lng], { radius: 6 + c.b * 3, color: "#e5e5e5", fillOpacity: 0.4 }).bindTooltip(`${city}: ${c.b} barberos`).addTo(map);
      }
    })();
    return () => { cancelled = true; map?.remove(); };
  }, [cities]);

  return (
    <>
      <div ref={ref} className="h-72 w-full overflow-hidden rounded-lg" />
      <p className="mt-2 text-xs text-muted-foreground">Dorado = barberías que buscan · Blanco = barberos. Por ciudad.</p>
      <List empty="Aún no hay datos.">
        {cities.map(([city, c]) => (
          <Row key={city}>
            <span className="font-medium">{city || "Sin ciudad"}</span>
            <span className="text-muted-foreground">{c.o} buscan · {c.b} barberos</span>
            <span className="ml-auto text-xs text-primary">{c.o > c.b ? "Faltan barberos" : c.b > c.o ? "Sobran barberos" : "Equilibrado"}</span>
          </Row>
        ))}
      </List>
    </>
  );
}

async function exportExcel(d: D, shops: { o: D["offers"][number]; rank: number; end: Date }[]) {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  const add = (name: string, rows: object[]) => XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{}]), name);
  add("Usuarios", d.users.map((u) => ({ Nombre: u.first_name, Apellidos: u.last_name, Email: u.email, Registro: u.created_at, Portfolio: u.has_portfolio ? "Sí" : "No" })));
  add("Barberías", d.offers.map((o) => {
    const s = shops.find((x) => x.o.user_id === o.user_id);
    return { Barbería: o.shop_name, Ciudad: o.city, WhatsApp: o.whatsapp, Email: o.email, Publicada: o.created_at, PlazaGratis: s?.rank ?? "", FinGratis: s && s.rank <= 100 ? s.end.toISOString().slice(0, 10) : "", Candidatos: d.clicks.filter((c) => c.target_id === o.id).length };
  }));
  add("Barberos", d.barbers.map((b) => ({ Nombre: b.name, Ciudad: b.city, WhatsApp: b.whatsapp, Email: b.email, Publicado: b.created_at })));
  add("Notas", d.notes.map((n) => ({ Tipo: n.target_type, Id: n.target_id, Nota: n.note, Fecha: n.created_at })));
  XLSX.writeFile(wb, `barberjobs-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
