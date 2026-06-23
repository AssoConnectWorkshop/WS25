export type TypeEvenement = "concert_bal_dj" | "repas_musique";
export type TypeDiffusion = "live" | "enregistre" | "mixte";
export type Regime = "forfait" | "proportionnel" | "cas_particulier";

export interface SacemInput {
  typeEvenement: TypeEvenement;
  budgetDepenses: number;
  prixEntree: number;
  prixCouvert: number;
  repasBoissonsIncluses: boolean;
  typeDiffusion: TypeDiffusion;
  partEnregistree: number; // 0–1, only for mixte
  entreeGratuiteSansRecettes: boolean;
  recettesEntrees: number;
  recettesAnnexes: number;
  butCaricatif: boolean;
  assoBenevolesNonLucratif: boolean;
  declarationAnticipee: boolean;
  affiliationFederation: boolean;
}

export interface SacemResult {
  regime: Regime;
  sacem_ht: number;
  spre_ht: number;
  total_ht: number;
  total_ttc: number;
  details: string[];
  warnings: string[];
}

const GRID_BUDGETS = [1000, 2000, 3000, 5000];
const GRID = [
  [49.76, 114.11, 190.18, 379.41],
  [78.48, 172.06, 290.55, 483.04],
  [123.76, 235.46, 343.38, 515.07],
  [186.76, 313.94, 430.54, 594.15],
];
const FORFAIT_MAX = 594.15;

function budgetIdx(b: number) {
  return GRID_BUDGETS.findIndex((cap) => b <= cap) ?? 3;
}

function prixIdxConcert(p: number) {
  if (p <= 5) return 0;
  if (p <= 8) return 1;
  if (p <= 14) return 2;
  return 3;
}

function prixIdxRepas(p: number) {
  if (p <= 18) return 0;
  if (p <= 24) return 1;
  if (p <= 32) return 2;
  return 3;
}

export function calculSACEM(input: SacemInput): SacemResult {
  const details: string[] = [];
  const warnings: string[] = [];

  if (input.budgetDepenses > 30000) {
    warnings.push(
      "Budget > 30 000 € : contactez directement la SACEM (festival / grand événement)."
    );
    return {
      regime: "cas_particulier",
      sacem_ht: 0,
      spre_ht: 0,
      total_ht: 0,
      total_ttc: 0,
      details,
      warnings,
    };
  }

  const isConcert = input.typeEvenement === "concert_bal_dj";
  const prixRef = isConcert ? input.prixEntree : input.prixCouvert;
  const prixMax = isConcert ? 20 : 40;
  const isForfait = input.budgetDepenses <= 5000 && prixRef <= prixMax;
  const regime: Regime = isForfait ? "forfait" : "proportionnel";

  let sacem_ht = 0;

  if (isForfait) {
    const bi = budgetIdx(input.budgetDepenses);
    let prixEffectif = prixRef;
    if (!isConcert && !input.repasBoissonsIncluses) {
      prixEffectif = prixRef * 1.2;
      details.push(
        `Prix couvert majoré de 20 % (boissons non incluses) → ${prixEffectif.toFixed(2)} €`
      );
    }
    const pi = isConcert ? prixIdxConcert(prixEffectif) : prixIdxRepas(prixEffectif);
    sacem_ht = GRID[pi][bi];
    details.push(`Grille forfaitaire (tarif réduit associatif) : ${sacem_ht.toFixed(2)} € HT`);
  } else {
    const assiette = Math.max(
      input.recettesEntrees + input.recettesAnnexes * 0.5,
      input.budgetDepenses
    );
    details.push(
      `Assiette = max(recettes entrées + recettes annexes × 50 %, budget dépenses) = ${assiette.toFixed(2)} €`
    );

    if (input.butCaricatif) {
      sacem_ht = assiette * 0.005;
      details.push(`Taux caritatif : 0,50 % × ${assiette.toFixed(2)} € = ${sacem_ht.toFixed(2)} € HT`);
    } else {
      sacem_ht = Math.max(assiette * 0.11, FORFAIT_MAX);
      details.push(
        `Taux 11 % × ${assiette.toFixed(2)} € = ${(assiette * 0.11).toFixed(2)} € HT` +
          (assiette * 0.11 < FORFAIT_MAX ? ` → plancher ${FORFAIT_MAX} € HT appliqué` : "")
      );
    }
    warnings.push(
      "Régime proportionnel : envoyez le bilan recettes/dépenses + liste des œuvres à la SACEM dans les 10 jours après l'événement."
    );
  }

  if (!input.butCaricatif) {
    // Majorations diffusion
    if (input.typeDiffusion === "enregistre") {
      sacem_ht *= 1.25;
      details.push("Majoration musique enregistrée (DJ / playlist) : +25 %");
    } else if (input.typeDiffusion === "mixte" && input.partEnregistree > 0) {
      const coef = 1 + 0.25 * input.partEnregistree;
      sacem_ht *= coef;
      details.push(
        `Majoration mixte : +${(input.partEnregistree * 25).toFixed(0)} % (part enregistrée ${Math.round(input.partEnregistree * 100)} %)`
      );
    }

    // Entrée gratuite sans recettes
    if (input.entreeGratuiteSansRecettes) {
      sacem_ht = Math.max(sacem_ht * 0.5, 49.76);
      details.push("Séance gratuite sans recettes : ÷ 2 (plancher 49,76 € HT)");
    }

    // Réductions associations (R3 puis R1)
    if (input.affiliationFederation) {
      sacem_ht *= 0.875;
      details.push("R3 – Affiliation fédération partenaire SACEM : −12,5 %");
    }
    if (input.declarationAnticipee) {
      sacem_ht *= 0.8;
      details.push("R1 – Déclaration anticipée (≥ 15 jours avant) : −20 %");
    } else {
      warnings.push(
        "Sans déclaration anticipée : aucune réduction R1. Si déclaration après l'événement, majoration +25 % s'applique."
      );
    }
  }

  // SPRE
  let spre_ht = 0;
  if (input.typeDiffusion === "live") {
    details.push("SPRE : 0 € (concert 100 % live, aucun enregistrement diffusé)");
  } else {
    const min = input.assoBenevolesNonLucratif ? 51.14 : 102.27;
    spre_ht = Math.max(sacem_ht * 0.65, min);
    details.push(
      `SPRE = 65 % × SACEM = ${(sacem_ht * 0.65).toFixed(2)} € HT (plancher ${min} € HT)`
    );
  }

  const total_ht = sacem_ht + spre_ht;
  const total_ttc = total_ht * 1.2;

  return {
    regime,
    sacem_ht: Math.round(sacem_ht * 100) / 100,
    spre_ht: Math.round(spre_ht * 100) / 100,
    total_ht: Math.round(total_ht * 100) / 100,
    total_ttc: Math.round(total_ttc * 100) / 100,
    details,
    warnings,
  };
}
