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
  FORMULES_EXEMPLE,
  NBSP,
  NNBSP,
  calcFormule,
  calcPack,
  charge,
  compare,
  copie,
  efface,
  enregistre,
  estEntier,
  euros,
  nombre,
  nomFormule,
  pluriel,
  seances
} from './tarifs.js';

const OR = { o100: '#fde573', o300: '#f3c650', o500: '#e9b43a', o700: '#d79a24' };

// Les icônes YAZ (trait de 2 px, grille de 24, angles vifs)
const ICONES = {
  triangle: <path d="M12 7.38L18 16.62L6 16.62Z" fill="currentColor" />,
  check: <path d="M4 12L9.5 17.5L20 7" fill="none" stroke="currentColor" strokeWidth="2" />,
  arrow: <path d="M3 12H19.5M13 5.5L19.5 12L13 18.5" fill="none" stroke="currentColor" strokeWidth="2" />,
  plus: <path d="M12 4V20M4 12H20" fill="none" stroke="currentColor" strokeWidth="2" />,
  close: <path d="M5 5L19 19M19 5L5 19" fill="none" stroke="currentColor" strokeWidth="2" />,
  info: (
    <>
      <path d="M3 12A9 9 0 1 0 21 12A9 9 0 1 0 3 12Z M12 11V17" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M11 7L13 7L13 9L11 9Z" fill="currentColor" />
    </>
  )
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
  const [from] = useState(() => (depart ?? value));
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

function Segmented({ id, label, options, value, onChange }) {
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
      <p className="label" id={`lbl-${id}`}>
        {label}
      </p>
      <div className="segmented label" role="radiogroup" aria-labelledby={`lbl-${id}`} onKeyDown={onKeyDown}>
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
        <p className="body-lg muted">
          La séance, le pack et les formules au mois, côte à côte. Les économies se calculent toutes seules.
        </p>
      </div>
    </header>
  );
}

