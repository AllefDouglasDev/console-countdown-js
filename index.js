const WIDTH = 6;
let interval;
let timerSec = calcTimerSec(0, 5, 0);

(async () => {
  const [, , h, m, s] = process.argv;
  if (h !== undefined && m !== undefined && s !== undefined) {
    timerSec = calcTimerSec(h, m, s);
  }
  await clearScreen();
  update();
})();

async function draw(x, num) {
  const arr = num.split("\n");
  for (let i = 0; i < WIDTH; i++) {
    await write(x, i, arr[i]);
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
  const hStr = h < 10 ? `0${h}` : h.toString();
  await draw(0, chars[parseInt(hStr[0])]);
  await draw(8, chars[parseInt(hStr[1])]);

  await draw(16, chars[10]); // :

  const mStr = m < 10 ? `0${m}` : m.toString();
  await draw(24, chars[parseInt(mStr[0])]);
  await draw(32, chars[parseInt(mStr[1])]);

  await draw(40, chars[10]); // :

  const sStr = s < 10 ? `0${s}` : s.toString();
  await draw(48, chars[parseInt(sStr[0])]);
  await draw(56, chars[parseInt(sStr[1])]);
}

async function update() {
  const run = async () => {
    const { h, m, s } = getTimeFromSeconds(timerSec);
    await drawClock(h, m, s);
    if (h === 0 && m === 0 && s === 0) {
      stop();
    }
    timerSec -= 1;
    process.stdout.write("\n");
  };
  await run();
  interval = setInterval(run, 1000);
}

function stop() {
  clearInterval(interval);
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
