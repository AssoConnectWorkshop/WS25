"use client";

import { useState } from "react";

export default function NomAssociationForm() {
  const [domaine, setDomaine] = useState("");
  const [valeurs, setValeurs] = useState("");
  const [style, setStyle] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult("");
    setLoading(true);

    try {
      const res = await fetch("/api/nom-association", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domaine, valeurs, style, localisation }),
      });

      if (!res.ok || !res.body) throw new Error("Erreur serveur");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) setResult((prev) => prev + decoder.decode(value));
      }
    } catch {
      setResult("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">
            Domaine / thématique <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: environnement, sport, aide sociale, culture…"
            value={domaine}
            onChange={(e) => setDomaine(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Valeurs ou mots-clés</label>
          <input
            type="text"
            placeholder="Ex: solidarité, innovation, jeunesse, partage…"
            value={valeurs}
            onChange={(e) => setValeurs(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Style du nom souhaité</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
          >
            <option value="">-- Choisir un style --</option>
            <option value="sérieux et institutionnel">Sérieux et institutionnel</option>
            <option value="dynamique et moderne">Dynamique et moderne</option>
            <option value="poétique et inspirant">Poétique et inspirant</option>
            <option value="ludique et accessible">Ludique et accessible</option>
            <option value="acronyme">Acronyme</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Localisation (optionnel)</label>
          <input
            type="text"
            placeholder="Ex: Paris, Bretagne, Occitanie…"
            value={localisation}
            onChange={(e) => setLocalisation(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white rounded-lg px-6 py-3 font-semibold text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Génération en cours…" : "Générer des noms"}
        </button>
      </form>

      {(result || loading) && (
        <div className="border rounded-xl p-6 bg-gray-50 min-h-24">
          {result ? (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">
              {result}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span className="animate-pulse">●</span> Claude réfléchit…
            </div>
          )}
        </div>
      )}
    </div>
  );
}
