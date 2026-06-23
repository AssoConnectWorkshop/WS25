import SacemForm from "./SacemForm";

export const metadata = {
  title: "Simulateur SACEM — Associations",
  description:
    "Estimez le coût SACEM et SPRE pour votre événement associatif selon les barèmes 2025–2026.",
};

export default function SacemPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Simulateur SACEM</h1>
          <p className="mt-1 text-sm text-gray-500">
            Estimez les droits d&apos;auteur à budgéter pour votre événement — barèmes officiels
            2025–2026.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700">
          <strong>Événements exonérés :</strong> cercle familial strict et gratuit, Fête de la
          Musique, Téléthon, œuvres 100 % domaine public (auteurs décédés avant 1956), catalogue
          100 % hors gestion SACEM avec attestation écrite.
        </div>

        <SacemForm />
      </div>
    </main>
  );
}
