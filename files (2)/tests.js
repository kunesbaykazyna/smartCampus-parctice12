// Run: node tests.js   (shared 8-case table T1-T8 + extra security cases S1-S3)
var R = require('./rules.js');
var NOW = new Date('2026-11-26T09:00'); // fixed "now" for repeatable tests
var snapshot = JSON.stringify(R.BOOKINGS);
var cases = [
  ['T1', 'valid free interval -> Available',       { start: '2026-12-01T11:30', duration: '30', blocked: false }, true,  'OK'],
  ['T2', 'overlap with booking -> Unavailable',    { start: '2026-12-01T10:30', duration: '60', blocked: false }, false, 'OVERLAP'],
  ['T3', 'blocked room -> Unavailable',            { start: '2026-12-01T11:30', duration: '30', blocked: true },  false, 'ROOM_BLOCKED'],
  ['T4', 'duration = 0 -> validation error',       { start: '2026-12-01T11:30', duration: '0',  blocked: false }, false, 'INVALID_DURATION_RANGE'],
  ['T5', 'duration = 121 -> validation error',     { start: '2026-12-01T11:30', duration: '121',blocked: false }, false, 'INVALID_DURATION_RANGE'],
  ['T6', 'past start time -> validation error',    { start: '2026-11-25T10:00', duration: '30', blocked: false }, false, 'INVALID_START_PAST'],
  ['T7', 'adjacent interval -> Available',         { start: '2026-12-01T11:00', duration: '120',blocked: false }, true,  'OK'],
  // extra (security / robustness)
  ['S1', 'script text as start -> rejected',       { start: '<script>alert(1)</script>', duration: '30' },      false, 'INVALID_START_FORMAT'],
  ['S2', 'HTML text as duration -> rejected',      { start: '2026-12-01T11:30', duration: '<img src=x onerror=alert(1)>' }, false, 'INVALID_DURATION_FORMAT'],
  ['S3', 'empty duration -> rejected',             { start: '2026-12-01T11:30', duration: '' },               false, 'INVALID_DURATION_FORMAT'],
  ['E1', 'boundary: exactly 120 min -> Available', { start: '2026-12-01T14:30', duration: '120',blocked: false }, true, 'OK'],
  ['E2', 'start equal to now -> past error',       { start: '2026-11-26T09:00', duration: '30' },               false, 'INVALID_START_PAST']
];
var pass = 0, fail = 0, t0 = Date.now();
cases.forEach(function (c) {
  var r = R.checkAvailability(c[2], R.BOOKINGS, NOW);
  var ok = r.available === c[3] && r.code === c[4];
  ok ? pass++ : fail++;
  console.log((ok ? 'PASS ' : 'FAIL ') + c[0] + ' | ' + c[1] + ' | expected ' + (c[3] ? 'Available' : 'Unavailable') + '/' + c[4] + ' | observed ' + (r.available ? 'Available' : 'Unavailable') + '/' + r.code + ' | "' + r.message + '"');
});
var t8 = JSON.stringify(R.BOOKINGS) === snapshot;
console.log((t8 ? 'PASS ' : 'FAIL ') + 'T8 | booking data unchanged after all checks | expected unchanged | observed ' + (t8 ? 'unchanged' : 'CHANGED'));
t8 ? pass++ : fail++;
console.log('\nTOTAL: ' + pass + ' passed, ' + fail + ' failed, ' + (pass + fail) + ' cases, ' + (Date.now() - t0) + ' ms');
process.exit(fail ? 1 : 0);
