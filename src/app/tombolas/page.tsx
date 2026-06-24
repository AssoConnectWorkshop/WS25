import Link from "next/link";
import { getAllTombolas } from "@/lib/tombola";

export const dynamic = "force-dynamic";

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

export default async function TombolasPage() {
  const tombolas = await getAllTombolas();

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tombolas</h1>
          <Link
            href="/tombolas/new"
            className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800"
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
            {tombolas.map((t) => (
              <li key={t.id}>
                <a
                  href={`/tombolas/${t.slug}`}
                  className="block bg-white border rounded-xl p-5 hover:border-black transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t.title}</span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        t.status === "open"
                          ? "bg-green-100 text-green-800"
                          : t.status === "drawn"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {t.status === "open" ? "Ouvert" : t.status === "drawn" ? "Tiré" : "Clôturé"}
                    </span>
                  </div>
                  {t.ticket_price > 0 && (
                    <p className="text-sm text-gray-500 mt-1">{formatPrice(t.ticket_price)} / billet</p>
                  )}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
