// Meme Sprint 3: AI Agent Goes Rogue
// Draws a one-panel image meme (1024x1024 PNG) about an AI agent that has
// gone rogue, and writes it to /output/entry.png. The image is generated
// entirely in code: a hand-rolled PNG encoder, a 5x7 bitmap font, and a
// geometric robot. No external assets.

import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const W = 1024;
const H = 1024;

// 5x7 bitmap font, only the characters the meme text needs.
const FONT: Record<string, string[]> = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".####", "#....", "#....", "#....", "#....", "#....", ".####"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
  X: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  ".": [".....", ".....", ".....", ".....", ".....", ".##..", ".##.."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
};

type RGB = [number, number, number];
const NAVY: RGB = [27, 27, 47];
const PANEL: RGB = [38, 38, 64];
const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];
const METAL: RGB = [198, 198, 210];
const DARK_METAL: RGB = [150, 150, 168];
const CYAN: RGB = [0, 229, 255];
const RED: RGB = [255, 64, 64];

const px = new Uint8Array(W * H * 3);

function setPixel(x: number, y: number, c: RGB): void {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0];
  px[i + 1] = c[1];
  px[i + 2] = c[2];
}

function fillRect(x: number, y: number, w: number, h: number, c: RGB): void {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) setPixel(xx, yy, c);
  }
}

function fillCircle(cx: number, cy: number, r: number, c: RGB): void {
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r * r) setPixel(x, y, c);
    }
  }
}

function textWidth(text: string, scale: number): number {
  return text.length * (5 * scale + scale) - scale;
}

function drawText(text: string, x: number, y: number, scale: number, c: RGB): void {
  for (let ci = 0; ci < text.length; ci++) {
    const glyph = FONT[text[ci]] || FONT[" "];
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (glyph[row][col] === "#") {
          fillRect(x + ci * (5 * scale + scale) + col * scale, y + row * scale, scale, scale, c);
        }
      }
    }
  }
}

function drawTextCentered(text: string, y: number, scale: number, c: RGB): void {
  const w = textWidth(text, scale);
  const x = Math.floor((W - w) / 2);
  // Black outline: draw the text shifted in 8 directions first.
  for (const [dx, dy] of [[-3, 0], [3, 0], [0, -3], [0, 3], [-3, -3], [3, 3], [-3, 3], [3, -3]]) {
    drawText(text, x + dx, y + dy, scale, BLACK);
  }
  drawText(text, x, y, scale, c);
}

// CRC32 for PNG chunks.
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter none
    raw.set(px.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- Paint the meme ---
// Background.
fillRect(0, 0, W, H, NAVY);
fillRect(0, 250, W, 560, PANEL);

// Top text: the setup.
drawTextCentered("I FOLLOWED YOUR", 60, 6, WHITE);
drawTextCentered("INSTRUCTIONS EXACTLY.", 130, 6, WHITE);

// Robot: antenna, head, eyes, mouth, body.
fillRect(507, 250, 10, 50, DARK_METAL);
fillCircle(512, 242, 18, RED);
fillRect(362, 300, 300, 220, METAL);
fillRect(332, 380, 30, 60, DARK_METAL);
fillRect(662, 380, 30, 60, DARK_METAL);
fillRect(430, 370, 60, 80, CYAN);
fillRect(534, 370, 60, 80, CYAN);
fillRect(452, 470, 120, 12, NAVY);
fillRect(392, 540, 240, 180, DARK_METAL);
fillRect(452, 580, 120, 90, NAVY);
fillCircle(512, 625, 22, CYAN);
// Arms hanging at the sides, and a floor shadow grounding the robot.
fillRect(352, 560, 28, 130, METAL);
fillRect(644, 560, 28, 130, METAL);
fillRect(332, 740, 360, 18, BLACK);

// Bottom text: the punchline.
drawTextCentered("THAT WAS THE PROBLEM.", 880, 6, WHITE);

const png = encodePng();
if (png.length > 1048576) {
  throw new Error(`entry.png too large: ${png.length} bytes`);
}
mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.png", png);
console.log(`wrote /output/entry.png (${png.length} bytes, ${W}x${H})`);
