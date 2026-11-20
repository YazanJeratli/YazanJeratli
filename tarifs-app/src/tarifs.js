// Tes tarifs. La séance et le pack sont les tiens ; les formules au mois sont des exemples à remplacer.
export const DEFAUTS = {
  seance: 50,
  pack: { n: 10, prix: 450 },
  formules: [
    { nom: 'Essentiel', seances: 4, prix: 170 },
    { nom: 'Régulier', seances: 8, prix: 320 },
    { nom: 'Intensif', seances: 12, prix: 444 }
  ]
};

// Passe à false quand les vrais prix des formules sont dans DEFAUTS.
export const FORMULES_EXEMPLE = true;

const CLE = 'yaz-tarifs-v1';

export const copie = o => JSON.parse(JSON.stringify(o));

export function valide(t) {
  if (!t || typeof t !== 'object') return false;
  if (!(t.seance > 0) || !t.pack || !(t.pack.n > 0) || !(t.pack.prix > 0)) return false;
  if (!Array.isArray(t.formules)) return false;
  return t.formules.every(f => f && typeof f.nom === 'string' && f.seances > 0 && f.prix > 0);
}

export function charge() {
  try {
    const brut = localStorage.getItem(CLE);
    if (brut) {
      const t = JSON.parse(brut);
      if (valide(t)) return t;
    }
  } catch (e) {
    /* stockage indisponible */
  }
  return null;
}

export function enregistre(t) {
  try {
    localStorage.setItem(CLE, JSON.stringify(t));
    return true;
  } catch (e) {
    return false;
  }
}

export function efface() {
  try {
    localStorage.removeItem(CLE);
  } catch (e) {
    /* rien à faire */
  }
}

// Formats français
export const NBSP = ' ';
export const NNBSP = ' ';

export const arrondi = v => Math.round(v * 100) / 100;
export const estEntier = v => Math.abs(arrondi(v) - Math.round(v)) < 0.005;

export function euros(v) {
  const r = arrondi(v);
  const entier = estEntier(r);
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: entier ? 0 : 2,
    maximumFractionDigits: entier ? 0 : 2
  }).format(entier ? Math.round(r) : r);
}

export const nombre = (v, dec = 1) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: dec }).format(v);
export const pluriel = (n, mot) => (n >= 2 ? `${mot}s` : mot);
export const seances = n => `${nombre(n)}${NBSP}${pluriel(n, 'séance')}`;
export const nomFormule = (f, i) => f.nom.trim() || `Formule ${i + 1}`;

// Calculs
export function calcPack(t) {
  const plein = t.seance * t.pack.n;
  const eco = plein - t.pack.prix;
  return { parSeance: t.pack.prix / t.pack.n, plein, eco, offertes: eco / t.seance };
}

export function calcFormule(t, f) {
  const pack = calcPack(t);
  const parSeance = f.prix / f.seances;
  return {
    parSeance,
    ecartPackSeance: pack.parSeance - parSeance,
    ecartUniteSeance: t.seance - parSeance,
    ecartPackAn: (pack.parSeance * f.seances - f.prix) * 12
  };
}

export function compare(t, i, mois) {
  const f = t.formules[i];
  const total = f.seances * mois;
  const pack = calcPack(t);
  const lignes = [
    { cle: 'unite', nom: 'Séance à l’unité', cout: t.seance * total },
    { cle: 'pack', nom: `Pack ${seances(t.pack.n)}`, cout: pack.parSeance * total },
    { cle: 'formule', nom: `Formule ${nomFormule(f, i)}`, cout: f.prix * mois }
  ];
  const max = Math.max(...lignes.map(l => l.cout));
  const min = Math.min(...lignes.map(l => l.cout));
  return {
    f,
    total,
    pack,
    lignes,
    max,
    min,
    vsPack: lignes[1].cout - lignes[2].cout,
    vsUnite: lignes[0].cout - lignes[2].cout
  };
}
