// app.jsx — petals + tweaks panel for the Sakura portfolio

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#fbf3ee", "#f3b9cb", "#c97a8d", "#2a1f24"],
  "petals": 12,
  "hero": "branch"
}/*EDITMODE-END*/;

// Four curated palettes. Index 0 of each array shows in the swatch card.
// [bg, blossom, accent, ink]
const PALETTES = {
  "#fbf3ee,#f3b9cb,#c97a8d,#2a1f24": {
    name: "Sakura Cream",
    bg: "#fbf3ee", paper: "#f7ebe2", paper2: "#f0e0d3",
    blossom: "#f3b9cb", blossom2: "#ecd0d8",
    ink: "#2a1f24", ink2: "#5a4a4f", accent: "#c97a8d",
    gold: "#c89760", sage: "#9aae8e", lavender: "#b0a3c4",
    line: "rgba(42,31,36,0.10)"
  },
  "#f3eee7,#f3b9cb,#9aae8e,#2b2a26": {
    name: "Sage Garden",
    bg: "#f3eee7", paper: "#ebe5db", paper2: "#dfd9cc",
    blossom: "#f3b9cb", blossom2: "#e6d4d0",
    ink: "#2b2a26", ink2: "#5a5953", accent: "#8a9d7e",
    gold: "#b89770", sage: "#9aae8e", lavender: "#b0a3c4",
    line: "rgba(43,42,38,0.10)"
  },
  "#1c1820,#f3b9cb,#e89c7a,#f6ecef": {
    name: "Hanami Dusk",
    bg: "#1c1820", paper: "#251f29", paper2: "#2d2533",
    blossom: "#f3b9cb", blossom2: "#d49aa8",
    ink: "#f6ecef", ink2: "#b8a8b0", accent: "#f0a8b8",
    gold: "#e8c084", sage: "#a8b89a", lavender: "#c0b0d4",
    line: "rgba(246,236,239,0.12)"
  },
  "#fdf3eb,#f3b9cb,#d4885f,#2c1f1c": {
    name: "Sunset Path",
    bg: "#fdf3eb", paper: "#f9e8d8", paper2: "#f3d9c0",
    blossom: "#f3b9cb", blossom2: "#f1c8b0",
    ink: "#2c1f1c", ink2: "#5e4a42", accent: "#d4885f",
    gold: "#d4a563", sage: "#a3a87e", lavender: "#b8a3a0",
    line: "rgba(44,31,28,0.10)"
  }
};

const PALETTE_OPTIONS = Object.keys(PALETTES).map(k => k.split(','));

function applyPalette(arr) {
  const key = arr.join(',');
  const p = PALETTES[key];
  if (!p) return;
  const r = document.documentElement.style;
  r.setProperty('--bg', p.bg);
  r.setProperty('--paper', p.paper);
  r.setProperty('--paper-2', p.paper2);
  r.setProperty('--blossom', p.blossom);
  r.setProperty('--blossom-2', p.blossom2);
  r.setProperty('--ink', p.ink);
  r.setProperty('--ink-2', p.ink2);
  r.setProperty('--accent', p.accent);
  r.setProperty('--gold', p.gold);
  r.setProperty('--sage', p.sage);
  r.setProperty('--lavender', p.lavender);
  r.setProperty('--line', p.line);
}

// ── petals layer ──────────────────────────────────────────
function Petals({ count }) {
  // generate stable petal params keyed by index (so changing count doesn't
  // re-randomize the survivors)
  const petals = React.useMemo(() => {
    const out = [];
    for (let i = 0; i < 60; i++) {
      const rng = mulberry32(1337 + i * 91);
      out.push({
        x: `${(rng() * 100).toFixed(2)}vw`,
        sway: `${(40 + rng() * 90).toFixed(0)}px`,
        size: `${(10 + rng() * 18).toFixed(1)}px`,
        duration: `${(14 + rng() * 16).toFixed(1)}s`,
        delay: `${(-rng() * 30).toFixed(1)}s`,
        alpha: (0.55 + rng() * 0.4).toFixed(2),
        rotInit: `${(rng() * 360).toFixed(0)}deg`,
        tint: rng() < 0.5 ? 'var(--blossom)' : 'var(--blossom-2)'
      });
    }
    return out;
  }, []);

  return petals.slice(0, count).map((p, i) => (
    <span
      key={i}
      className="petal"
      style={{
        '--x': p.x,
        '--sway': p.sway,
        '--s': p.size,
        '--d': p.duration,
        '--delay': p.delay,
        '--a': p.alpha,
        color: p.tint
      }}
    >
      <svg viewBox="0 0 100 100" style={{ transform: `rotate(${p.rotInit})` }}>
        <use href="#sakura-petal" />
      </svg>
    </span>
  ));
}

// deterministic PRNG
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ── main app ──────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => { applyPalette(t.palette); }, [t.palette]);
  React.useEffect(() => {
    document.body.setAttribute('data-hero', t.hero);
  }, [t.hero]);

  // mount petals into the petals-root portal
  const petalsRoot = document.getElementById('petals-root');

  return (
    <>
      {petalsRoot && ReactDOM.createPortal(
        <Petals count={t.petals} />,
        petalsRoot
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Atmosphere" />
        <TweakColor
          label="Palette"
          value={t.palette}
          options={PALETTE_OPTIONS}
          onChange={(v) => setTweak('palette', v)}
        />
        <TweakSlider
          label="Petals"
          value={t.petals}
          min={0}
          max={40}
          step={1}
          onChange={(v) => setTweak('petals', v)}
        />

        <TweakSection label="Hero composition" />
        <TweakRadio
          label="Layout"
          value={t.hero}
          options={[
            { value: 'branch',  label: 'Branch' },
            { value: 'centered', label: 'Sky' },
            { value: 'magazine', label: 'Magazine' }
          ]}
          onChange={(v) => setTweak('hero', v)}
        />
      </TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('tweaks-root'));
root.render(<App />);
