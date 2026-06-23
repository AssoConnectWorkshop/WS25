"use client";

import { useState, useMemo } from "react";
import { calculSACEM, type SacemInput, type SacemResult } from "@/lib/sacem";

const DEFAULT: SacemInput = {
  typeEvenement: "concert_bal_dj",
  budgetDepenses: 1000,
  prixEntree: 0,
  prixCouvert: 18,
  repasBoissonsIncluses: true,
  typeDiffusion: "live",
  partEnregistree: 0.5,
  entreeGratuiteSansRecettes: false,
  recettesEntrees: 0,
  recettesAnnexes: 0,
  butCaricatif: false,
  assoBenevolesNonLucratif: true,
  declarationAnticipee: true,
  affiliationFederation: false,
};

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      {children}
    </div>
  );
}

function Radio<T extends string>({
  name,
  value,
  current,
  label,
  onChange,
}: {
  name: string;
  value: T;
  current: T;
  label: string;
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={current === value}
        onChange={() => onChange(value)}
        className="accent-indigo-600"
      />
      <span className="text-sm text-gray-800">{label}</span>
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  min = 0,
  step = 1,
  suffix = "€",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-32 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <span className="text-sm text-gray-500">{suffix}</span>
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-indigo-600"
      />
      <span className="text-sm text-gray-800">{label}</span>
    </label>
  );
}

