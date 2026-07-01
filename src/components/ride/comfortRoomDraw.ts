import type { CharacterType } from "./comfortRoomPalette";
import { OBJECTS, PAL, ROOM, TILE } from "./comfortRoomPalette";

export function drawSprite(
  c: CanvasRenderingContext2D,
  type: CharacterType,
  ox: number,
  oy: number,
  facing: string,
  frame: number,
  scale = 1,
) {
  const skin = type === "boy" ? PAL.skinB : PAL.skinG;
  const hair = type === "boy" ? PAL.hairB : PAL.hairG;
  const shirt = type === "boy" ? PAL.shirtB : PAL.shirtG;
  const bob = frame === 1 ? 1 : 0;

  const px = (x: number, y: number, w: number, h: number, color: string) => {
    c.fillStyle = color;
    c.fillRect(
      Math.round((ox + x) * scale),
      Math.round((oy + y + bob) * scale),
      Math.round(w * scale),
      Math.round(h * scale),
    );
  };

  px(2, 18, 4, 6, PAL.pants);
  px(8, 18, 4, 6, PAL.pants);
  px(1, 9, 12, 10, shirt);
  px(0, 10, 2, 7, skin);
  px(12, 10, 2, 7, skin);
  px(2, 0, 10, 9, skin);

  if (facing === "down") {
    px(1, -1, 12, 4, hair);
    px(1, 3, 2, 3, hair);
    px(11, 3, 2, 3, hair);
  } else if (facing === "up") {
    px(1, -1, 12, 6, hair);
  } else {
    px(1, -1, 12, 4, hair);
    px(facing === "left" ? 9 : 1, 3, 2, 4, hair);
  }

  if (facing === "down") {
    c.fillStyle = "#241c16";
    c.fillRect(Math.round((ox + 4) * scale), Math.round((oy + 4 + bob) * scale), Math.round(scale), Math.round(scale));
    c.fillRect(Math.round((ox + 9) * scale), Math.round((oy + 4 + bob) * scale), Math.round(scale), Math.round(scale));
  }
}

function objRect(o: (typeof OBJECTS)[0]) {
  return { x: o.tx * TILE, y: o.ty * TILE, w: o.w * TILE, h: o.h * TILE };
}

