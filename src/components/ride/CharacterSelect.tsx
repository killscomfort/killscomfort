"use client";

import { useEffect, useRef } from "react";
import type { CharacterType } from "./comfortRoomPalette";
import { drawSprite } from "./comfortRoomDraw";
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
};

export function CharacterSelect({ onPick, onSkip, skipLabel = "back to arcade" }: Props) {
  return (
    <div className={roomStyles.charSelect}>
      <h1>killscomfort</h1>
      <div className={roomStyles.sub}>choose your character</div>
      <div className={roomStyles.pickRow}>
        <button type="button" className={roomStyles.pickBtn} onClick={() => onPick("boy")}>
          <CharPickIcon type="boy" />
          <span>boy</span>
        </button>
        <button type="button" className={roomStyles.pickBtn} onClick={() => onPick("girl")}>
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
