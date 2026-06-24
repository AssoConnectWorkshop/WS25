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
    <main className="min-h-screen" style={{ backgroundColor: "#EEF2FF" }}>
      {/* Header */}
      <div className="py-10 px-4" style={{ backgroundColor: "#3461FD" }}>
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white">{tombola.title}</h1>
          {tombola.description && (
            <p className="mt-2 text-blue-200 text-sm">{tombola.description}</p>
          )}
          {tombola.ticket_price > 0 && (
            <div className="mt-4 inline-block bg-white text-sm font-semibold px-4 py-1.5 rounded-full" style={{ color: "#3461FD" }}>
              {formatPrice(tombola.ticket_price)} / billet
            </div>
          )}
          {tombola.draw_date && (
            <p className="mt-3 text-blue-300 text-xs">
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

      <div className="max-w-xl mx-auto px-4 py-10 flex flex-col gap-8">

        {/* Résultats */}
        {tombola.status === "drawn" && (
          <div className="bg-white border rounded-2xl p-6" style={{ borderColor: "#14B8A6" }}>
            <h2 className="text-lg font-bold text-center mb-4" style={{ color: "#14B8A6" }}>Résultats du tirage</h2>
            {winners.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {winners.map((w) => (
                  <li key={w.id} className="flex items-center justify-between bg-white rounded-xl p-4 border">
                    <div>
                      <div className="font-medium text-gray-800">{w.participant_name}</div>
                      <div className="text-xs text-gray-400">Billet #{w.number}</div>
                    </div>
                    <div className="text-sm font-semibold px-3 py-1 rounded-full text-white" style={{ backgroundColor: "#14B8A6" }}>
                      {w.lot.name}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-400 text-sm">Aucun gagnant.</p>
            )}
          </div>
        )}

        {/* Confirmation inscription */}
        {registered && ticketNumbers.length > 0 && (
          <div className="bg-white rounded-2xl p-6 text-center border" style={{ borderColor: "#14B8A6" }}>
            <div className="text-3xl mb-2">🎟️</div>
            <h2 className="font-bold text-lg" style={{ color: "#3461FD" }}>Inscription confirmée !</h2>
            <p className="text-sm text-gray-500 mt-1">
              Bonjour {participantName}, vous avez {ticketNumbers.length} billet
              {ticketNumbers.length > 1 ? "s" : ""}.
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {ticketNumbers.map((n) => (
                <span
                  key={n}
                  className="bg-white font-mono font-bold px-3 py-1.5 rounded-lg text-sm border-2"
                  style={{ borderColor: "#14B8A6", color: "#14B8A6" }}
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
            <h2 className="text-lg font-bold mb-4 text-gray-800">Les lots à gagner</h2>
            <div className="grid grid-cols-2 gap-3">
              {lots.map((lot, i) => (
                <div key={lot.id} className="bg-white border rounded-xl overflow-hidden">
                  {lot.photo_url ? (
                    <img
                      src={lot.photo_url}
                      alt={lot.name}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center text-3xl" style={{ backgroundColor: "#EEF2FF" }}>
                      🎁
                    </div>
                  )}
                  <div className="p-3">
                    <div className="text-xs mb-0.5" style={{ color: "#14B8A6" }}>Lot {i + 1}</div>
                    <div className="font-medium text-sm text-gray-800">{lot.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Formulaire inscription */}
        {tombola.status === "open" && !registered && (
          <div className="bg-white border rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Prendre des billets</h2>
            <form action={registerWithSlug} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700" htmlFor="name">Prénom et nom *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Marie Dupont"
                  className="border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ outlineColor: "#3461FD" }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700" htmlFor="quantity">Nombre de billets</label>
                <select
                  id="quantity"
                  name="quantity"
                  className="border rounded-lg px-3 py-2.5 text-sm focus:outline-none bg-white"
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
                className="text-white rounded-xl py-3 font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#3461FD" }}
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
          <div className="bg-white rounded-2xl p-8 text-center border">
            <p className="text-lg font-medium text-gray-700">Les inscriptions sont clôturées.</p>
            <p className="text-sm mt-1 text-gray-400">Le tirage au sort aura lieu prochainement.</p>
          </div>
        )}

        {/* QR Code et partage */}
        <div className="bg-white border rounded-2xl p-6 flex flex-col items-center gap-4">
          <h2 className="text-sm font-semibold text-gray-500">Partager cette tombola</h2>
          <img src={qrDataUrl} alt="QR Code" className="w-40 h-40" />
          <div className="w-full rounded-lg px-3 py-2 text-xs text-gray-400 text-center break-all font-mono" style={{ backgroundColor: "#EEF2FF" }}>
            {publicUrl}
          </div>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Participez à notre tombola : ${publicUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Partager sur WhatsApp
          </a>
        </div>

      </div>
    </main>
  );
}