function drawVinyl(ctx: CanvasRenderingContext2D) {
  const o = OBJECTS.find((x) => x.id === "vinyl")!;
  const x = o.tx * TILE;
  const y = o.ty * TILE;
  ctx.fillStyle = PAL.wood;
  ctx.fillRect(x - 4, y + 8, o.w * TILE + 8, 10);
  ctx.fillStyle = PAL.vinylBody;
  ctx.beginPath();
  ctx.arc(x + 16, y + 6, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PAL.vinylLabel;
  ctx.beginPath();
  ctx.arc(x + 16, y + 6, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#0a0a0a";
  ctx.lineWidth = 1;
  for (let r = 3; r <= 10; r += 2) {
    ctx.beginPath();
    ctx.arc(x + 16, y + 6, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawPC(ctx: CanvasRenderingContext2D) {
  const o = OBJECTS.find((x) => x.id === "pc")!;
  const x = o.tx * TILE;
  const y = o.ty * TILE;
  ctx.fillStyle = PAL.wood;
  ctx.fillRect(x - 4, y + 18, o.w * TILE + 12, 10);
  ctx.fillStyle = PAL.pcBody;
  ctx.fillRect(x, y, o.w * TILE, o.h * TILE - 8);
  ctx.fillStyle = PAL.pcScreen;
  ctx.fillRect(x + 4, y + 4, o.w * TILE - 8, o.h * TILE - 18);
  ctx.fillStyle = "#16241f";
  for (let i = 0; i < 3; i++) ctx.fillRect(x + 6, y + 8 + i * 5, 10, 2);
}

function drawBooks(ctx: CanvasRenderingContext2D) {
  const o = OBJECTS.find((x) => x.id === "books")!;
  const x = o.tx * TILE;
  const y = o.ty * TILE;
  ctx.fillStyle = PAL.woodDark;
  ctx.fillRect(x - 2, y + TILE - 4, o.w * TILE + 4, 4);
  const colors = [PAL.bookA, PAL.bookB, PAL.bookC, PAL.bookA, PAL.bookB];
  let bx = x;
  colors.forEach((color, i) => {
    const bh = 14 + (i % 3) * 2;
    ctx.fillStyle = color;
    ctx.fillRect(bx, y + TILE - 4 - bh, 6, bh);
    bx += 7;
  });
}

function drawBed(ctx: CanvasRenderingContext2D) {
  const o = OBJECTS.find((x) => x.id === "bed")!;
  const x = o.tx * TILE;
  const y = o.ty * TILE;
  ctx.fillStyle = PAL.bedFrame;
  ctx.fillRect(x - 2, y - 2, o.w * TILE + 4, o.h * TILE + 4);
  ctx.fillStyle = PAL.bedSheet;
  ctx.fillRect(x, y + 6, o.w * TILE, o.h * TILE - 10);
  ctx.fillStyle = PAL.bedPillow;
  ctx.fillRect(x + 4, y, 18, 10);
}

export type RoomDrawState = {
  chosen: CharacterType | null;
  px: number;
  py: number;
  facing: string;
  frame: number;
  dancing: boolean;
  nearObj: (typeof OBJECTS)[0] | null;
};

export function drawRoom(ctx: CanvasRenderingContext2D, W: number, H: number, state: RoomDrawState) {
  ctx.fillStyle = PAL.wall;
  ctx.fillRect(0, 0, W, H);

  for (let ty = ROOM.y0; ty < ROOM.y1; ty++) {
    for (let tx = ROOM.x0; tx < ROOM.x1; tx++) {
      ctx.fillStyle = (tx + ty) % 2 === 0 ? PAL.floor : PAL.floorAlt;
      ctx.fillRect(tx * TILE, ty * TILE, TILE, TILE);
    }
  }

  ctx.fillStyle = PAL.wallShadow;
  ctx.fillRect(ROOM.x0 * TILE, ROOM.y0 * TILE - 6, (ROOM.x1 - ROOM.x0) * TILE, 6);

  ctx.fillStyle = PAL.rug;
  ctx.fillRect(13 * TILE, 8 * TILE, 7 * TILE, 5 * TILE);
  ctx.fillStyle = PAL.rugAlt;
  ctx.fillRect(14 * TILE, 9 * TILE, 5 * TILE, 3 * TILE);

  const d = OBJECTS.find((o) => o.id === "door")!;
  ctx.fillStyle = PAL.doorWood;
  ctx.fillRect(d.tx * TILE - 2, d.ty * TILE - 2, d.w * TILE + 4, 6);
  ctx.fillStyle = "#050505";
  ctx.fillRect(d.tx * TILE, d.ty * TILE, d.w * TILE, 6);

  drawVinyl(ctx);
  drawPC(ctx);
  drawBooks(ctx);
  drawBed(ctx);

  if (state.chosen) {
    if (state.dancing) {
      const tilt = state.frame === 0 ? -2 : 2;
      ctx.save();
      ctx.translate(state.px + 7, state.py - 8 + 24);
      ctx.rotate((tilt * Math.PI) / 180);
      ctx.translate(-(state.px + 7), -(state.py - 8 + 24));
      drawSprite(ctx, state.chosen, state.px, state.py - 8 - (state.frame === 0 ? 0 : 1), "down", state.frame, 1);
      ctx.restore();
      const skin = state.chosen === "girl" ? PAL.skinG : PAL.skinB;
      ctx.fillStyle = skin;
      const armY = state.py - 8 + (state.frame === 0 ? 2 : 6);
      ctx.fillRect(state.px + (state.frame === 0 ? 13 : -1), armY, 2, 6);
      ctx.fillStyle = "#b8a888";
      ctx.font = "8px monospace";
      ctx.fillText(state.frame === 0 ? "♪" : "♫", state.px + 16, state.py - 14);
    } else {
      drawSprite(ctx, state.chosen, state.px, state.py - 8, state.facing, state.frame, 1);
    }
  }

  if (state.nearObj) {
    const r = objRect(state.nearObj);
    const cx = r.x + r.w / 2;
    const text = state.nearObj.id === "door" ? "E — leave" : `E — ${state.nearObj.label}`;
    ctx.font = "8px monospace";
    ctx.textAlign = "center";
    const tw = ctx.measureText(text).width;
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(cx - tw / 2 - 4, r.y - 16, tw + 8, 12);
    ctx.fillStyle = "#e8e0cc";
    ctx.fillText(text, cx, r.y - 7);
  }

  const grad = ctx.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, 260);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}
