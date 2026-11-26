// SIMULATED low-code run: the Appsmith JS Object is executed in Node with MOCK widgets.
// This is NOT a run inside Appsmith. Real Appsmith screenshots must be added by the student.
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/JS_Availability.appsmith.js', 'utf8').replace('export default', 'module.exports =');
// (widgets are injected through a mutable holder below)
const W = { Input_Start: { text: '' }, Input_Duration: { text: '' }, Switch_Blocked: { isSwitchedOn: false } };
const obj = new Function('Input_Start', 'Input_Duration', 'Switch_Blocked', 'const module={exports:{}};' + src + ';return module.exports;')(W.Input_Start, W.Input_Duration, W.Switch_Blocked);
const NOW = new Date('2026-11-26T09:00');
const snapshot = JSON.stringify(obj.bookings);
const cases = [
  ['T1', 'valid free interval -> Available',    '2026-12-01T11:30', '30',  false, true,  'OK'],
  ['T2', 'overlap with booking -> Unavailable', '2026-12-01T10:30', '60',  false, false, 'OVERLAP'],
  ['T3', 'blocked room -> Unavailable',         '2026-12-01T11:30', '30',  true,  false, 'ROOM_BLOCKED'],
  ['T4', 'duration = 0 -> validation error',    '2026-12-01T11:30', '0',   false, false, 'INVALID_DURATION_RANGE'],
  ['T5', 'duration = 121 -> validation error',  '2026-12-01T11:30', '121', false, false, 'INVALID_DURATION_RANGE'],
  ['T6', 'past start time -> validation error', '2026-11-25T10:00', '30',  false, false, 'INVALID_START_PAST'],
  ['T7', 'adjacent interval -> Available',      '2026-12-01T11:00', '120', false, true,  'OK'],
  ['S1', 'script text as start -> rejected',    '<script>alert(1)</script>', '30', false, false, 'INVALID_START_FORMAT'],
  ['S2', 'HTML text as duration -> rejected',   '2026-12-01T11:30', '<img src=x onerror=alert(1)>', false, false, 'INVALID_DURATION_FORMAT'],
  ['S3', 'empty duration -> rejected',          '2026-12-01T11:30', '',    false, false, 'INVALID_DURATION_FORMAT']
];
let pass = 0, fail = 0;
for (const c of cases) {
  W.Input_Start.text = c[2]; W.Input_Duration.text = c[3]; W.Switch_Blocked.isSwitchedOn = c[4];
  const r = obj.run(NOW); const ok = r.available === c[5] && r.code === c[6];
  ok ? pass++ : fail++;
  console.log((ok ? 'PASS ' : 'FAIL ') + c[0] + ' | ' + c[1] + ' | expected ' + (c[5] ? 'Available' : 'Unavailable') + '/' + c[6] + ' | observed ' + (r.available ? 'Available' : 'Unavailable') + '/' + r.code);
}
const t8 = JSON.stringify(obj.bookings) === snapshot;
console.log((t8 ? 'PASS ' : 'FAIL ') + 'T8 | booking data unchanged | observed ' + (t8 ? 'unchanged' : 'CHANGED')); t8 ? pass++ : fail++;
console.log('\nTOTAL (SIMULATED, Node + mock widgets): ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