function Pack({ tarifs }) {
  const reduit = useReducedMotion();
  const p = calcPack(tarifs);
  const n = Math.round(tarifs.pack.n);
  const libres = p.eco > 0 ? Math.min(n, Math.max(0, Math.floor(p.offertes + 1e-9))) : 0;
  const pips = n >= 2 && n <= 20;

  let offre;
  if (p.eco <= 0) offre = 'Même prix qu’à l’unité';
  else if (Math.abs(p.offertes - 1) < 1e-9)
    offre = (
      <>
        La {n}
        <sup>e</sup> séance est offerte
      </>
    );
  else if (Math.abs(p.offertes - Math.round(p.offertes)) < 1e-9) offre = `${nombre(p.offertes)} séances offertes`;
  else offre = `Tu économises ${euros(p.eco)} sur le pack`;

  return (
    <section className="section" aria-labelledby="t-seance">
      <h2 className="title" id="t-seance">
        Séance et pack
      </h2>

      <div className="unit">
        <div className="unit-text">
          <p className="label eyebrow">
            <Icone nom="triangle" />À l’unité
          </p>
          <p className="small muted">Sans engagement</p>
        </div>
        <p className="price-line">
          <Prix className="figure" value={tarifs.seance} />
          <span className="label-lg">/ séance</span>
        </p>
      </div>

      <div className="pack">
        <div className="pack-top">
          <p className="label">Pack {seances(tarifs.pack.n)}</p>
          <p className="figure-lg">
            <Prix value={tarifs.pack.prix} depart={0} duree={1.6} delai={0.35} />
          </p>
          <p className="pack-sub">
            {p.eco > 0 && (
              <>
                au lieu de <s>{euros(p.plein)}</s>,{' '}
              </>
            )}
            soit <strong>{euros(p.parSeance)}</strong> la séance
          </p>
        </div>
        {pips && (
          <>
            <ol
              className="pips"
              style={{ '--n': n }}
              aria-label={`${n - libres} ${pluriel(n - libres, 'séance')} ${pluriel(n - libres, 'payée')}, ${libres} ${pluriel(libres, 'séance')} ${pluriel(libres, 'offerte')}`}
            >
              {Array.from({ length: n }, (_, i) => {
                const libre = i >= n - libres;
                return (
                  <motion.li
                    key={`${n}-${libres}-${i}`}
                    className={`pip${libre ? ' free' : ''}`}
                    initial={reduit ? false : { scale: 0.4, opacity: 0.25 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={
                      libre
                        ? { delay: 0.6 + i * 0.07, type: 'spring', stiffness: 420, damping: 14 }
                        : { delay: 0.6 + i * 0.07, duration: 0.25, ease: 'easeOut' }
                    }
                  >
                    {libre && <Icone nom="check" />}
                  </motion.li>
                );
              })}
            </ol>
            {libres > 0 && (
              <div className="pips-legend label">
                <span>
                  {n - libres} {pluriel(n - libres, 'payée')}
                </span>
                <span>
                  {libres} {pluriel(libres, 'offerte')}
                </span>
              </div>
            )}
          </>
        )}
        <p className="pack-free">{offre}</p>
      </div>
    </section>
  );
}

function CarteFormule({ tarifs, f, i, meilleur, onCompare }) {
  const c = calcFormule(tarifs, f);
  const lignes = [];
  if (c.ecartPackSeance > 0.004)
    lignes.push({
      ok: true,
      texte: (
        <>
          <strong>{euros(c.ecartPackSeance)}</strong> de moins par séance qu’avec le pack
        </>
      )
    });
  else if (c.ecartPackSeance < -0.004)
    lignes.push({
      ok: false,
      texte: (
        <>
          <strong>{euros(-c.ecartPackSeance)}</strong> de plus par séance qu’avec le pack
        </>
      )
    });
  else lignes.push({ ok: false, texte: 'Même prix par séance que le pack' });
  if (c.ecartUniteSeance > 0.004)
    lignes.push({
      ok: true,
      texte: (
        <>
          <strong>{euros(c.ecartUniteSeance)}</strong> de moins par séance qu’à l’unité
        </>
      )
    });
  if (c.ecartPackAn > 0.5)
    lignes.push({
      ok: true,
      texte: (
        <>
          <strong>{euros(c.ecartPackAn)}</strong> économisés sur 12 mois par rapport au pack
        </>
      )
    });

  const carte = (
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
        '--spotlight-card-border': meilleur ? 'transparent' : 'rgba(233, 180, 58, 0.14)',
        '--spotlight-card-shadow': 'none'
      }}
    >
      <div className="card-head">
        <h3 className="heading">{nomFormule(f, i)}</h3>
        {meilleur ? (
          <span className="tag label is-best">
            <ShinyText text="Meilleur prix" color={OR.o500} shineColor={OR.o100} speed={2} delay={1.2} />
          </span>
        ) : (
          <span className="tag label">{seances(f.seances)} / mois</span>
        )}
      </div>
      <p className="price-line">
        <Prix className="figure" value={f.prix} />
        <span className="label-lg">/ mois</span>
      </p>
      <p className="per">
        <strong>{euros(c.parSeance)}</strong> la séance
        {meilleur ? ` · ${seances(f.seances)} par mois` : ''}
      </p>
      <ul className="gains">
        {lignes.map((l, k) => (
          <li key={k} className={l.ok ? '' : 'is-worse'}>
            <Icone nom={l.ok ? 'check' : 'info'} />
            <span>{l.texte}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="link-btn label" onClick={() => onCompare(i)}>
        Comparer
        <Icone nom="arrow" />
      </button>
    </SpotlightCard>
  );

  if (!meilleur) return carte;
  return (
    <StarBorder
      as="div"
      className="star-wrap"
      color={OR.o100}
      trailColor={OR.o500}
      radius={0}
      thickness={1.5}
      duration={5}
      trailLength={0.35}
      stars={2}
      glow={0.9}
      hover="none"
      clickPulse={false}
      backgroundColor="transparent"
      borderColor="rgba(233, 180, 58, 0.4)"
    >
      {carte}
    </StarBorder>
  );
}

function Formules({ tarifs, montrerExemple, onCompare }) {
  const pack = calcPack(tarifs);
  let meilleur = -1;
  let min = Infinity;
  tarifs.formules.forEach((f, i) => {
    const v = f.prix / f.seances;
    if (v < min - 1e-9) {
      min = v;
      meilleur = i;
    }
  });
  const montrerMeilleur = tarifs.formules.length > 1 && min < pack.parSeance;

  return (
    <section className="section" aria-labelledby="t-formules">
      <div className="section-head">
        <h2 className="title" id="t-formules">
          Formules au mois
        </h2>
        <p className="muted">Chaque formule comparée au pack et à la séance à l’unité.</p>
      </div>
      {montrerExemple && (
        <p className="note">
          <Icone nom="info" />
          <span>Prix d’exemple. Mets tes vrais prix dans Réglages, en bas de la page.</span>
        </p>
      )}
      {tarifs.formules.length ? (
        <div className="formules">
          {tarifs.formules.map((f, i) => (
            <CarteFormule
              key={i}
              tarifs={tarifs}
              f={f}
              i={i}
              meilleur={montrerMeilleur && i === meilleur}
              onCompare={onCompare}
            />
          ))}
        </div>
      ) : (
        <p className="empty">Aucune formule au mois pour l’instant. Ajoute-en une dans Réglages.</p>
      )}
    </section>
  );
}

function Comparateur({ tarifs, choix, setChoix, mois, setMois, sectionRef }) {
  const c = compare(tarifs, choix, mois);
  const periode = mois === 1 ? 'par mois' : `sur ${mois} mois`;
  const offertes = Math.floor(c.vsUnite / tarifs.seance + 1e-9);

  let resultat;
  if (c.vsPack > 0.5) {
    resultat = (
      <>
        <p className="label muted">Tu économises {periode}</p>
        <p className="figure-xl accent">
          <Prix value={c.vsPack} duree={1.1} />
        </p>
        <p>
          par rapport au pack. Et <strong>{euros(c.vsUnite)}</strong> par rapport à la séance à l’unité
          {offertes >= 1 ? `, l’équivalent de ${seances(offertes)} ${pluriel(offertes, 'offerte')}.` : '.'}
        </p>
      </>
    );
  } else if (c.vsPack < -0.5) {
    resultat = (
      <>
        <p className="label muted">Le pack revient moins cher</p>
        <p className="figure-xl accent">
          <Prix value={-c.vsPack} duree={1.1} />
        </p>
        <p>
          d’écart {periode} en faveur du pack.
          {c.vsUnite > 0.5 && (
            <>
              {' '}
              La formule reste moins chère que l’unité de <strong>{euros(c.vsUnite)}</strong>.
            </>
          )}
        </p>
      </>
    );
  } else {
    resultat = (
      <>
        <p className="label muted">Même prix que le pack</p>
        <p>
          La formule et le pack reviennent au même {periode}.
          {c.vsUnite > 0.5 && (
            <>
              {' '}
              Tu économises <strong>{euros(c.vsUnite)}</strong> par rapport à l’unité.
            </>
          )}
        </p>
      </>
    );
  }

  return (
    <section className="section" id="compare" ref={sectionRef} aria-labelledby="t-compare">
      <div className="section-head">
        <h2 className="title" id="t-compare">
          Compare
        </h2>
        <p className="muted">Le même nombre de séances, trois façons de payer.</p>
      </div>

      <div className="controls">
        <Segmented
          id="formule"
          label="Formule"
          options={tarifs.formules.map((f, i) => ({ value: i, label: nomFormule(f, i) }))}
          value={choix}
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
        <strong>{seances(c.f.seances)}</strong> par mois
        {mois > 1 && (
          <>
            , soit <strong>{seances(c.total)}</strong> sur {mois} mois
          </>
        )}
      </p>

      <div className="bars">
        {c.lignes.map(l => {
          const best = Math.abs(l.cout - c.min) < 0.005;
          const largeur = c.max > 0 ? (l.cout / c.max) * 100 : 0;
          return (
            <div key={l.cle} className={`bar is-${l.cle}`}>
              <div className="bar-top">
                <span className="bar-name">
                  {l.nom}
                  {best && <span className="tag label is-best">Le moins cher</span>}
                </span>
                <span className="bar-val">
                  <Prix value={l.cout} />
                </span>
              </div>
              <div className="track">
                <motion.div
                  className="fill"
                  initial={false}
                  animate={{ width: `${largeur}%` }}
                  transition={{ type: 'spring', stiffness: 140, damping: 22 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="result" aria-live="polite">
        {resultat}
      </div>
      <p className="small muted">Le pack est compté au prorata : {euros(c.pack.parSeance)} la séance.</p>
    </section>
  );
}

function Champ({ id, label, valeur, entier, onValide, inputMode = 'decimal' }) {
  const [invalide, setInvalide] = useState(false);
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        type="text"
        inputMode={inputMode}
        autoComplete="off"
        defaultValue={valeur}
        aria-invalid={invalide}
        onChange={e => {
          const v = parseFloat(e.target.value.replace(/\s/g, '').replace(',', '.'));
          const ok = Number.isFinite(v) && v > 0 && (!entier || Math.round(v) === v);
          setInvalide(!ok);
          if (ok) onValide(v);
        }}
      />
    </label>
  );
}

const enChamp = v => nombre(v, 2).replace(/\s/g, '');

function Reglages({ tarifs, version, modifie, ajoute, retire, reinitialise, status }) {
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
          Pour toi, coach. Change tes prix ici : tout le reste se recalcule. Ils restent enregistrés sur ce téléphone.
        </p>

        <fieldset>
          <legend className="label">Séance et pack</legend>
          <div className="grid-3">
            <Champ
              id="in-seance"
              label="Séance (€)"
              valeur={enChamp(tarifs.seance)}
              onValide={v => modifie(t => (t.seance = v))}
            />
            <Champ
              id="in-pack-n"
              label="Séances du pack"
              valeur={String(tarifs.pack.n)}
              entier
              inputMode="numeric"
              onValide={v => modifie(t => (t.pack.n = v))}
            />
            <Champ
              id="in-pack-prix"
              label="Pack (€)"
              valeur={enChamp(tarifs.pack.prix)}
              onValide={v => modifie(t => (t.pack.prix = v))}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend className="label">Formules au mois</legend>
          <div className="formules">
            {tarifs.formules.map((f, i) => (
              <div className="frow" key={i}>
                <label className="field field-name" htmlFor={`f-nom-${i}`}>
                  <span>Nom de la formule</span>
                  <input
                    id={`f-nom-${i}`}
                    type="text"
                    autoComplete="off"
                    defaultValue={f.nom}
                    maxLength={40}
                    onChange={e => {
                      const nom = e.target.value;
                      modifie(t => (t.formules[i].nom = nom));
                    }}
                  />
                </label>
                <Champ
                  id={`f-seances-${i}`}
                  label="Séances / mois"
                  valeur={String(f.seances)}
                  entier
                  inputMode="numeric"
                  onValide={v => modifie(t => (t.formules[i].seances = v))}
                />
                <Champ
                  id={`f-prix-${i}`}
                  label="Prix / mois (€)"
                  valeur={enChamp(f.prix)}
                  onValide={v => modifie(t => (t.formules[i].prix = v))}
                />
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Supprimer la formule ${nomFormule(f, i)}`}
                  onClick={() => retire(i)}
                >
                  <Icone nom="close" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="btn" onClick={ajoute}>
            <Icone nom="plus" />
            <span className="label">Ajouter une formule</span>
          </button>
        </fieldset>

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
            <span className="label">{confirme ? 'Touche encore pour confirmer' : 'Revenir aux prix d’origine'}</span>
          </button>
        </div>
      </div>
      <p className="small status" role="status">
        {status}
      </p>
    </details>
  );
}

export default function App() {
  const [depart] = useState(() => charge());
  const [tarifs, setTarifs] = useState(() => depart || copie(DEFAUTS));
  const [perso, setPerso] = useState(() => !!depart);
  const [choix, setChoix] = useState(1);
  const [mois, setMois] = useState(12);
  const [version, setVersion] = useState(0);
  const [status, setStatus] = useState('');
  const compareRef = useRef(null);
  const minuteur = useRef(0);

  const choixValide = Math.min(choix, Math.max(0, tarifs.formules.length - 1));

  const annonce = texte => {
    setStatus(texte);
    clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => setStatus(''), 2500);
  };

  const applique = (suivant, remonte) => {
    setTarifs(suivant);
    setPerso(true);
    if (remonte) setVersion(v => v + 1);
    annonce(
      enregistre(suivant) ? 'Enregistré sur ce téléphone.' : 'Modifs visibles, mais ce navigateur ne peut pas les garder.'
    );
  };

  // Les champs gardent leur propre texte : on lit toujours l’état le plus récent pour les modifs en rafale.
  const tarifsRef = useRef(tarifs);
  tarifsRef.current = tarifs;
  const modifieRecent = fn => {
    const suivant = copie(tarifsRef.current);
    fn(suivant);
    tarifsRef.current = suivant;
    applique(suivant, false);
  };

  const ajoute = () => {
    const suivant = copie(tarifsRef.current);
    suivant.formules.push({
      nom: `Formule ${suivant.formules.length + 1}`,
      seances: 4,
      prix: Math.round(suivant.seance * 4 * 0.9)
    });
    applique(suivant, true);
  };

  const retire = i => {
    const suivant = copie(tarifsRef.current);
    suivant.formules.splice(i, 1);
    applique(suivant, true);
  };

  const reinitialise = () => {
    efface();
    setTarifs(copie(DEFAUTS));
    setPerso(false);
    setChoix(1);
    setVersion(v => v + 1);
    annonce('Prix d’origine remis.');
  };

  const versComparateur = i => {
    setChoix(i);
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
        <Pack tarifs={tarifs} />
        <Formules
          tarifs={tarifs}
          montrerExemple={!perso && FORMULES_EXEMPLE}
          onCompare={versComparateur}
        />
        {tarifs.formules.length > 0 && (
          <Comparateur
            tarifs={tarifs}
            choix={choixValide}
            setChoix={setChoix}
            mois={mois}
            setMois={setMois}
            sectionRef={compareRef}
          />
        )}
        <Reglages
          tarifs={tarifs}
          version={version}
          modifie={modifieRecent}
          ajoute={ajoute}
          retire={retire}
          reinitialise={reinitialise}
          status={status}
        />
        <footer className="foot small">
          <span>YAZ Coaching · Lyon</span>
          <span>Tarifs en euros TTC</span>
        </footer>
      </main>
    </ClickSpark>
  );
}
