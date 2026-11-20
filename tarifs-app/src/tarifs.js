// Ta grille des formules YAZ Coaching.
// « 1 fois par semaine » est compté 4 séances par mois.
export const TYPES = [
  { id: 'hybride', nom: 'Hybride', desc: 'Des séances en salle et un suivi à distance.', rythme: 'Rythme' },
  { id: 'presentiel', nom: 'Présentiel', desc: '100 % en salle, avec ton coach.', rythme: 'Fois par semaine' },
  { id: 'distanciel', nom: 'Distanciel', desc: '100 % à distance, sans séance en salle.', rythme: '' }
];

export const DEFAUTS = {
  essai: 50,
  seance: 60,
  phare: 'hybride-1',
  formules: [
    { id: 'hybride-2m', type: 'hybride', nom: 'Hybride 2 séances par mois', court: '2 / mois', seances: 2, prix: 220 },
    { id: 'hybride-1', type: 'hybride', nom: 'Hybride 1 fois par semaine', court: '1 / sem', seances: 4, prix: 330 },
    { id: 'hybride-2', type: 'hybride', nom: 'Hybride 2 fois par semaine', court: '2 / sem', seances: 8, prix: 500 },
    { id: 'presentiel-1', type: 'presentiel', nom: 'Présentiel 1 fois par semaine', court: '1×', seances: 4, prix: 220 },
    { id: 'presentiel-2', type: 'presentiel', nom: 'Présentiel 2 fois par semaine', court: '2×', seances: 8, prix: 390 },
    { id: 'presentiel-3', type: 'presentiel', nom: 'Présentiel 3 fois par semaine', court: '3×', seances: 12, prix: 520 },
    { id: 'presentiel-4', type: 'presentiel', nom: 'Présentiel 4 fois par semaine', court: '4×', seances: 16, prix: 660 },
    { id: 'presentiel-5', type: 'presentiel', nom: 'Présentiel 5 fois par semaine', court: '5×', seances: 20, prix: 780 },
    { id: 'distanciel-muscu', type: 'distanciel', nom: 'Distanciel musculation', court: 'Musculation', seances: 0, prix: 110 },
    { id: 'distanciel-fa', type: 'distanciel', nom: 'Distanciel force athlétique', court: 'Force athlétique', seances: 0, prix: 100 }
  ]
};

// Parrainage : −10 % sur l’abonnement du parrain par filleul abonné, 2 filleuls au plus (−20 %).
export const PARRAINAGE = { remiseParFilleul: 0.1, maxFilleuls: 2 };

// Le suivi à distance « à la carte » est compté au prix du distanciel musculation,
// comme dans ta grille (Hybride = Présentiel + 110 €).
export const ID_DISTANCIEL_REF = 'distanciel-muscu';

const CLE = 'yaz-tarifs-v2';

export const copie = o => JSON.parse(JSON.stringify(o));
const positif = v => typeof v === 'number' && Number.isFinite(v) && v > 0;

// Relit les prix enregistrés sur le téléphone, formule par formule, par-dessus la grille.
export function charge() {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return null;
    const s = JSON.parse(brut);
    if (!s || typeof s !== 'object') return null;
    const t = copie(DEFAUTS);
    if (positif(s.essai)) t.essai = s.essai;
    if (positif(s.seance)) t.seance = s.seance;
    if (Array.isArray(s.formules)) {
      t.formules.forEach(f => {
        const g = s.formules.find(x => x && x.id === f.id);
        if (g && positif(g.prix)) f.prix = g.prix;
      });
    }
    if (t.formules.some(f => f.id === s.phare)) t.phare = s.phare;
    return t;
  } catch (e) {
    return null;
  }
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

export const formule = (t, id) => t.formules.find(f => f.id === id);
export const prixDistanciel = t => formule(t, ID_DISTANCIEL_REF)?.prix ?? 110;

// Ce que coûteraient les mêmes services sans formule
export function calc(t, f) {
  const carteSeances = f.seances * t.seance;
  const carteDistance = f.type === 'hybride' ? prixDistanciel(t) : 0;
  const carte = carteSeances + carteDistance;
  const eco = f.type === 'distanciel' ? 0 : carte - f.prix;
  const parSeance = f.type === 'presentiel' && f.seances > 0 ? f.prix / f.seances : null;
  return {
    carteSeances,
    carteDistance,
    carte,
    eco,
    ecoAn: eco * 12,
    parSeance,
    ecoSeance: parSeance == null ? 0 : t.seance - parSeance
  };
}

export function compare(t, f, mois) {
  const c = calc(t, f);
  return {
    f,
    mois,
    total: f.seances * mois,
    carteSeances: c.carteSeances * mois,
    carteDistance: c.carteDistance * mois,
    carte: c.carte * mois,
    prix: f.prix * mois,
    eco: (c.carte - f.prix) * mois,
    parSeance: c.parSeance
  };
}
