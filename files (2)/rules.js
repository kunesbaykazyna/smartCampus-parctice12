/* Smart Campus Room Availability Checker - rules engine (v1.0, code-based track)
   Pure functions only: no DOM, no storage. Fictional data only. */
(function (root) {
  'use strict';

  var MAX_MINUTES = 120;

  // Fixed fictional bookings for room A-101 (local time, "YYYY-MM-DDTHH:mm")
  var BOOKINGS = Object.freeze([
    Object.freeze({ id: 'B1', title: 'Fictional lecture', start: '2026-12-01T10:00', end: '2026-12-01T11:00' }),
    Object.freeze({ id: 'B2', title: 'Fictional seminar', start: '2026-12-01T13:00', end: '2026-12-01T14:30' }),
    Object.freeze({ id: 'B3', title: 'Fictional club meeting', start: '2026-12-02T09:00', end: '2026-12-02T10:00' })
  ]);

  var MESSAGES = {
    OK: 'Available: the room is free for the chosen time.',
    INVALID_START_FORMAT: 'Please choose a valid start date and time.',
    INVALID_START_PAST: 'The start time must be in the future.',
    INVALID_DURATION_FORMAT: 'Please enter the duration as a whole number of minutes.',
    INVALID_DURATION_RANGE: 'Duration must be more than 0 and at most 120 minutes.',
    ROOM_BLOCKED: 'Unavailable: the room is blocked.',
    OVERLAP: 'Unavailable: the room is already booked at this time.'
  };

  function parseLocal(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return null;
    var d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  // 1) VALIDATION
  function validate(input, now) {
    var start = parseLocal(input && input.start);
    if (!start) return { ok: false, code: 'INVALID_START_FORMAT' };
    if (start.getTime() <= now.getTime()) return { ok: false, code: 'INVALID_START_PAST' };
    var raw = input.duration;
    if (typeof raw === 'string') raw = raw.trim();
    if (raw === '' || raw === null || raw === undefined || !/^-?\d+$/.test(String(raw))) {
      return { ok: false, code: 'INVALID_DURATION_FORMAT' };
    }
    var minutes = parseInt(raw, 10);
    if (minutes <= 0 || minutes > MAX_MINUTES) return { ok: false, code: 'INVALID_DURATION_RANGE' };
    return { ok: true, startMs: start.getTime(), endMs: start.getTime() + minutes * 60000 };
  }

  // 2) AVAILABILITY CALCULATION (does not modify bookings)
  function overlaps(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd; // touching edges do NOT overlap
  }

  function checkAvailability(input, bookings, now) {
    var v = validate(input, now);
    if (!v.ok) return { available: false, valid: false, code: v.code, message: MESSAGES[v.code] };
    if (input.blocked === true) {
      return { available: false, valid: true, code: 'ROOM_BLOCKED', message: MESSAGES.ROOM_BLOCKED };
    }
    for (var i = 0; i < bookings.length; i++) {
      var bs = parseLocal(bookings[i].start).getTime();
      var be = parseLocal(bookings[i].end).getTime();
      if (overlaps(v.startMs, v.endMs, bs, be)) {
        return { available: false, valid: true, code: 'OVERLAP', message: MESSAGES.OVERLAP, conflictWith: bookings[i].id };
      }
    }
    return { available: true, valid: true, code: 'OK', message: MESSAGES.OK };
  }

  var api = { BOOKINGS: BOOKINGS, MESSAGES: MESSAGES, MAX_MINUTES: MAX_MINUTES, validate: validate, checkAvailability: checkAvailability };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SmartCampusRules = api;
})(typeof self !== 'undefined' ? self : this);
