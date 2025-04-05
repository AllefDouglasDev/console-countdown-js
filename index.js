const readline = require("node:readline")
const WIDTH = 6;
const HEIGHT = 6;
let isRunning = true
let interval;
let timerSec = calcTimerSec(0, 0, 0);

(async () => {
  const [, , h, m, s] = process.argv;
  timerSec = calcTimerSec(validate(h, 0), validate(m, 5), validate(s, 0));
  listenKeyPressed(key => {
    switch (key) {
      case ' ': {
        if (isRunning) {
          pause()
        } else {
          play()
        }
      } break
    }
  })
  await clearScreen();
  play();
})();

function listenKeyPressed(cb) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl.input.on('keypress', cb)
  return rl
}

function validate(n, def) {
  if (n === undefined) return def;
  const nInt = parseInt(n);
  if (Number.isNaN(nInt)) return def;
  if (nInt < 0) return def;
  if (nInt > 59) return 59;
  return nInt;
}

async function draw(x, char, padTop = 0) {
  const arr = char.split("\n");
  for (let i = 0; i < WIDTH; i++) {
    await write(x, i + padTop, arr[i]);
  }
}

function getTimeFromSeconds(tm) {
  let m = Math.floor(tm / 60);
  const h = Math.floor(m / 60);
  m = m - h * 60;
  s = Math.floor(tm - (h * 60 * 60 + m * 60));
  return { h, m, s };
}


function calcTimerSec(h, m, s) {
  return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s);
}

async function drawClock(h, m, s) {
  await clearScreen();
  const totalWidth = 64;
  const cols = process.stdout.columns;
  const rows = process.stdout.rows
  const paddingTop = HEIGHT < cols ? Math.floor((rows - HEIGHT) / 2) : 0
  const paddingLeft =
    totalWidth < cols ? Math.floor((cols - totalWidth) / 2) : 0;
  const hStr = h < 10 ? `0${h}` : h.toString();
  await draw(0 + paddingLeft, chars[parseInt(hStr[0])], paddingTop);
  await draw(8 + paddingLeft, chars[parseInt(hStr[1])], paddingTop);

  await draw(16 + paddingLeft, chars[10], paddingTop); // :

  const mStr = m < 10 ? `0${m}` : m.toString();
  await draw(24 + paddingLeft, chars[parseInt(mStr[0])], paddingTop);
  await draw(32 + paddingLeft, chars[parseInt(mStr[1])], paddingTop);

  await draw(40 + paddingLeft, chars[10], paddingTop); // :

  const sStr = s < 10 ? `0${s}` : s.toString();
  await draw(48 + paddingLeft, chars[parseInt(sStr[0])], paddingTop);
  await draw(56 + paddingLeft, chars[parseInt(sStr[1])], paddingTop);
}

async function play() {
  isRunning = true
  const run = async () => {
    const { h, m, s } = getTimeFromSeconds(timerSec);
    await drawClock(h, m, s);
    if (h === 0 && m === 0 && s === 0) {
      finish();
    }
    timerSec -= 1;
    process.stdout.write("\n");
  };
  await run()
  interval = setInterval(run, 1000);
}

async function pause() {
  isRunning = false
  clearInterval(interval);
  // await clearScreen()
  // await drawClock(0, 0, 0);
  // process.stdout.write("\n");
}

async function finish() {
  clearInterval(interval);
  await drawClock(0, 0, 0);
  process.stdout.write("\n");
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
