"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ride.module.css";
import { getCtx, chime, blip, playMotif } from "./audioEngine";
import BikeRide from "./BikeRide";
import BeatBuilder from "./BeatBuilder";
import { CrateDig } from "./CrateDig";

const LINKS = {
  book: "/book",
  music: "/music",
  merch: "/merch",
  spotify: "https://open.spotify.com/artist/1C0WKJTNpv2Xli0swIcTE8",
  soundcloud: "https://soundcloud.com/killscomfort",
  instagram: "https://instagram.com/killscomfort",
};

type Scene = "enter" | "ride" | "hub" | "exit";
type Panel = null | "beat" | "dig" | "mixes" | "merch" | "wall";

type Mix = { id: string; t: string; s: string; src: string; motif: number[]; unlocked: boolean };
type Record_ = { t: string; s: string; gem: boolean };
type Post = { by: string; p: string };

const RECORDS: Record_[] = [
  { t: "SUPERVISOR", s: "KC · 2024", gem: false },
  { t: "OPERATOR", s: "KC · 2024", gem: false },
  { t: "MOTION IS FAITH", s: "KC · ANTHEM", gem: true },
  { t: "GOOD OL RUB", s: "KC", gem: false },
  { t: "HOMOLOGATION", s: "KC", gem: false },
];

const SEED_WALL: Post[] = [
  { by: "KILLSCOMFORT", p: "Comfort is where momentum goes to die. Ride anyway." },
  { by: "@ANDREA_M", p: "First time DJing sober. Terrifying. Did it." },
  { by: "@LOTELEVEN", p: "Quit the job that paid more. Building the thing that pays in meaning." },
  { by: "@J.RIVERA", p: "Showed up to the picnic not knowing a soul. Left with five." },
];

