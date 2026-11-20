import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import ClickSpark from './reactbits/ClickSpark.jsx';
import CountUp from './reactbits/CountUp.jsx';
import Particles from './reactbits/Particles.jsx';
import ShinyText from './reactbits/ShinyText.jsx';
import SplitText from './reactbits/SplitText.jsx';
import SpotlightCard from './reactbits/SpotlightCard.jsx';
import StarBorder from './reactbits/StarBorder.jsx';
import logo from '../assets/logo.jpg';
import {
  DEFAUTS,
  NBSP,
  NNBSP,
  TYPES,
  calc,
  charge,
  compare,
  copie,
  efface,
  enregistre,
  estEntier,
  euros,
  formule,
  nombre,
  pluriel,
  prixDistanciel,
  seances
} from './tarifs.js';

const OR = { o100: '#fde573', o300: '#f3c650', o500: '#e9b43a', o700: '#d79a24' };

// Les icônes YAZ (trait de 2 px, grille de 24, angles vifs)
const ICONES = {
  triangle: <path d="M12 7.38L18 16.62L6 16.62Z" fill="currentColor" />,
  check: <path d="M4 12L9.5 17.5L20 7" fill="none" stroke="currentColor" strokeWidth="2" />,
  arrow: <path d="M3 12H19.5M13 5.5L19.5 12L13 18.5" fill="none" stroke="currentColor" strokeWidth="2" />,
  plus: <path d="M12 4V20M4 12H20" fill="none" stroke="currentColor" strokeWidth="2" />,
  close: <path d="M5 5L19 19M19 5L5 19" fill="none" stroke="currentColor" strokeWidth="2" />
};

