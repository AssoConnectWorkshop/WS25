import Link from "next/link";
import { createTombola } from "./actions";

export default function NewTombolaPage() {
  return (
    <main className="min-h-screen py-12 px-4" style={{ backgroundColor: "#EEF2FF" }}>
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <Link href="/tombolas" className="text-sm hover:opacity-70" style={{ color: "#3461FD" }}>
            ← Retour
          </Link>
          <h1 className="text-2xl font-bold mt-2 text-gray-800">Créer une tombola</h1>
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
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ outlineColor: "#3461FD" }}
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
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
              style={{ outlineColor: "#3461FD" }}
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
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ outlineColor: "#3461FD" }}
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
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ outlineColor: "#3461FD" }}
            />
          </div>

          <button
            type="submit"
            className="text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#3461FD" }}
          >
            Créer la tombola
          </button>
        </form>
      </div>
    </main>
  );
}
