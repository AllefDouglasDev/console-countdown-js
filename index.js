const readline = require("node:readline");

const WHITE = 37;
const BRIGHT_RED = 91;
const BRIGHT_GREEN = 92;
const BRIGHT_MAGENTA = 95;

const HOUR_IN_SEC = 3600;
const HOUR_IN_MIN = 60;
const MIN_IN_SEC = 60;

const WIDTH = 6;
const HEIGHT = 6;

let isRunning = true;
let intervalInstance;
let timerInSec = 0;

(async () => {
  const [, , h, m, s] = process.argv;
  timerInSec = parseTimerToSec(validate(h, 0), validate(m, 5), validate(s, 0));
  listenKeyPressed((key) => handleKeyPressed(key, h, m, s));
  play();
})();

function handleKeyPressed(key, h, m, s) {
  switch (key) {
    case " ":
      isRunning ? pause() : play();
      break;
    case "r":
      {
        clearInterval(intervalInstance);
        timerInSec = parseTimerToSec(
          validate(h, 0),
          validate(m, 5),
          validate(s, 0)
        );
        play();
      }
      break;
    case "h":
      timerInSec += HOUR_IN_SEC;
      break;
    case "m":
      timerInSec += MIN_IN_SEC;
      break;
    case "s":
      timerInSec += 10;
      break;
    case "q":
      process.exit(0);
  }
}

async function play() {
  isRunning = true;
  const update = async () => {
    const { h, m, s } = getTimeFromSeconds(timerInSec);
    await drawClock(h, m, s, BRIGHT_GREEN);
    await showMenu();
    if (h <= 0 && m <= 0 && s <= 0) {
      finish();
      return;
    }
    timerInSec -= 1;
  };
  await update();
  intervalInstance = setInterval(update, 1000);
}

async function pause() {
  isRunning = false;
  clearInterval(intervalInstance);
  const { h, m, s } = getTimeFromSeconds(timerInSec);
  await drawClock(h, m, s, BRIGHT_RED);
  await showMenu();
}

async function finish() {
  clearInterval(intervalInstance);
  await drawClock(0, 0, 0, BRIGHT_MAGENTA);
  await showMenu();
}

function listenKeyPressed(cb) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.input.on("keypress", cb);
  return rl;
}

function validate(n, fallback) {
  if (n === undefined) return fallback;
  const nInt = parseInt(n);
  if (Number.isNaN(nInt)) return fallback;
  if (nInt < 0) return fallback;
  if (nInt > 59) return 59;
  return nInt;
}

function getTimeFromSeconds(sec) {
  let m = Math.floor(sec / MIN_IN_SEC);
  const h = Math.floor(m / HOUR_IN_MIN);
  m = m - h * MIN_IN_SEC;
  s = Math.floor(sec - (h * HOUR_IN_SEC + m * MIN_IN_SEC));
  return { h, m, s };
}

function parseTimerToSec(h, m, s) {
  return parseInt(h) * HOUR_IN_SEC + parseInt(m) * MIN_IN_SEC + parseInt(s);
}

async function showMenu() {
  await write(
    0,
    process.stdout.rows,
    "space: ⏵︎/⏸︎ | r: restart | h: +1h | m: +1m | s: +10s | q: quit > "
  );
}

async function drawClock(h, m, s, c) {
  await clearScreen();
  const totalWidth = 64;
  const cols = process.stdout.columns;
  const rows = process.stdout.rows;
  const pt = HEIGHT < cols ? Math.floor((rows - HEIGHT) / 2) : 0;
  const pl = totalWidth < cols ? Math.floor((cols - totalWidth) / 2) : 0;
  const opts = { pt, c };

  const hStr = h < 10 ? `0${h}` : h.toString();
  await draw(0 + pl, chars[parseInt(hStr[0])], opts);
  await draw(8 + pl, chars[parseInt(hStr[1])], opts);

  await draw(16 + pl, chars[10], opts); // :

  const mStr = m < 10 ? `0${m}` : m.toString();
  await draw(24 + pl, chars[parseInt(mStr[0])], opts);
  await draw(32 + pl, chars[parseInt(mStr[1])], opts);

  await draw(40 + pl, chars[10], opts); // :

  const sStr = s < 10 ? `0${s}` : s.toString();
  await draw(48 + pl, chars[parseInt(sStr[0])], opts);
  await draw(56 + pl, chars[parseInt(sStr[1])], opts);
}

async function draw(x, char, opts) {
  const { pt = 0, c = WHITE } = opts;
  const arr = char.split("\n");
  for (let i = 0; i < WIDTH; i++) {
    await write(x, i + pt, color(c, arr[i]));
  }
}

function clearScreen() {
  return new Promise((r) => {
    process.stdout.cursorTo(0, 0, () => {
      process.stdout.clearScreenDown(r);
    });
  });
}

function write(x, y, ...text) {
  return new Promise((r) => {
    process.stdout.cursorTo(x, y, () => {
      process.stdout.write(...text, r);
    });
  });
}

function color(color, msg) {
  return `\x1b[${color}m${msg}\x1b[0m`;
}

const chars = [
  `
 0000
00  00
00  00
00  00
 0000`,
  `
1111
  11
  11
  11
111111
`,
  `
 2222
22  22
   22
  22
222222
`,
  `
 3333
33  33
   333
33  33
 3333
`,
  `
44  44
44  44
444444
    44
    44
`,
  `
555555
55
55555
    55
55555
`,
  `
 6666
66
66666
66  66
 6666
`,
  `
777777
   77
  77
 77
77
`,
  `
 8888
88  88
 8888
88  88
 8888
`,
  `
 9999
99  99
 99999
    99
 9999
`,
  `
    
  []
    
  []
      
`,
];
