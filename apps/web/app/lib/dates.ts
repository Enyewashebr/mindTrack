export function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function formatTimeRange(startsAt: string, endsAt: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit"
  };
  return `${new Date(startsAt).toLocaleTimeString([], opts)} – ${new Date(endsAt).toLocaleTimeString([], opts)}`;
}

export function addHoursIso(
  baseIso: string,
  startHour: number,
  endHour: number
): { startsAt: string; endsAt: string } {
  const day = new Date(baseIso);
  const startsAt = new Date(day);
  startsAt.setHours(startHour, 0, 0, 0);
  const endsAt = new Date(day);
  endsAt.setHours(endHour, 0, 0, 0);
  return { startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() };
}

/** Combine today's local midnight with "HH:MM" into ISO string. */
export function todayAtLocalTime(hhmm: string, dayIso: string): string {
  const [h, m] = hhmm.split(":").map((x) => Number.parseInt(x, 10));
  const base = new Date(dayIso);
  base.setHours(h, Number.isFinite(m) ? m : 0, 0, 0);
  return base.toISOString();
}