export default function KillsComfortRide({
  onSkip,
  onArcade,
  onLobby,
  initialScene = "enter",
  initialPanel = null,
}: {
  onSkip?: () => void;
  onArcade?: () => void;
  onLobby?: () => void;
  initialScene?: "enter" | "hub";
  initialPanel?: Panel;
}) {
  const [scene, setScene] = useState<Scene>(initialScene);
  const [panel, setPanel] = useState<Panel>(initialPanel);

  const [values, setValues] = useState<string[]>([]);
  const [beatMade, setBeatMade] = useState(false);
  const [gemFound, setGemFound] = useState(false);
  const [merchFound, setMerchFound] = useState(false);
  const [mixes, setMixes] = useState<Mix[]>([
    { id: "rooftop", t: "Dat Thang (Live Edit)", s: "HOUSE · 124", src: "your beat", motif: [0, 4, 7, 12, 7, 4], unlocked: false },
    { id: "crate", t: "Motion Is Faith (Dub)", s: "TECHNO · 128", src: "the crate gem", motif: [0, 3, 7, 10, 7, 3], unlocked: false },
  ]);
  const [wall, setWall] = useState<Post[]>(SEED_WALL);
  const [digIdx, setDigIdx] = useState(0);
  const [digMsg, setDigMsg] = useState("");
  const [draft, setDraft] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  };

  const unlockedCount = mixes.filter((m) => m.unlocked).length + (merchFound ? 1 : 0);

  const unlockMix = (id: string, label: string) => {
    setMixes((prev) => {
      if (prev.find((m) => m.id === id)?.unlocked) return prev;
      chime();
      flash(label);
      return prev.map((m) => (m.id === id ? { ...m, unlocked: true } : m));
    });
  };

  const collect = (v: string) => setValues((prev) => (prev.includes(v) ? prev : [...prev, v]));

  // ESC closes panels
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const startRide = () => {
    getCtx();
    setScene("ride");
  };
  const skip = () => {
    getCtx();
    arrive();
  };
  const arrive = () => {
    setScene("hub");
    chime();
  };

  const onBeatLocked = () => {
    if (!beatMade) {
      setBeatMade(true);
      unlockMix("rooftop", "▷ SECRET MIX UNLOCKED — ROOFTOP / DAT THANG");
    }
  };

  const pullRecord = () => {
    const r = RECORDS[digIdx];
    const c = getCtx();
    if (r.gem) {
      if (!gemFound) {
        setGemFound(true);
        unlockMix("crate", "▷ GEM PULLED — MOTION IS FAITH (DUB) UNLOCKED");
      }
      setDigMsg("That's the one. Unlocked in Secret Mixes.");
    } else {
      blip(c ? c.currentTime : 0, 160);
      setDigMsg("Filler. Keep digging — the gem is in here somewhere.");
    }
  };

  const addPost = () => {
    const v = draft.trim();
    if (!v) return;
    setWall((prev) => [{ by: "YOU", p: v }, ...prev]);
    setDraft("");
    chime();
    collect("COMMUNITY");
  };

  const showMerchSpot = (beatMade || gemFound) && !merchFound;

  const sceneCls = (s: Scene) => `${styles.scene} ${scene === s ? styles.on : ""}`;

  return (
    <div className={styles.root}>
      <div className={styles.grain} />

      {/* HUD */}
      <div className={`${styles.hud} ${scene === "hub" || scene === "ride" ? styles.on : ""}`}>
        <span>KILLSCOMFORT</span>
        <span className={styles.vals}>
          <span>
            VALUES <b>{values.length}</b>/3
          </span>
          <span>
            UNLOCKS <b>{unlockedCount}</b>/3
          </span>
        </span>
      </div>

      {/* ENTER */}
      <section className={`${sceneCls("enter")} ${styles.enter}`}>
        <div className={styles.glow} />
        <div className={styles.pad}>
          <div className={styles.mark}>TOEJAM808 · MIAMI</div>
          <h1 className={styles.big}>
            Motion
            <br />
            Is Faith
          </h1>
          <p className={styles.lede}>
            KillsComfort is a ride, not a homepage. Cut through the alley, roll into the warehouse, build a beat, dig the
            crates, and find what&apos;s stashed inside.
          </p>
          <div className={styles.row} style={{ marginTop: 22 }}>
            <button className={`${styles.btn} ${styles.solid}`} onClick={startRide}>
              Ride your bike →
            </button>
            <button className={`${styles.btn} ${styles.ghost}`} onClick={skip}>
              Skip to warehouse
            </button>
          </div>
          <div className={styles.statusline}>
            {"> "}geo.lock: <b>MIAMI_AREA</b>{" // "}sound: <b>ON</b>{" // "}input: <b>TAP / SPACE</b>
          </div>
        </div>
      </section>

      {/* RIDE (mounted only while active) */}
      {scene === "ride" && <BikeRide onArrive={arrive} onCollect={collect} />}

      {/* HUB */}
      <section className={`${sceneCls("hub")} ${styles.hub}`}>
        <div className={styles.pad}>
          <div className={styles.hubhead}>
            <div className={styles.eyebrow}>
              <b>THE WAREHOUSE</b>
            </div>
            <h2 className={styles.mid}>
              You rolled
              <br />
              inside.
            </h2>
            <p className={styles.lede}>Doors are open. Touch anything lit. The warehouse keeps what you find.</p>
          </div>

          <div className={styles.hotspots}>
            <button className={`${styles.spot} ${beatMade ? styles.done : ""}`} onClick={() => { getCtx(); setPanel("beat"); }}>
              <div className={styles.n}>01</div>
              <div className={styles.t}>
                Open
                <br />
                Cassette
              </div>
              <div className={styles.s}>{beatMade ? "✓ BEAT LOCKED" : "▷ BUILD A BEAT"}</div>
            </button>

            <button className={`${styles.spot} ${gemFound ? styles.done : ""}`} onClick={() => { getCtx(); setPanel("dig"); }}>
              <div className={styles.n}>02</div>
              <div className={styles.t}>
                Dig The
                <br />
                Crates
              </div>
              <div className={styles.s}>{gemFound ? "✓ GEM PULLED" : "▷ FIND THE GEM"}</div>
            </button>

            <button
              className={`${styles.spot} ${unlockedCount === 0 ? styles.locked : ""}`}
              onClick={() => { getCtx(); setPanel("mixes"); }}
            >
              <div className={styles.n}>03</div>
              <div className={styles.t}>
                Secret
                <br />
                Mixes
              </div>
              <div className={styles.s}>
                {mixes.filter((m) => m.unlocked).length
                  ? `▷ ${mixes.filter((m) => m.unlocked).length} UNLOCKED`
                  : "▷ LOCKED"}
              </div>
            </button>

            <button className={styles.spot} onClick={() => { getCtx(); setPanel("wall"); }}>
              <div className={styles.n}>04</div>
              <div className={styles.t}>
                Community
                <br />
                Wall
              </div>
              <div className={styles.s}>▷ LEAVE A MARK</div>
            </button>
          </div>

          <div className={styles.hubfoot}>
            {onLobby && (
              <button className={`${styles.btn} ${styles.ghost}`} onClick={onLobby}>
                ← Card deck
              </button>
            )}
            {onArcade && (
              <button className={`${styles.btn} ${styles.ghost}`} onClick={onArcade}>
                ← Arcade
              </button>
            )}
            {showMerchSpot && (
              <button
                className={styles.spot + " " + styles.secret}
                onClick={() => {
                  setMerchFound(true);
                  setPanel("merch");
                }}
              >
                <div className={styles.s} style={{ color: "var(--chrome-hi)" }}>
                  ✦ SOMETHING&apos;S STASHED HERE
                </div>
              </button>
            )}
            <button className={`${styles.btn} ${styles.ghost}`} style={{ marginLeft: "auto" }} onClick={() => setScene("exit")}>
              Head out →
            </button>
          </div>
        </div>
      </section>

      {/* EXIT */}
      <section className={`${sceneCls("exit")} ${styles.exit}`}>
        <div className={styles.pad}>
          <div className={styles.eyebrow}>END OF THE RIDE</div>
          <h2 className={styles.mid}>
            Stay
            <br />
            uncomfortable.
          </h2>
          <p className={styles.lede}>
            That&apos;s KillsComfort: keep moving, keep digging, keep showing up. Here&apos;s where the rest of it lives.
          </p>
          <div className={styles.collected}>
            {[
              ["CURIOSITY", values.includes("CURIOSITY")],
              ["COMMUNITY", values.includes("COMMUNITY")],
              ["DISCIPLINE", values.includes("DISCIPLINE")],
              ["BEAT", beatMade],
              ["CRATE GEM", gemFound],
              ["STASH MERCH", merchFound],
            ].map(([label, got]) => (
              <span key={label as string} className={`${styles.chip} ${got ? styles.got : ""}`}>
                {got ? "✓ " : "· "}
                {label as string}
              </span>
            ))}
          </div>
          <div className={styles.cta}>
            <a className={`${styles.btn} ${styles.solid}`} href={LINKS.book}>
              Book a set
            </a>
            <a className={styles.btn} href={LINKS.music}>
              Listen
            </a>
            <a className={styles.btn} href={LINKS.merch}>
              Shop merch
            </a>
            <a className={`${styles.btn} ${styles.ghost}`} href={LINKS.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>
          <button
            className={`${styles.btn} ${styles.ghost}`}
            style={{ marginTop: 18, alignSelf: "flex-start" }}
            onClick={() => {
              setValues([]);
              setBeatMade(false);
              setGemFound(false);
              setMerchFound(false);
              setMixes((prev) => prev.map((m) => ({ ...m, unlocked: false })));
              setDigIdx(0);
              setDigMsg("");
              setScene("enter");
            }}
          >
            ↺ Ride again
          </button>
        </div>
      </section>

      {/* PANELS */}
      {panel === "beat" && (
        <PanelShell title="Build a beat" onClose={() => setPanel(null)}>
          <BeatBuilder onBeatLocked={onBeatLocked} locked={beatMade} />
        </PanelShell>
      )}

      {panel === "dig" && (
        <PanelShell title="Dig the crates" onClose={() => setPanel(null)}>
          <CrateDig
            records={RECORDS}
            digIdx={digIdx}
            onSelect={(i) => {
              setDigIdx(i);
              setDigMsg("");
            }}
            onPull={pullRecord}
            digMsg={digMsg}
          />
        </PanelShell>
      )}

      {panel === "mixes" && (
        <PanelShell title="Secret mixes" onClose={() => setPanel(null)}>
          {mixes.map((m) => (
            <div key={m.id} className={`${styles.mix} ${m.unlocked ? "" : styles.locked}`}>
              <button
                className={styles.mixplay}
                disabled={!m.unlocked}
                onClick={() => {
                  getCtx();
                  playMotif(m.motif);
                }}
              >
                {m.unlocked ? "▶" : "✕"}
              </button>
              <div className={styles.mixinfo}>
                <div className={styles.t}>{m.t}</div>
                <div className={styles.s}>{m.unlocked ? m.s : `LOCKED · ${m.src}`}</div>
              </div>
              <div className={styles.mixtag}>{m.unlocked ? "UNLOCKED" : "FIND IT"}</div>
            </div>
          ))}
          {unlockedCount === 0 && (
            <p className={styles.tiny} style={{ marginTop: 6 }}>
              Nothing here yet. Build a beat and pull the crate gem to unlock these.
            </p>
          )}
          <p className={styles.tiny} style={{ marginTop: 10 }}>
            Previews are synth stand-ins — swap for real SoundCloud/Spotify embeds.
          </p>
        </PanelShell>
      )}

      {panel === "merch" && (
        <PanelShell title="Hidden merch" onClose={() => setPanel(null)}>
          <div className={styles.merchcard}>
            <div className={styles.merchvis}>
              <span>KillsComfort</span>
            </div>
            <div className={styles.merchmeta}>
              <div className={styles.eyebrow}>STASH DROP · FOUND IN THE WAREHOUSE</div>
              <h2 className={styles.mid} style={{ fontSize: 30, marginTop: 8 }}>
                Motion Is Faith
                <br />
                Heavyweight Hoodie
              </h2>
              <p className={styles.lede}>
                Blacked-out print, oversized fit. Only shows up if you went looking. Limited run.
              </p>
              <div className={styles.row} style={{ marginTop: 14 }}>
                <a className={`${styles.btn} ${styles.solid}`} href={LINKS.merch}>
                  Claim it →
                </a>
                <button className={`${styles.btn} ${styles.ghost}`} onClick={() => setPanel(null)}>
                  Keep digging
                </button>
              </div>
            </div>
          </div>
        </PanelShell>
      )}

      {panel === "wall" && (
        <PanelShell title="Community wall" onClose={() => setPanel(null)}>
          <div className={styles.wallform}>
            <input
              value={draft}
              maxLength={120}
              placeholder="What pushed you past comfort?"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addPost();
              }}
            />
            <button className={`${styles.btn} ${styles.solid}`} onClick={addPost}>
              Post
            </button>
          </div>
          <div className={styles.wallgrid}>
            {wall.map((n, i) => (
              <div key={i} className={styles.note}>
                <p>{n.p}</p>
                <div className={styles.by}>{n.by}</div>
              </div>
            ))}
          </div>
          <p className={styles.tiny} style={{ marginTop: 8 }}>
            Demo wall — posts live in this session. Wire to Supabase to make them stick.
          </p>
        </PanelShell>
      )}

      {toast && <div className={styles.toast}>{toast}</div>}

      {scene !== "exit" && (
        <button
          className={styles.skip}
          onClick={() => {
            getCtx();
            if (onSkip) onSkip();
            else setScene("exit");
          }}
        >
          skip to site ›
        </button>
      )}
    </div>
  );
}

function PanelShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelTop}>
        <div className={styles.t}>{title}</div>
        <button className={styles.x} onClick={onClose}>
          Close ✕
        </button>
      </div>
      <div className={styles.panelBody}>{children}</div>
    </div>
  );
}
