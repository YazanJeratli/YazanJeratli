import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

import ClickSpark from './reactbits/ClickSpark.jsx';
import CountUp from './reactbits/CountUp.jsx';
import Particles from './reactbits/Particles.jsx';
import ShinyText from './reactbits/ShinyText.jsx';
import SplitText from './reactbits/SplitText.jsx';
import SpotlightCard from './reactbits/SpotlightCard.jsx';
import StarBorder from './reactbits/StarBorder.jsx';
import logo from '../assets/logo.png';
import {
  DEFAUTS,
  NBSP,
  NNBSP,
  PARRAINAGE,
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
  close: <path d="M5 5L19 19M19 5L5 19" fill="none" stroke="currentColor" strokeWidth="2" />,
  trophy: (
    <path
      d="M7 3H17V9.5L14.5 13H9.5L7 9.5Z M7 5H3.5V7.5L7 9.5 M17 5H20.5V7.5L17 9.5 M12 13V20 M7 20H17"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
  ),
  list: (
    <>
      <path d="M3 4.5L6 4.5L6 7.5L3 7.5Z M3 10.5L6 10.5L6 13.5L3 13.5Z M3 16.5L6 16.5L6 19.5L3 19.5Z" fill="currentColor" />
      <path d="M9 6H21M9 12H21M9 18H21" fill="none" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  trending: (
    <path d="M2.5 17.5L9 11L13 15L21.5 6.5 M14.5 6.5H21.5V13.5" fill="none" stroke="currentColor" strokeWidth="2" />
  ),
  user: (
    <path d="M8 7A4 4 0 1 0 16 7A4 4 0 1 0 8 7Z M4 21V17.5L7.5 14H16.5L20 17.5V21" fill="none" stroke="currentColor" strokeWidth="2" />
  ),
  back: <path d="M7.38 12L16.62 6L16.62 8.38L11.05 12L16.62 15.62L16.62 18Z" fill="currentColor" />,
  dumbbell: (
    <>
      <path d="M9.17 14.83L14.83 9.17" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M2.81 13.41L5.28 10.94L13.06 18.72L10.59 21.19Z M10.94 5.28L13.41 2.81L21.19 10.59L18.72 13.06Z" fill="currentColor" />
    </>
  ),
  calendar: <path d="M3 5H21V21H3Z M3 10H21 M8 2V7 M16 2V7" fill="none" stroke="currentColor" strokeWidth="2" />,
  chevrons: (
    <path
      d="M12 3.38L18 12.62L15.62 12.62L12 7.05L8.38 12.62L6 12.62Z M12 11.38L18 20.62L15.62 20.62L12 15.05L8.38 20.62L6 20.62Z"
      fill="currentColor"
    />
  )
};

// Une icône dans sa petite case arrondie, comme dans YAZ Force
function Case({ nom, className = '' }) {
  return (
    <span className={`ico ${className}`}>
      <Icone nom={nom} />
    </span>
  );
}

const ICONE_TYPE = { hybride: 'chevrons', presentiel: 'dumbbell', distanciel: 'list' };

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
            >
              {n <= 8 ? i + 1 : ''}
            </motion.li>
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

function Phare({ tarifs, onParrainage }) {
  const f = formule(tarifs, tarifs.phare) || tarifs.formules[1];
  const c = calc(tarifs, f);
  const inclus = [];
  if (f.seances > 0) inclus.push(`${seances(f.seances)} en salle par mois avec ton coach`);
  if (f.type !== 'presentiel') inclus.push('Suivi à distance tout le mois');
  if (c.parSeance != null && c.ecoSeance > 0.004)
    inclus.push(`${euros(c.parSeance)} la séance au lieu de ${euros(tarifs.seance)}`);
  if (c.ecoAn > 0.5) inclus.push(`${euros(c.ecoAn)} économisés sur 12 mois par rapport à la carte`);

  return (
    <section className="section" id="phare" aria-labelledby="t-phare">
      <div className="phare">
        <div className="phare-top">
          <span className="pill-or label">
            <Icone nom="trophy" />
            Formule phare
          </span>
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
              <Case nom="check" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
      <BoutonParrainage onOuvre={onParrainage} />
    </section>
  );
}

function BoutonParrainage({ onOuvre }) {
  const pct = Math.round(PARRAINAGE.remiseParFilleul * 100);
  return (
    <button type="button" className="bouton-parrain" onClick={onOuvre}>
      <Case nom="user" className="ico-or" />
      <span className="bp-texte">
        <span className="bp-titre">Parrainage</span>
        <span className="small muted">
          −{pct}{NBSP}% par ami abonné, jusqu’à −{pct * PARRAINAGE.maxFilleuls}{NBSP}%
        </span>
      </span>
      <span className="bp-fleche">
        <Icone nom="arrow" />
      </span>
    </button>
  );
}

function Essai({ tarifs }) {
  return (
    <StarBorder
      as="section"
      className="star-wrap"
      color={OR.o100}
      trailColor={OR.o500}
      radius={18}
      thickness={1.5}
      duration={6}
      trailLength={0.35}
      stars={2}
      glow={0.9}
      hover="none"
      clickPulse={false}
      backgroundColor="#151518"
      borderColor="rgba(233, 180, 58, 0.3)"
      id="essai"
      aria-labelledby="t-essai"
    >
      <div className="essai">
        <Case nom="calendar" className="ico-or" />
        <div className="essai-text">
          <p className="label accent">Pour commencer</p>
          <h2 className="heading" id="t-essai">
            Séance d’essai + bilan
          </h2>
          <p className="small muted">Une première séance en salle et un bilan, avant de choisir ta formule.</p>
        </div>
        <p className="essai-prix">
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
        '--spotlight-card-surface': '#151518',
        '--spotlight-card-border': phare ? 'rgba(233, 180, 58, 0.55)' : 'rgba(255, 255, 255, 0.08)',
        '--spotlight-card-shadow': 'none'
      }}
    >
      <div className="card-head">
        <Case nom={ICONE_TYPE[f.type]} className={phare ? 'ico-or' : ''} />
        <h3 className="card-nom">{f.nom}</h3>
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
      <MiniDuel c={c} prix={f.prix} />
      <p className="per">{detail}</p>
      {lignes.length > 0 && (
        <ul className="gains">
          {lignes.map((l, k) => (
            <li key={k}>
              <Case nom="check" />
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
    <section className="section" id="formules" aria-labelledby="t-formules">
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

const RESSORT = { type: 'spring', stiffness: 120, damping: 20 };

// Le duel : deux lames découpées mois par mois, la zone d’économie hachurée et pointée
function Duel({ c, tarifs }) {
  const reduit = useReducedMotion();
  const segments = c.mois;
  const part = c.carte > 0 ? (c.carteSeances / c.carte) * 100 : 100;
  const prixPct = c.carte > 0 ? Math.min(100, (c.prix / c.carte) * 100) : 100;
  const ecoPct = Math.max(0, 100 - prixPct);
  const cle = `${c.f.id}-${c.mois}`;
  const unite = c.mois > 1 ? '1 case = 1 mois' : '1 case = 1 séance';

  return (
    <div className="duel">
      <div className="duel-row">
        <div className="bar-top">
          <span className="bar-name">À la carte</span>
          <span className="bar-val">
            <Prix value={c.carte} />
          </span>
        </div>
        <div className="duel-lame">
        <motion.div
          key={cle}
          className="duel-bar carte"
          initial={reduit ? false : { clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {c.mois > 1 ? (
            Array.from({ length: segments }, (_, i) => (
              <span key={i} className="seg" style={{ '--part': `${part}%` }} />
            ))
          ) : (
            <>
              {Array.from({ length: c.f.seances }, (_, i) => (
                <span key={i} className="seg" style={{ '--part': '100%', flexGrow: tarifs.seance }} />
              ))}
              {c.carteDistance > 0 && (
                <span className="seg" style={{ '--part': '0%', flexGrow: c.carteDistance }} />
              )}
            </>
          )}
        </motion.div>
        </div>
        <p className="duel-legende small muted">
          <span>
            <i className="sw sw-seances" />
            {seances(c.total)} × {euros(tarifs.seance)}
          </span>
          {c.carteDistance > 0 && (
            <span>
              <i className="sw sw-distance" />
              suivi à distance × {c.mois}
            </span>
          )}
        </p>
      </div>

      <div className="duel-row">
        <div className="bar-top">
          <span className="bar-name">
            Avec la formule
            {c.eco > 0.5 && <span className="tag label is-best">Le moins cher</span>}
          </span>
          <span className="bar-val">
            <Prix value={c.prix} />
          </span>
        </div>
        <div className="duel-track">
          <motion.div
            className="duel-bar formule"
            initial={false}
            animate={{ width: `${prixPct}%` }}
            transition={RESSORT}
          >
            {Array.from({ length: c.mois > 1 ? c.mois : 1 }, (_, i) => (
              <span key={i} className="seg" />
            ))}
          </motion.div>
          {ecoPct > 0.3 && (
            <motion.div
              className="duel-eco"
              initial={false}
              animate={{ width: `${ecoPct}%` }}
              transition={RESSORT}
            />
          )}
        </div>
        {ecoPct > 0.3 ? (
          <div className="duel-pointe">
            <motion.span
              className="pointe"
              initial={false}
              animate={{ left: `clamp(48px, ${prixPct + ecoPct / 2}%, calc(100% - 48px))` }}
              transition={RESSORT}
            >
              <Icone nom="triangle" />
              <span className="label">−{euros(c.eco)}</span>
            </motion.span>
          </div>
        ) : null}
        <p className="duel-legende small muted">
          <span>
            <i className="sw sw-formule" />
            {euros(c.f.prix)} × {c.mois} mois
            {c.parSeance != null ? `, soit ${euros(c.parSeance)} la séance` : ''}
          </span>
          {ecoPct > 0.3 && (
            <span>
              <i className="sw sw-eco" />
              ton économie
            </span>
          )}
          <span className="duel-unite">{unite}</span>
        </p>
      </div>
    </div>
  );
}

// Les séances offertes, en jetons qui tombent un par un
function Jetons({ n }) {
  const reduit = useReducedMotion();
  const MAX = 24;
  const vus = Math.min(n, MAX);
  return (
    <div className="jetons" aria-hidden="true">
      {Array.from({ length: vus }, (_, i) => (
        <motion.span
          key={`${n}-${i}`}
          className="jeton"
          initial={reduit ? false : { scale: 0, rotate: -35, y: -10 }}
          animate={{ scale: 1, rotate: 0, y: 0 }}
          transition={{ delay: 0.25 + i * 0.045, type: 'spring', stiffness: 520, damping: 17 }}
        >
          <Icone nom="check" />
        </motion.span>
      ))}
      {n > MAX && <span className="jeton-plus label">+{n - MAX}</span>}
    </div>
  );
}

// Sur chaque carte : le prix de la formule face au prix à la carte
function MiniDuel({ c, prix }) {
  const reduit = useReducedMotion();
  if (!(c.eco > 0.5) || !(c.carte > 0)) return null;
  const pct = (prix / c.carte) * 100;
  return (
    <div className="mini" aria-hidden="true">
      <div className="mini-track">
        <motion.span
          className="mini-fill"
          initial={reduit ? false : { width: '100%' }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="mini-legende small">
        <span className="muted">À la carte {euros(c.carte)}</span>
        <span className="accent">−{euros(c.eco)} / mois</span>
      </div>
    </div>
  );
}

function Comparateur({ tarifs, choix, setChoix, mois, setMois, sectionRef }) {
  const f = formule(tarifs, choix) || formule(tarifs, 'hybride-1');
  const type = TYPES.find(t => t.id === f.type);
  const memeType = tarifs.formules.filter(g => g.type === f.type);
  const c = compare(tarifs, f, mois);
  const periode = mois === 1 ? 'par mois' : `sur ${mois} mois`;
  const offertes = Math.floor(c.eco / tarifs.seance + 1e-9);

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

      <div className="panel">
        <Duel c={c} tarifs={tarifs} />
      </div>

      <div className="result" aria-live="polite">
        {c.eco > 0.5 ? (
          <>
            <div className="tuile tuile-or">
              <p className="small">Tu économises {periode}</p>
              <p className="figure-xl">
                <Prix value={c.eco} duree={1.1} />
              </p>
              <p className="small">par rapport à la carte</p>
            </div>
            <div className="tuiles">
              <div className="tuile">
                <p className="small muted">Séances offertes</p>
                <p className="tuile-val">{offertes}</p>
              </div>
              <div className="tuile">
                <p className="small muted">{c.parSeance != null ? 'Prix par séance' : 'Économie par mois'}</p>
                <p className="tuile-val">{euros(c.parSeance != null ? c.parSeance : c.eco / c.mois)}</p>
              </div>
            </div>
            {offertes >= 1 && <Jetons n={offertes} />}
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

const MESSAGE_PARRAIN =
  'Je m’entraîne avec YAZ Coaching à Lyon (force athlétique et musculation). Viens faire une séance d’essai + bilan avec mon coach, et dis-lui que tu viens de ma part.';

function Parrainage({ tarifs }) {
  const reduit = useReducedMotion();
  const [id, setId] = useState(tarifs.phare);
  const [n, setN] = useState(1);
  const [copie, setCopie] = useState('');
  const texteRef = useRef(null);
  const f = formule(tarifs, id) || formule(tarifs, tarifs.phare);
  const max = PARRAINAGE.maxFilleuls;
  const taux = PARRAINAGE.remiseParFilleul;
  const remise = f.prix * taux * n;
  const pct = Math.round(taux * 100);

  const touche = i => setN(n === i ? i - 1 : i);

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(MESSAGE_PARRAIN);
      setCopie('Message copié.');
    } catch (e) {
      const sel = window.getSelection();
      const r = document.createRange();
      r.selectNodeContents(texteRef.current);
      sel.removeAllRanges();
      sel.addRange(r);
      setCopie('Texte sélectionné : copie-le avec ton téléphone.');
    }
    setTimeout(() => setCopie(''), 3000);
  };

  return (
    <section className="section" aria-labelledby="t-parrainage">
      <div className="section-head">
        <h1 className="title" id="t-parrainage">
          Parrainage
        </h1>
        <p className="muted">Ton ami s’abonne, ton abonnement baisse. Chaque mois, tant qu’il reste.</p>
      </div>

      <ol className="etapes">
        <li>
          <span className="etape-num">1</span>
          <div>
            <p className="etape-titre">Ton ami fait sa séance d’essai</p>
            <p className="small muted">Il dit qu’il vient de ta part.</p>
          </div>
        </li>
        <li>
          <span className="etape-num">2</span>
          <div>
            <p className="etape-titre">Il prend une formule</p>
            <p className="small muted">La remise démarre après son premier mois payé.</p>
          </div>
        </li>
        <li>
          <span className="etape-num">3</span>
          <div>
            <p className="etape-titre">
              Tu as −{pct}{NBSP}% sur ton abonnement
            </p>
            <p className="small muted">Chaque mois, tant qu’il reste abonné.</p>
          </div>
        </li>
      </ol>

      <div className="parrain-calc">
        <label className="field" htmlFor="pa-formule">
          <span>Ton abonnement</span>
          <select id="pa-formule" value={f.id} onChange={e => setId(e.target.value)}>
            {TYPES.map(type => (
              <optgroup key={type.id} label={type.nom}>
                {tarifs.formules
                  .filter(g => g.type === type.id)
                  .map(g => (
                    <option key={g.id} value={g.id}>
                      {g.nom} · {euros(g.prix)}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>

        <div className="control">
          <p className="label">Filleuls abonnés · {max} maximum</p>
          <div className="slots">
            {Array.from({ length: max }, (_, k) => {
              const i = k + 1;
              const on = n >= i;
              return (
                <button
                  key={i}
                  type="button"
                  className={`slot${on ? ' is-on' : ''}`}
                  aria-pressed={on}
                  aria-label={`Filleul ${i}`}
                  onClick={() => touche(i)}
                >
                  {on && (
                    <motion.span
                      className="slot-fond"
                      initial={reduit ? false : { scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                    />
                  )}
                  <span className="slot-pct">−{pct}{NBSP}%</span>
                  <span className="slot-nom label">
                    <Icone nom={on ? 'check' : 'plus'} />
                    Filleul {i}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="parrain-res" aria-live="polite">
          <div className="parrain-res-top">
            <p className="label muted">
              Ton abonnement avec {n} {pluriel(n, 'filleul')}
            </p>
            <span className={`badge label${n ? ' is-on' : ''}`}>
              −{pct * n}{NBSP}%
            </span>
          </div>
          <p className="price-line">
            <span className="figure-lg">
              <Prix value={f.prix - remise} />
            </span>
            <span className="label-lg">/ mois</span>
          </p>
          {n > 0 ? (
            <p>
              au lieu de <s>{euros(f.prix)}</s> : <strong className="accent">{euros(remise)} de moins par mois</strong>,
              soit {euros(remise * 12)} sur 12 mois.
            </p>
          ) : (
            <p className="muted">Touche un filleul pour voir la remise.</p>
          )}
        </div>
      </div>

      <ul className="regles small muted">
        <li>
          {max} filleuls maximum : −{pct * max}{NBSP}% au plus.
        </li>
        <li>La remise démarre après le premier mois payé du filleul et s’arrête s’il arrête son abonnement.</li>
        <li>Le filleul doit être un nouveau client. Pas de cumul avec une autre promo.</li>
      </ul>

      <div className="message">
        <p className="label muted">Le message à envoyer à tes amis</p>
        <p className="message-texte" ref={texteRef}>
          {MESSAGE_PARRAIN}
        </p>
        <div className="message-actions">
          <button type="button" className="btn" onClick={copier}>
            <span className="label">Copier le message</span>
          </button>
          <p className="small muted" role="status">
            {copie}
          </p>
        </div>
      </div>
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
        <Case nom="dumbbell" />
        <div className="unit-text">
          <p className="unit-titre">À l’unité</p>
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
          Change un prix : tout le reste se recalcule. Les changements restent sur ce téléphone.
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

const SECTIONS = [
  { id: 'phare', nom: 'Phare', icone: 'trophy' },
  { id: 'essai', nom: 'Essai', icone: 'calendar' },
  { id: 'formules', nom: 'Formules', icone: 'list' },
  { id: 'compare', nom: 'Compare', icone: 'trending' }
];

// Barre du bas : un appui pour sauter à la partie que tu expliques
function Nav() {
  const [actif, setActif] = useState('phare');
  useEffect(() => {
    const els = SECTIONS.map(x => document.getElementById(x.id)).filter(Boolean);
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && setActif(e.target.id)),
      { rootMargin: '-35% 0px -60% 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  const va = id => {
    setActif(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <nav className="nav" aria-label="Parties de la page">
      {SECTIONS.map(x => {
        const on = actif === x.id;
        return (
          <button
            key={x.id}
            type="button"
            className={on ? 'is-on' : ''}
            aria-current={on ? 'true' : undefined}
            onClick={() => va(x.id)}
          >
            {on && (
              <motion.span
                layoutId="nav-barre"
                className="nav-barre"
                transition={{ type: 'spring', stiffness: 520, damping: 40 }}
              />
            )}
            <Icone nom={x.icone} />
            <span className="nav-nom">{x.nom}</span>
          </button>
        );
      })}
    </nav>
  );
}

// Garde l’écran allumé tant que l’appli est ouverte (si le téléphone l’accepte)
function useEcranAllume() {
  useEffect(() => {
    let verrou = null;
    let actif = true;
    const demande = async () => {
      try {
        if (actif && document.visibilityState === 'visible' && navigator.wakeLock) {
          verrou = await navigator.wakeLock.request('screen');
        }
      } catch (e) {
        /* refusé : l’écran se mettra en veille normalement */
      }
    };
    const onVisible = () => document.visibilityState === 'visible' && demande();
    demande();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      actif = false;
      document.removeEventListener('visibilitychange', onVisible);
      verrou?.release?.().catch(() => {});
    };
  }, []);
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
  useEcranAllume();

  // Deux vues : l’accueil et la page Parrainage (#parrainage)
  const lireVue = () => (window.location.hash === '#parrainage' ? 'parrainage' : 'accueil');
  const [vue, setVue] = useState(lireVue);
  const scrollAccueil = useRef(0);
  useEffect(() => {
    const onHash = () => setVue(lireVue());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    const y = vue === 'parrainage' ? 0 : scrollAccueil.current;
    requestAnimationFrame(() => window.scrollTo(0, y));
  }, [vue]);
  const ouvreParrainage = () => {
    scrollAccueil.current = window.scrollY;
    setVue('parrainage');
    try {
      window.location.hash = 'parrainage';
    } catch (e) {
      /* la vue change quand même */
    }
  };
  const retourAccueil = () => {
    setVue('accueil');
    try {
      if (window.location.hash) window.location.hash = '';
    } catch (e) {
      /* la vue change quand même */
    }
  };

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
      <div className="vue" hidden={vue !== 'accueil'}>
        <Hero />
        <main className="app">
          <Phare tarifs={tarifs} onParrainage={ouvreParrainage} />
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
        <Nav />
      </div>
      <div className="vue" hidden={vue !== 'parrainage'}>
        <header className="page-top">
          <button type="button" className="retour" onClick={retourAccueil}>
            <Icone nom="back" />
            Retour
          </button>
          <img className="page-logo" src={logo} alt="YAZ" width="84" height="32" />
        </header>
        <main className="app app-page">
          <Parrainage tarifs={tarifs} />
          <button type="button" className="btn btn-plein" onClick={retourAccueil}>
            <Icone nom="back" />
            <span>Retour aux formules</span>
          </button>
        </main>
      </div>
    </ClickSpark>
  );
}
