export default {
  // Appsmith JS Object "JS_Availability" (low-code track).
  // Widgets used: Input_Start (text, YYYY-MM-DDTHH:mm), Input_Duration (number),
  //               Switch_Blocked (switch), Table_Bookings (table, read-only), Text_Result (text)
  // Bindings:  Text_Result.Text = {{ JS_Availability.run().message }}
  //            Table_Bookings.Table data = {{ JS_Availability.bookings }}
  MAX_MINUTES: 120,
  bookings: [
    { id: "B1", title: "Fictional lecture",      start: "2026-12-01T10:00", end: "2026-12-01T11:00" },
    { id: "B2", title: "Fictional seminar",      start: "2026-12-01T13:00", end: "2026-12-01T14:30" },
    { id: "B3", title: "Fictional club meeting", start: "2026-12-02T09:00", end: "2026-12-02T10:00" }
  ],
  msg: {
    OK: "Available: the room is free for the chosen time.",
    INVALID_START_FORMAT: "Please choose a valid start date and time.",
    INVALID_START_PAST: "The start time must be in the future.",
    INVALID_DURATION_FORMAT: "Please enter the duration as a whole number of minutes.",
    INVALID_DURATION_RANGE: "Duration must be more than 0 and at most 120 minutes.",
    ROOM_BLOCKED: "Unavailable: the room is blocked.",
    OVERLAP: "Unavailable: the room is already booked at this time."
  },
  parse(s) {
    if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  },
  result(available, valid, code) {
    return { available: available, valid: valid, code: code, message: this.msg[code] };
  },
  // `nowOverride` is used only by the test harness; in Appsmith call run() with no argument.
  run(nowOverride) {
    const now = nowOverride || new Date();
    const start = this.parse(Input_Start.text);
    if (!start) return this.result(false, false, "INVALID_START_FORMAT");
    if (start.getTime() <= now.getTime()) return this.result(false, false, "INVALID_START_PAST");
    const raw = String(Input_Duration.text).trim();
    if (!/^-?\d+$/.test(raw)) return this.result(false, false, "INVALID_DURATION_FORMAT");
    const minutes = parseInt(raw, 10);
    if (minutes <= 0 || minutes > this.MAX_MINUTES) return this.result(false, false, "INVALID_DURATION_RANGE");
    if (Switch_Blocked.isSwitchedOn) return this.result(false, true, "ROOM_BLOCKED");
    const s = start.getTime(), e = s + minutes * 60000;
    for (const b of this.bookings) {
      const bs = this.parse(b.start).getTime(), be = this.parse(b.end).getTime();
      if (s < be && bs < e) return this.result(false, true, "OVERLAP");
    }
    return this.result(true, true, "OK");
  }
}
