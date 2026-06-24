import Link from "next/link";
import { getAllTombolas } from "@/lib/tombola";

export const dynamic = "force-dynamic";

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

export default async function TombolasPage() {
  const tombolas = await getAllTombolas();

  return (
    <main className="min-h-screen py-10 px-4" style={{ backgroundColor: "#EEF2FF" }}>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Tombolas</h1>
          <Link
            href="/tombolas/new"
            className="text-white text-sm px-4 py-2 rounded-lg hover:opacity-90"
            style={{ backgroundColor: "#3461FD" }}
          >
            + Créer une tombola
          </Link>
        </div>

        {tombolas.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">Aucune tombola</p>
            <p className="text-sm mt-1">Créez votre première tombola.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {tombolas.map((t) => {
              const statusStyle: Record<string, { bg: string; color: string }> = {
                open: { bg: "#DCFCE7", color: "#16A34A" },
                closed: { bg: "#FEF9C3", color: "#CA8A04" },
                drawn: { bg: "#EEF2FF", color: "#3461FD" },
              };
              const s = statusStyle[t.status] ?? { bg: "#f3f4f6", color: "#6b7280" };
              const label = t.status === "open" ? "Ouvert" : t.status === "drawn" ? "Tiré" : "Clôturé";
              return (
                <li key={t.id}>
                  <Link
                    href={`/tombolas/${t.slug}`}
                    className="block bg-white border rounded-xl p-5 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{t.title}</span>
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{ backgroundColor: s.bg, color: s.color }}
                      >
                        {label}
                      </span>
                    </div>
                    {t.ticket_price > 0 && (
                      <p className="text-sm text-gray-400 mt-1">{formatPrice(t.ticket_price)} / billet</p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
