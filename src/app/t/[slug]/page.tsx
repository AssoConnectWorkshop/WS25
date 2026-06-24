import { notFound } from "next/navigation";
import { getTombola, getLots, getWinners } from "@/lib/tombola";
import { registerParticipant } from "./actions";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

function formatPrice(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}

async function getQRCode(url: string): Promise<string> {
  return QRCode.toDataURL(url, { width: 200, margin: 1 });
}

export default async function PublicTombolaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ registered?: string; tickets?: string; name?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const tombola = await getTombola(slug);
  if (!tombola) notFound();

  const lots = await getLots(tombola.id);
  const winners = tombola.status === "drawn" ? await getWinners(tombola.id) : [];

  const publicUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://assoconnect-ws25.vercel.app"}/t/${slug}`;
  const qrDataUrl = await getQRCode(publicUrl);

  const registered = sp.registered === "1";
  const ticketNumbers = sp.tickets?.split(",") ?? [];
  const participantName = sp.name ?? "";

  const registerWithSlug = registerParticipant.bind(null, slug);

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white py-10 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-3xl font-bold">{tombola.title}</h1>
          {tombola.description && (
            <p className="mt-2 text-gray-300 text-sm">{tombola.description}</p>
          )}
          {tombola.ticket_price > 0 && (
            <div className="mt-4 inline-block bg-white text-black text-sm font-semibold px-4 py-1.5 rounded-full">
              {formatPrice(tombola.ticket_price)} / billet
            </div>
          )}
          {tombola.draw_date && (
            <p className="mt-3 text-gray-400 text-xs">
              Tirage le{" "}
              {new Date(tombola.draw_date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-10 flex flex-col gap-10">

        {/* Résultats */}
        {tombola.status === "drawn" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-center mb-4">Résultats du tirage</h2>
            {winners.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {winners.map((w) => (
                  <li key={w.id} className="flex items-center justify-between bg-white rounded-xl p-4 border">
                    <div>
                      <div className="font-medium">{w.participant_name}</div>
                      <div className="text-xs text-gray-500">Billet #{w.number}</div>
                    </div>
                    <div className="text-sm font-semibold text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
                      {w.lot.name}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 text-sm">Aucun gagnant.</p>
            )}
          </div>
        )}

        {/* Confirmation inscription */}
        {registered && ticketNumbers.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">🎟️</div>
            <h2 className="font-bold text-lg">Inscription confirmée !</h2>
            <p className="text-sm text-gray-600 mt-1">
              Bonjour {participantName}, vous avez {ticketNumbers.length} billet
              {ticketNumbers.length > 1 ? "s" : ""}.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {ticketNumbers.map((n) => (
                <span
                  key={n}
                  className="bg-white border-2 border-green-300 text-green-800 font-mono font-bold px-3 py-1.5 rounded-lg text-sm"
                >
                  #{n}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Lots */}
        {lots.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4">Les lots à gagner</h2>
            <div className="grid grid-cols-2 gap-3">
              {lots.map((lot, i) => (
                <div key={lot.id} className="border rounded-xl overflow-hidden">
                  {lot.photo_url ? (
                    <img
                      src={lot.photo_url}
                      alt={lot.name}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-3xl text-gray-300">
                      🎁
                    </div>
                  )}
                  <div className="p-3">
                    <div className="text-xs text-gray-400 mb-0.5">Lot {i + 1}</div>
                    <div className="font-medium text-sm">{lot.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulaire inscription */}
        {tombola.status === "open" && !registered && (
          <div className="border rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Prendre des billets</h2>
            <form action={registerWithSlug} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor="name">Prénom et nom *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Marie Dupont"
                  className="border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="marie@exemple.fr"
                  className="border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" htmlFor="quantity">Nombre de billets</label>
                <select
                  id="quantity"
                  name="quantity"
                  className="border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} billet{n > 1 ? "s" : ""}
                      {tombola.ticket_price > 0
                        ? ` — ${formatPrice(tombola.ticket_price * n)}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-black text-white rounded-xl py-3 font-medium hover:bg-gray-800 transition-colors"
              >
                Confirmer mon inscription
              </button>
              <p className="text-xs text-gray-400 text-center">
                Le règlement se fait directement auprès de l&apos;organisateur.
              </p>
            </form>
          </div>
        )}

        {tombola.status === "closed" && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg font-medium">Les inscriptions sont clôturées.</p>
            <p className="text-sm mt-1">Le tirage au sort aura lieu prochainement.</p>
          </div>
        )}

        {/* QR Code et partage */}
        <div className="border rounded-2xl p-6 flex flex-col items-center gap-4">
          <h2 className="text-sm font-semibold text-gray-600">Partager cette tombola</h2>
          <img src={qrDataUrl} alt="QR Code" className="w-40 h-40" />
          <div className="w-full bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500 text-center break-all font-mono">
            {publicUrl}
          </div>
          <div className="flex gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Participez à notre tombola : ${publicUrl}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              WhatsApp
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent(tombola.title)}&body=${encodeURIComponent(`Participez à notre tombola : ${publicUrl}`)}`}
              className="text-sm border px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Email
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}
