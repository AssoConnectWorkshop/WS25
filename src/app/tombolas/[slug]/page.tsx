import Link from "next/link";
import { notFound } from "next/navigation";
import { getTombola, getLots, getTickets, getWinners } from "@/lib/tombola";
import { addLot, deleteLot, closeTombola, drawTombola } from "./actions";

export const dynamic = "force-dynamic";

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    open: { bg: "#DCFCE7", color: "#16A34A" },
    closed: { bg: "#FEF9C3", color: "#CA8A04" },
    drawn: { bg: "#EEF2FF", color: "#3461FD" },
  };
  const labels = { open: "Ouvert", closed: "Clôturé", drawn: "Tiré" };
  const s = styles[status] ?? { bg: "#f3f4f6", color: "#6b7280" };
  return (
    <span
      className="text-xs font-medium px-2 py-1 rounded-full"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {labels[status as keyof typeof labels] ?? status}
    </span>
  );
}

export default async function AdminTombolaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tombola = await getTombola(slug);
  if (!tombola) notFound();

  const [lots, tickets] = await Promise.all([
    getLots(tombola.id),
    getTickets(tombola.id),
  ]);

  const winners = tombola.status === "drawn" ? await getWinners(tombola.id) : [];
  const publicUrl = `/t/${slug}`;

  const addLotWithSlug = addLot.bind(null, slug);
  const closeAction = closeTombola.bind(null, slug);
  const drawAction = drawTombola.bind(null, slug);

  return (
    <main className="min-h-screen py-10 px-4" style={{ backgroundColor: "#EEF2FF" }}>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/tombolas" className="text-sm hover:opacity-70" style={{ color: "#3461FD" }}>
              ← Toutes les tombolas
            </Link>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="text-2xl font-bold text-gray-800">{tombola.title}</h1>
              <StatusBadge status={tombola.status} />
            </div>
            {tombola.description && (
              <p className="text-sm text-gray-500 mt-1">{tombola.description}</p>
            )}
          </div>
          <a
            href={publicUrl}
            target="_blank"
            className="shrink-0 text-sm text-white px-3 py-2 rounded-lg hover:opacity-90"
            style={{ backgroundColor: "#3461FD" }}
          >
            Page publique →
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Billets vendus", value: tickets.length },
            { label: "Prix du billet", value: tombola.ticket_price ? formatPrice(tombola.ticket_price) : "Gratuit" },
            { label: "Lots", value: lots.length },
          ].map((s) => (
            <div key={s.label} className="bg-white border rounded-xl p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: "#3461FD" }}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Lots */}
        <div className="bg-white border rounded-xl p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-800">Lots</h2>

          {lots.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {lots.map((lot) => {
                const deleteWithId = deleteLot.bind(null, slug, lot.id);
                return (
                  <li key={lot.id} className="flex items-center justify-between gap-3 p-3 rounded-lg" style={{ backgroundColor: "#EEF2FF" }}>
                    <div className="flex items-center gap-3">
                      {lot.photo_url && (
                        <img
                          src={lot.photo_url}
                          alt={lot.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-700">{lot.name}</span>
                    </div>
                    {tombola.status === "open" && (
                      <form action={deleteWithId}>
                        <button type="submit" className="text-xs text-red-400 hover:text-red-600">
                          Supprimer
                        </button>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">Aucun lot ajouté.</p>
          )}

          {tombola.status === "open" && (
            <form action={addLotWithSlug} className="flex flex-col gap-2 border-t pt-4">
              <div className="flex gap-2">
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Nom du lot"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ outlineColor: "#3461FD" }}
                />
                <input
                  name="photo_url"
                  type="url"
                  placeholder="URL photo (optionnel)"
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ outlineColor: "#3461FD" }}
                />
              </div>
              <button
                type="submit"
                className="self-start text-sm border rounded-lg px-3 py-2 hover:opacity-70 transition-opacity"
                style={{ color: "#3461FD", borderColor: "#3461FD" }}
              >
                + Ajouter un lot
              </button>
            </form>
          )}
        </div>

        {/* Participants */}
        <div className="bg-white border rounded-xl p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-800">Participants ({tickets.length} billets)</h2>
          {tickets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b">
                    <th className="pb-2 font-medium">N°</th>
                    <th className="pb-2 font-medium">Nom</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id} className="border-b last:border-0">
                      <td className="py-2 text-gray-400 font-mono">#{t.number}</td>
                      <td className="py-2 text-gray-700">{t.participant_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Aucun participant pour l&apos;instant.</p>
          )}
        </div>

        {/* Winners */}
        {tombola.status === "drawn" && winners.length > 0 && (
          <div className="bg-white border rounded-xl p-5 flex flex-col gap-4">
            <h2 className="font-semibold text-gray-800">Gagnants</h2>
            <ul className="flex flex-col gap-2">
              {winners.map((w) => (
                <li key={w.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "#EEF2FF" }}>
                  <div>
                    <div className="font-medium text-sm text-gray-700">{w.participant_name}</div>
                    <div className="text-xs text-gray-400">Billet #{w.number}</div>
                  </div>
                  <div className="text-sm font-semibold text-white px-3 py-1 rounded-full" style={{ backgroundColor: "#14B8A6" }}>
                    {w.lot.name}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        {tombola.status === "open" && (
          <form action={closeAction}>
            <button
              type="submit"
              className="w-full text-white rounded-xl py-3 font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#F59E0B" }}
            >
              Clôturer les ventes
            </button>
          </form>
        )}

        {tombola.status === "closed" && tickets.length > 0 && lots.length > 0 && (
          <form action={drawAction}>
            <button
              type="submit"
              className="w-full text-white rounded-xl py-3 font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#3461FD" }}
            >
              Lancer le tirage au sort
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