function Icone({ nom, className = '' }) {
  return (
    <svg className={`icon ${className}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {ICONES[nom]}
    </svg>
  );
}

// Un prix qui roule chiffre par chiffre quand il change (CountUp de React Bits, mode « roll »)
function Prix({ value, depart, duree = 0.9, delai = 0, className = '' }) {
  const [from] = useState(() => depart ?? value);
  return (
    <CountUp
      className={className}
      from={from}
      to={value}
      mode="roll"
      trigger="load"
      duration={duree}
      delay={delai}
      easing="expo"
      decimals={estEntier(value) ? 0 : 2}
      separator={NNBSP}
      decimalMark=","
      suffix={`${NBSP}€`}
    />
  );
}

function Segmented({ id, label, ariaLabel, options, value, onChange }) {
  const refs = useRef([]);
  const index = Math.max(
    0,
    options.findIndex(o => o.value === value)
  );
  const choisir = i => {
    onChange(options[i].value);
    refs.current[i]?.focus();
  };
  const onKeyDown = e => {
    const pas = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
    if (!pas) return;
    e.preventDefault();
    choisir((index + pas + options.length) % options.length);
  };
  return (
    <div className="control">
      {label && (
        <p className="label" id={`lbl-${id}`}>
          {label}
        </p>
      )}
      <div
        className="segmented label"
        role="radiogroup"
        aria-labelledby={label ? `lbl-${id}` : undefined}
        aria-label={label ? undefined : ariaLabel}
        onKeyDown={onKeyDown}
      >
        {options.map((o, i) => {
          const on = i === index;
          return (
            <button
              key={o.value}
              ref={el => (refs.current[i] = el)}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              className={on ? 'is-on' : ''}
              onClick={() => choisir(i)}
            >
              {on && (
                <motion.span
                  layoutId={`pill-${id}`}
                  className="seg-pill"
                  transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                />
              )}
              <span className="seg-text">{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <header className="hero">
      <Particles
        className="hero-particles"
        particleColors={[OR.o100, OR.o300, OR.o500, OR.o700]}
        particleCount={220}
        particleSpread={11}
        speed={0.06}
        particleBaseSize={170}
        sizeRandomness={1.4}
        shape="sparkle"
        glow={0.7}
        twinkle={0.7}
        alphaParticles
        moveParticlesOnHover
        particleHoverFactor={0.6}
        drift="up"
        driftSpeed={0.35}
        cameraDistance={18}
        opacity={1}
      />
      <div className="hero-inner">
        <img className="logo" src={logo} alt="YAZ" width="160" height="61" />
        <p className="label eyebrow">
          <Icone nom="triangle" />
          <ShinyText
            text="Lyon · force athlétique · hypertrophie"
            color={OR.o500}
            shineColor={OR.o100}
            speed={2.6}
            delay={2.4}
            shineWidth={34}
          />
        </p>
        <SplitText
          tag="h1"
          text="Choisis ta formule"
          className="display"
          splitType="chars"
          effect="rise"
          delay={32}
          duration={1.05}
          trigger="load"
          textAlign="left"
          accentColor={OR.o500}
          hoverEffect="lift"
        />
        <p className="body-lg muted">Coaching en salle à Lyon ou à distance. Ce que tu économises se calcule tout seul.</p>
      </div>
    </header>
  );
}

// Le mois d’une formule : une case par séance en salle, une ligne pour le suivi à distance
function Mois({ f }) {
  const reduit = useReducedMotion();
  const n = f.seances;
  const distance = f.type !== 'presentiel';
  if (n === 0 && !distance) return null;
  return (
    <div className="mois" aria-hidden="true">
      {n > 0 && n <= 20 && (
        <ol className="pips" style={{ '--n': Math.max(n, 4) }}>
          {Array.from({ length: n }, (_, i) => (
            <motion.li
              key={`${f.id}-${i}`}
              className="pip"
              initial={reduit ? false : { scale: 0.4, opacity: 0.2 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.55 + i * 0.09, type: 'spring', stiffness: 420, damping: 16 }}
            />
          ))}
        </ol>
      )}
      {distance && (
        <motion.div
          key={`${f.id}-ligne`}
          className="ligne"
          initial={reduit ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.55 + n * 0.09, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <div className="mois-legende label">
        {n > 0 && (
          <span>
            <i className="leg-pip" />
            {n} en salle
          </span>
        )}
        {distance && (
          <span>
            <i className="leg-ligne" />
            Suivi à distance
          </span>
        )}
      </div>
    </div>
  );
}

function Phare({ tarifs }) {
  const f = formule(tarifs, tarifs.phare) || tarifs.formules[1];
  const c = calc(tarifs, f);
  const inclus = [];
  if (f.seances > 0) inclus.push(`${seances(f.seances)} en salle par mois avec ton coach`);
  if (f.type !== 'presentiel') inclus.push('Suivi à distance tout le mois');
  if (c.parSeance != null && c.ecoSeance > 0.004)
    inclus.push(`${euros(c.parSeance)} la séance au lieu de ${euros(tarifs.seance)}`);
  if (c.ecoAn > 0.5) inclus.push(`${euros(c.ecoAn)} économisés sur 12 mois par rapport à la carte`);

  return (
    <section className="section" aria-labelledby="t-phare">
      <div className="phare">
        <div className="phare-top">
          <p className="label">La formule phare</p>
          <h2 className="phare-nom" id="t-phare">
            {f.nom}
          </h2>
        </div>
        <p className="price-line">
          <span className="figure-lg">
            <Prix key={f.id} value={f.prix} depart={0} duree={1.6} delai={0.35} />
          </span>
          <span className="label-lg">/ mois</span>
        </p>
        {c.eco > 0.5 && (
          <p className="phare-sub">
            au lieu de <s>{euros(c.carte)}</s> à la carte
          </p>
        )}
        <Mois f={f} />
        <ul className="inclus">
          {inclus.map(t => (
            <li key={t}>
              <Icone nom="check" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Essai({ tarifs }) {
  return (
    <StarBorder
      as="section"
      className="star-wrap"
      color={OR.o100}
      trailColor={OR.o500}
      radius={0}
      thickness={1.5}
      duration={6}
      trailLength={0.35}
      stars={2}
      glow={0.9}
      hover="none"
      clickPulse={false}
      backgroundColor="#13110e"
      borderColor="rgba(233, 180, 58, 0.4)"
      aria-labelledby="t-essai"
    >
      <div className="essai">
        <div className="essai-text">
          <p className="label eyebrow">
            <Icone nom="triangle" />
            Pour commencer
          </p>
          <h2 className="heading" id="t-essai">
            Séance d’essai + bilan
          </h2>
          <p className="small muted">Une première séance en salle et un bilan, avant de choisir ta formule.</p>
        </div>
        <p className="figure">
          <Prix value={tarifs.essai} />
        </p>
      </div>
    </StarBorder>
  );
}

function CarteFormule({ tarifs, f, phare, onCompare }) {
  const c = calc(tarifs, f);
  const lignes = [];
  if (c.eco > 0.5)
    lignes.push(
      <>
        <strong>{euros(c.eco)}</strong> de moins par mois qu’à la carte
      </>
    );
  if (c.ecoSeance > 0.004)
    lignes.push(
      <>
        <strong>{euros(c.ecoSeance)}</strong> de moins par séance qu’à l’unité
      </>
    );
  if (c.ecoAn > 0.5)
    lignes.push(
      <>
        <strong>{euros(c.ecoAn)}</strong> économisés sur 12 mois
      </>
    );

  let detail;
  if (f.type === 'presentiel')
    detail = (
      <>
        <strong>{euros(c.parSeance)}</strong> la séance · {seances(f.seances)} par mois
      </>
    );
  else if (f.type === 'hybride')
    detail = (
      <>
        <strong>{seances(f.seances)}</strong> en salle par mois + suivi à distance
      </>
    );
  else
    detail = (
      <>
        Suivi <strong>100 % à distance</strong>, sans séance en salle
      </>
    );

  return (
    <SpotlightCard
      className="card"
      ambient
      spotlightColor={OR.o500}
      intensity={0.32}
      spotlightSize={230}
      softness={0.8}
      borderGlow={0.8}
      proximity={60}
      style={{
        '--spotlight-card-surface': '#13110e',
        '--spotlight-card-border': phare ? 'rgba(233, 180, 58, 0.6)' : 'rgba(233, 180, 58, 0.14)',
        '--spotlight-card-shadow': 'none'
      }}
    >
      <div className="card-head">
        <h3 className="heading">{f.nom}</h3>
        {phare && (
          <span className="tag label is-best">
            <ShinyText text="Formule phare" color={OR.o500} shineColor={OR.o100} speed={2} delay={1.2} />
          </span>
        )}
      </div>
      <p className="price-line">
        <Prix className="figure" value={f.prix} />
        <span className="label-lg">/ mois</span>
      </p>
      <p className="per">{detail}</p>
      {lignes.length > 0 && (
        <ul className="gains">
          {lignes.map((l, k) => (
            <li key={k}>
              <Icone nom="check" />
              <span>{l}</span>
            </li>
          ))}
        </ul>
      )}
      {f.type !== 'distanciel' && (
        <button type="button" className="link-btn label" onClick={() => onCompare(f)}>
          Comparer
          <Icone nom="arrow" />
        </button>
      )}
    </SpotlightCard>
  );
}

function Formules({ tarifs, onCompare }) {
  const typePhare = formule(tarifs, tarifs.phare)?.type ?? 'hybride';
  const [groupe, setGroupe] = useState(typePhare);
  useEffect(() => setGroupe(typePhare), [typePhare]);
  const type = TYPES.find(t => t.id === groupe);
  const liste = tarifs.formules.filter(f => f.type === groupe);

  return (
    <section className="section" aria-labelledby="t-formules">
      <div className="section-head">
        <h2 className="title" id="t-formules">
          Toutes les formules
        </h2>
        <p className="muted">Prix au mois, comparés aux mêmes séances et au même suivi payés à la carte.</p>
      </div>
      <Segmented
        id="groupe"
        ariaLabel="Type de formule"
        options={TYPES.map(t => ({ value: t.id, label: t.nom }))}
        value={groupe}
        onChange={setGroupe}
      />
      <p className="type-desc">{type.desc}</p>
      <motion.div
        key={groupe}
        className="formules"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {liste.map(f => (
          <CarteFormule key={f.id} tarifs={tarifs} f={f} phare={f.id === tarifs.phare} onCompare={onCompare} />
        ))}
      </motion.div>
    </section>
  );
}

function Comparateur({ tarifs, choix, setChoix, mois, setMois, sectionRef }) {
  const f = formule(tarifs, choix) || formule(tarifs, 'hybride-1');
  const type = TYPES.find(t => t.id === f.type);
  const memeType = tarifs.formules.filter(g => g.type === f.type);
  const c = compare(tarifs, f, mois);
  const periode = mois === 1 ? 'par mois' : `sur ${mois} mois`;
  const max = Math.max(c.carte, c.prix);
  const offertes = Math.floor(c.eco / tarifs.seance + 1e-9);
  const ressort = { type: 'spring', stiffness: 140, damping: 22 };

  const changeType = id => {
    if (id === f.type) return;
    const liste = tarifs.formules.filter(g => g.type === id);
    const cible = liste.find(g => g.id === tarifs.phare) || liste[Math.min(1, liste.length - 1)];
    setChoix(cible.id);
  };

  return (
    <section className="section" id="compare" ref={sectionRef} aria-labelledby="t-compare">
      <div className="section-head">
        <h2 className="title" id="t-compare">
          Compare
        </h2>
        <p className="muted">La formule face aux mêmes séances et au même suivi payés à la carte.</p>
      </div>

      <div className="controls">
        <Segmented
          id="type"
          label="Formule"
          options={TYPES.filter(t => t.id !== 'distanciel').map(t => ({ value: t.id, label: t.nom }))}
          value={f.type}
          onChange={changeType}
        />
        <Segmented
          id={`rythme-${f.type}`}
          label={type.rythme}
          options={memeType.map(g => ({ value: g.id, label: g.court }))}
          value={f.id}
          onChange={setChoix}
        />
        <Segmented
          id="periode"
          label="Sur"
          options={[
            { value: 1, label: '1 mois' },
            { value: 3, label: '3 mois' },
            { value: 12, label: '12 mois' }
          ]}
          value={mois}
          onChange={setMois}
        />
      </div>

      <p className="context">
        <strong>{f.nom}</strong> : {seances(f.seances)} en salle par mois
        {f.type === 'hybride' ? ' et le suivi à distance' : ''}
        {mois > 1 && (
          <>
            , soit <strong>{seances(c.total)}</strong> sur {mois} mois
          </>
        )}
        .
      </p>

      <div className="bars">
        <div className="bar is-carte">
          <div className="bar-top">
            <span className="bar-name">À la carte</span>
            <span className="bar-val">
              <Prix value={c.carte} />
            </span>
          </div>
          <div className="track">
            <motion.div
              className="fill fill-seances"
              initial={false}
              animate={{ width: `${max > 0 ? (c.carteSeances / max) * 100 : 0}%` }}
              transition={ressort}
            />
            <motion.div
              className="fill fill-distance"
              initial={false}
              animate={{ width: `${max > 0 ? (c.carteDistance / max) * 100 : 0}%` }}
              transition={ressort}
            />
          </div>
          <p className="small muted">
            {seances(c.total)} × {euros(tarifs.seance)}
            {c.carteDistance > 0 ? ` + suivi à distance ${euros(prixDistanciel(tarifs))} × ${mois} mois` : ''}
          </p>
        </div>
        <div className="bar is-formule">
          <div className="bar-top">
            <span className="bar-name">
              Avec la formule
              {c.eco > 0.5 && <span className="tag label is-best">Le moins cher</span>}
            </span>
            <span className="bar-val">
              <Prix value={c.prix} />
            </span>
          </div>
          <div className="track">
            <motion.div
              className="fill"
              initial={false}
              animate={{ width: `${max > 0 ? (c.prix / max) * 100 : 0}%` }}
              transition={ressort}
            />
          </div>
          <p className="small muted">
            {euros(f.prix)} × {mois} mois
            {c.parSeance != null ? `, soit ${euros(c.parSeance)} la séance` : ''}
          </p>
        </div>
      </div>

      <div className="result" aria-live="polite">
        {c.eco > 0.5 ? (
          <>
            <p className="label muted">Tu économises {periode}</p>
            <p className="figure-xl accent">
              <Prix value={c.eco} duree={1.1} />
            </p>
            <p>
              par rapport à la carte
              {offertes >= 1 ? `, l’équivalent de ${seances(offertes)} ${pluriel(offertes, 'offerte')}.` : '.'}
            </p>
          </>
        ) : (
          <>
            <p className="label muted">Même prix qu’à la carte</p>
            <p>Cette formule coûte autant que les mêmes séances et le même suivi payés à la carte.</p>
          </>
        )}
      </div>
      <p className="small muted">
        À la carte : séance à {euros(tarifs.seance)}, suivi à distance à {euros(prixDistanciel(tarifs))} par mois.
        « 1 fois par semaine » est compté 4 séances par mois.
      </p>
    </section>
  );
}

function SansFormule({ tarifs }) {
  return (
    <section className="section" aria-labelledby="t-unite">
      <h2 className="title" id="t-unite">
        Sans formule
      </h2>
      <div className="unit">
        <div className="unit-text">
          <p className="label eyebrow">
            <Icone nom="triangle" />À l’unité
          </p>
          <p className="small muted">Une séance en salle, quand tu veux</p>
        </div>
        <p className="price-line">
          <Prix className="figure" value={tarifs.seance} />
          <span className="label-lg">/ séance</span>
        </p>
      </div>
    </section>
  );
}

function Champ({ id, label, valeur, onValide }) {
  const [invalide, setInvalide] = useState(false);
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        defaultValue={valeur}
        aria-invalid={invalide}
        onChange={e => {
          const v = parseFloat(e.target.value.replace(/\s/g, '').replace(',', '.'));
          const ok = Number.isFinite(v) && v > 0;
          setInvalide(!ok);
          if (ok) onValide(v);
        }}
      />
    </label>
  );
}

const enChamp = v => nombre(v, 2).replace(/\s/g, '');

function Reglages({ tarifs, version, modifie, reinitialise, status }) {
  const [confirme, setConfirme] = useState(false);
  useEffect(() => {
    if (!confirme) return undefined;
    const t = setTimeout(() => setConfirme(false), 4000);
    return () => clearTimeout(t);
  }, [confirme]);

  return (
    <details className="settings">
      <summary>
        <span className="title">Réglages</span>
        <Icone nom="plus" className="icon-plus" />
        <Icone nom="close" className="icon-close" />
      </summary>
      <div className="settings-body" key={version}>
        <p className="small muted">
          Pour toi, coach. Change un prix ici : tout le reste se recalcule. Les changements restent sur ce téléphone.
        </p>

        <fieldset>
          <legend className="label">Formule mise en avant</legend>
          <label className="field" htmlFor="in-phare">
            <span>Formule phare</span>
            <select id="in-phare" value={tarifs.phare} onChange={e => modifie(t => (t.phare = e.target.value))}>
              {TYPES.map(type => (
                <optgroup key={type.id} label={type.nom}>
                  {tarifs.formules
                    .filter(f => f.type === type.id)
                    .map(f => (
                      <option key={f.id} value={f.id}>
                        {f.nom}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
        </fieldset>

        <fieldset>
          <legend className="label">Séances</legend>
          <div className="grid-2">
            <Champ
              id="in-essai"
              label="Essai + bilan (€)"
              valeur={enChamp(tarifs.essai)}
              onValide={v => modifie(t => (t.essai = v))}
            />
            <Champ
              id="in-seance"
              label="À l’unité (€)"
              valeur={enChamp(tarifs.seance)}
              onValide={v => modifie(t => (t.seance = v))}
            />
          </div>
        </fieldset>

        {TYPES.map(type => (
          <fieldset key={type.id}>
            <legend className="label">{type.nom} · prix par mois</legend>
            <div className="grid-2">
              {tarifs.formules
                .filter(f => f.type === type.id)
                .map(f => (
                  <Champ
                    key={f.id}
                    id={`f-${f.id}`}
                    label={`${f.nom.replace(/^(Hybride|Présentiel|Distanciel) /, '')} (€)`}
                    valeur={enChamp(f.prix)}
                    onValide={v => modifie(t => (t.formules.find(g => g.id === f.id).prix = v))}
                  />
                ))}
            </div>
          </fieldset>
        ))}

        <div className="settings-actions">
          <button
            type="button"
            className={`btn ghost${confirme ? ' is-confirm' : ''}`}
            onClick={() => {
              if (!confirme) {
                setConfirme(true);
                return;
              }
              setConfirme(false);
              reinitialise();
            }}
          >
            <span className="label">{confirme ? 'Touche encore pour confirmer' : 'Revenir à la grille d’origine'}</span>
          </button>
        </div>
      </div>
      <p className="small status" role="status">
        {status}
      </p>
    </details>
  );
}

const premierComparable = t => {
  const p = formule(t, t.phare);
  return p && p.type !== 'distanciel' ? p.id : 'hybride-1';
};

export default function App() {
  const [tarifs, setTarifs] = useState(() => charge() || copie(DEFAUTS));
  const [choix, setChoix] = useState(() => premierComparable(tarifs));
  const [mois, setMois] = useState(12);
  const [version, setVersion] = useState(0);
  const [status, setStatus] = useState('');
  const compareRef = useRef(null);
  const minuteur = useRef(0);
  const tarifsRef = useRef(tarifs);
  tarifsRef.current = tarifs;

  const annonce = texte => {
    setStatus(texte);
    clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => setStatus(''), 2500);
  };

  // Les champs gardent leur propre texte : on part toujours de l’état le plus récent.
  const modifie = fn => {
    const suivant = copie(tarifsRef.current);
    const phareAvant = suivant.phare;
    fn(suivant);
    tarifsRef.current = suivant;
    setTarifs(suivant);
    if (suivant.phare !== phareAvant) setChoix(premierComparable(suivant));
    annonce(
      enregistre(suivant) ? 'Enregistré sur ce téléphone.' : 'Modifs visibles, mais ce navigateur ne peut pas les garder.'
    );
  };

  const reinitialise = () => {
    efface();
    const t = copie(DEFAUTS);
    tarifsRef.current = t;
    setTarifs(t);
    setChoix(premierComparable(t));
    setVersion(v => v + 1);
    annonce('Grille d’origine remise.');
  };

  const versComparateur = f => {
    setChoix(f.id);
    requestAnimationFrame(() => compareRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <ClickSpark
      sparkColor={[OR.o100, OR.o300, OR.o500]}
      sparkSize={11}
      sparkRadius={24}
      sparkCount={9}
      sparkWidth={2}
      duration={480}
      shape="line"
      className="spark-root"
    >
      <Hero />
      <main className="app">
        <Phare tarifs={tarifs} />
        <Essai tarifs={tarifs} />
        <Formules tarifs={tarifs} onCompare={versComparateur} />
        <Comparateur
          tarifs={tarifs}
          choix={choix}
          setChoix={setChoix}
          mois={mois}
          setMois={setMois}
          sectionRef={compareRef}
        />
        <SansFormule tarifs={tarifs} />
        <Reglages tarifs={tarifs} version={version} modifie={modifie} reinitialise={reinitialise} status={status} />
        <footer className="foot small">
          <span>YAZ Coaching · Lyon</span>
          <span>Tarifs en euros TTC</span>
        </footer>
      </main>
    </ClickSpark>
  );
}