function ResultCard({ result }: { result: SacemResult }) {
  const [showDetails, setShowDetails] = useState(false);

  if (result.regime === "cas_particulier") {
    return (
      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 flex flex-col gap-3">
        <h2 className="font-semibold text-orange-800">Situation hors barème automatique</h2>
        {result.warnings.map((w, i) => (
          <p key={i} className="text-sm text-orange-700">
            {w}
          </p>
        ))}
      </div>
    );
  }

  const regimeLabel =
    result.regime === "forfait" ? "Régime forfaitaire" : "Régime proportionnel";

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-indigo-900">Estimation SACEM</h2>
        <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
          {regimeLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-3 flex flex-col gap-0.5">
          <span className="text-xs text-gray-500">SACEM HT</span>
          <span className="text-lg font-bold text-gray-900">{fmt(result.sacem_ht)} €</span>
        </div>
        <div className="bg-white rounded-xl p-3 flex flex-col gap-0.5">
          <span className="text-xs text-gray-500">SPRE HT</span>
          <span className="text-lg font-bold text-gray-900">{fmt(result.spre_ht)} €</span>
        </div>
        <div className="bg-white rounded-xl p-3 flex flex-col gap-0.5">
          <span className="text-xs text-gray-500">Total HT</span>
          <span className="text-lg font-bold text-gray-900">{fmt(result.total_ht)} €</span>
        </div>
        <div className="bg-indigo-600 rounded-xl p-3 flex flex-col gap-0.5">
          <span className="text-xs text-indigo-200">Total TTC</span>
          <span className="text-xl font-bold text-white">{fmt(result.total_ttc)} €</span>
        </div>
      </div>

      {result.warnings.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-xl border border-amber-200 bg-amber-50 p-3">
          {result.warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-800">
              ⚠ {w}
            </p>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        className="text-xs text-indigo-600 hover:underline text-left"
      >
        {showDetails ? "Masquer le détail du calcul" : "Voir le détail du calcul"}
      </button>

      {showDetails && (
        <ul className="flex flex-col gap-1">
          {result.details.map((d, i) => (
            <li key={i} className="text-xs text-gray-600 flex gap-2">
              <span className="text-indigo-400 shrink-0">→</span>
              {d}
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-gray-400">
        Estimation basée sur les barèmes SACEM 2025–2026. Pour toute situation complexe, simulez
        sur{" "}
        <a
          href="https://clients.sacem.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          clients.sacem.fr
        </a>{" "}
        ou contactez votre délégation locale.
      </p>
    </div>
  );
}

export default function SacemForm() {
  const [form, setForm] = useState<SacemInput>(DEFAULT);

  function set<K extends keyof SacemInput>(key: K, value: SacemInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const isConcert = form.typeEvenement === "concert_bal_dj";
  const isProportionnel =
    isConcert
      ? form.budgetDepenses > 5000 || form.prixEntree > 20
      : form.budgetDepenses > 5000 || form.prixCouvert > 40;

  const result = useMemo(() => calculSACEM(form), [form]);

  return (
    <div className="flex flex-col gap-6">
      {/* Section 1 — Événement */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-gray-900">Votre événement</h2>

        <Field label="Type d'événement">
          <div className="flex flex-col gap-2 mt-1">
            <Radio
              name="type"
              value="concert_bal_dj"
              current={form.typeEvenement}
              label="Concert, spectacle, bal, soirée DJ"
              onChange={(v) => set("typeEvenement", v)}
            />
            <Radio
              name="type"
              value="repas_musique"
              current={form.typeEvenement}
              label="Repas dansant, kermesse, banquet avec musique"
              onChange={(v) => set("typeEvenement", v)}
            />
          </div>
        </Field>

        <Field
          label="Budget total des dépenses (TTC)"
          hint="Cachets, sono, location salle, décoration… Tout ce que coûte l'événement."
        >
          <NumberInput
            value={form.budgetDepenses}
            onChange={(v) => set("budgetDepenses", v)}
            step={100}
          />
        </Field>

        {isConcert ? (
          <Field
            label="Prix d'entrée (0 si gratuit)"
            hint="Indiquez le prix le plus élevé pratiqué. Consommation obligatoire ≤ 5 € = gratuit."
          >
            <NumberInput
              value={form.prixEntree}
              onChange={(v) => {
                set("prixEntree", v);
                if (v === 0) set("entreeGratuiteSansRecettes", true);
                else set("entreeGratuiteSansRecettes", false);
              }}
              step={0.5}
            />
          </Field>
        ) : (
          <>
            <Field label="Prix du couvert (par personne)">
              <NumberInput
                value={form.prixCouvert}
                onChange={(v) => set("prixCouvert", v)}
                step={0.5}
              />
            </Field>
            <Checkbox
              checked={form.repasBoissonsIncluses}
              onChange={(v) => set("repasBoissonsIncluses", v)}
              label="Boissons incluses dans le prix"
            />
          </>
        )}
      </section>

      {/* Section 2 — Musique */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-gray-900">Musique diffusée</h2>

        <Field label="Type de diffusion">
          <div className="flex flex-col gap-2 mt-1">
            <Radio
              name="diffusion"
              value="live"
              current={form.typeDiffusion}
              label="100 % live (artistes sur scène, aucun enregistrement)"
              onChange={(v) => set("typeDiffusion", v)}
            />
            <Radio
              name="diffusion"
              value="enregistre"
              current={form.typeDiffusion}
              label="Musique enregistrée (DJ, playlist, streaming)"
              onChange={(v) => set("typeDiffusion", v)}
            />
            <Radio
              name="diffusion"
              value="mixte"
              current={form.typeDiffusion}
              label="Mixte (live + enregistré)"
              onChange={(v) => set("typeDiffusion", v)}
            />
          </div>
        </Field>

        {form.typeDiffusion === "mixte" && (
          <Field
            label={`Part de musique enregistrée : ${Math.round(form.partEnregistree * 100)} %`}
          >
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={form.partEnregistree}
              onChange={(e) => set("partEnregistree", parseFloat(e.target.value))}
              className="w-48 accent-indigo-600"
            />
          </Field>
        )}
      </section>

      {/* Section 3 — Régime proportionnel : recettes */}
      {isProportionnel && (
        <section className="rounded-2xl border border-amber-100 bg-amber-50 p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-amber-900">
            Régime proportionnel — recettes estimées
          </h2>
          <p className="text-xs text-amber-700">
            Budget &gt; 5 000 € ou prix supérieur au seuil forfaitaire : la SACEM applique un taux
            proportionnel sur les recettes.
          </p>
          <Field label="Recettes billetterie (€)">
            <NumberInput
              value={form.recettesEntrees}
              onChange={(v) => set("recettesEntrees", v)}
              step={100}
            />
          </Field>
          <Field label="Recettes annexes — bar, buvette… (€)">
            <NumberInput
              value={form.recettesAnnexes}
              onChange={(v) => set("recettesAnnexes", v)}
              step={100}
            />
          </Field>
        </section>
      )}

      {/* Section 4 — Association */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-gray-900">Votre association</h2>

        <Checkbox
          checked={form.assoBenevolesNonLucratif}
          onChange={(v) => set("assoBenevolesNonLucratif", v)}
          label="Association loi 1901, but non lucratif, gérée par des bénévoles"
        />
        <Checkbox
          checked={form.declarationAnticipee}
          onChange={(v) => set("declarationAnticipee", v)}
          label="Déclaration anticipée — au moins 15 jours avant l'événement (−20 %)"
        />
        <Checkbox
          checked={form.affiliationFederation}
          onChange={(v) => set("affiliationFederation", v)}
          label="Affiliée à une fédération partenaire SACEM (−12,5 %)"
        />
        <Checkbox
          checked={form.butCaricatif}
          onChange={(v) => set("butCaricatif", v)}
          label="Recettes 100 % reversées à une œuvre caritative reconnue (taux 0,50 %)"
        />

        {isConcert && form.prixEntree === 0 && (
          <Checkbox
            checked={form.entreeGratuiteSansRecettes}
            onChange={(v) => set("entreeGratuiteSansRecettes", v)}
            label="Entrée gratuite sans aucune recette (billetterie, bar…)"
          />
        )}
      </section>

      {/* Résultat */}
      <ResultCard result={result} />
    </div>
  );
}
