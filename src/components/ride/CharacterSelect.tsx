"use client";

import { useEffect, useRef, useState } from "react";
import type { CharacterType } from "./comfortRoomPalette";
import { drawSprite } from "./comfortRoomDraw";
import {
  isValidStreetRunProfile,
  readPlayerProfile,
  writePlayerProfile,
} from "@/lib/street-run";
import roomStyles from "./comfortRoom.module.css";

function CharPickIcon({ type }: { type: CharacterType }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const c = cvs.getContext("2d");
    if (!c) return;
    c.imageSmoothingEnabled = false;
    c.clearRect(0, 0, 32, 48);
    drawSprite(c, type, 4, 2, "down", 0, 1.6);
  }, [type]);
  return <canvas ref={ref} width={32} height={48} />;
}

type Props = {
  onPick: (type: CharacterType) => void;
  onSkip?: () => void;
  skipLabel?: string;
  requireProfile?: boolean;
};

export function CharacterSelect({
  onPick,
  onSkip,
  skipLabel = "back to arcade",
  requireProfile = true,
}: Props) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileErr, setProfileErr] = useState("");

  useEffect(() => {
    const profile = readPlayerProfile();
    setUsername(profile.username);
    setEmail(profile.email);
  }, []);

  const profileReady = !requireProfile || isValidStreetRunProfile(username, email);

  const pick = (type: CharacterType) => {
    if (!profileReady) {
      setProfileErr("Enter a username first (email is optional).");
      return;
    }
    if (requireProfile) {
      writePlayerProfile(username, email);
    }
    onPick(type);
  };

  return (
    <div className={roomStyles.charSelect}>
      <h1>killscomfort</h1>
      <div className={roomStyles.sub}>choose your character</div>

      {requireProfile ? (
        <div className={roomStyles.profileForm}>
          <label htmlFor="player-username">Username (shown on leaderboard)</label>
          <input
            id="player-username"
            type="text"
            autoComplete="nickname"
            placeholder="your name"
            value={username}
            onChange={(e) => {
              setProfileErr("");
              setUsername(e.target.value);
            }}
            maxLength={20}
          />
          <label htmlFor="player-email">Email (optional — private)</label>
          <input
            id="player-email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => {
              setProfileErr("");
              setEmail(e.target.value);
            }}
          />
          {profileErr ? <p className={roomStyles.profileErr}>{profileErr}</p> : null}
          {!profileReady ? (
            <p className={roomStyles.profileHint}>Pick a name to start playing.</p>
          ) : (
            <p className={roomStyles.profileHint}>High scores save automatically when you beat your best.</p>
          )}
        </div>
      ) : null}

      <div className={roomStyles.pickRow}>
        <button
          type="button"
          className={roomStyles.pickBtn}
          disabled={!profileReady}
          onClick={() => pick("boy")}
        >
          <CharPickIcon type="boy" />
          <span>boy</span>
        </button>
        <button
          type="button"
          className={roomStyles.pickBtn}
          disabled={!profileReady}
          onClick={() => pick("girl")}
        >
          <CharPickIcon type="girl" />
          <span>girl</span>
        </button>
      </div>
      {onSkip && (
        <button type="button" className={roomStyles.skipLink} onClick={onSkip}>
          {skipLabel}
        </button>
      )}
    </div>
  );
}
