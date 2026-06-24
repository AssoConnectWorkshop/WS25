import Link from "next/link";
import { createTombola } from "./actions";

export default function NewTombolaPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <Link href="/tombolas" className="text-sm text-gray-500 hover:text-gray-700">
            ← Retour
          </Link>
          <h1 className="text-2xl font-bold mt-2">Créer une tombola</h1>
        </div>

        <form action={createTombola} className="bg-white rounded-xl border p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="title">
              Titre *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Tombola de Noël 2026"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Décrivez votre tombola..."
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="ticket_price">
              Prix du billet (€)
            </label>
            <input
              id="ticket_price"
              name="ticket_price"
              type="number"
              min="0"
              step="0.50"
              placeholder="2.00"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="draw_date">
              Date du tirage
            </label>
            <input
              id="draw_date"
              name="draw_date"
              type="datetime-local"
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            className="bg-black text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Créer la tombola
          </button>
        </form>
      </div>
    </main>
  );
}
