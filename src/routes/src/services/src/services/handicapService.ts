import { pool } from '../db/pool';

function getUseCount(n: number): number {
  if (n >= 20) return 8;
  if (n === 19) return 7;
  if (n === 18) return 6;
  if (n === 17) return 6;
  if (n === 16) return 5;
  if (n >= 11 && n <= 15) return 4;
  if (n >= 8 && n <= 10) return 3;
  if (n === 7 || n === 6) return 2;
  if (n === 5) return 1;
  return 0;
}

export async function computeHandicapForPlayer(playerId: number): Promise<number | null> {
  const q = `
    SELECT s.id, s.date_played, s.adjusted_gross, c.course_rating, c.slope_rating
    FROM scores s
    LEFT JOIN courses c ON s.course_id = c.id
    WHERE s.player_id = $1
    ORDER BY s.date_played DESC
    LIMIT 40;
  `;
  const { rows } = await pool.query(q, [playerId]);
  if (!rows || rows.length === 0) return null;

  const diffs = rows
    .filter((r: any) => r.course_rating !== null && r.slope_rating !== null)
    .map((r: any) => {
      const diff = ((r.adjusted_gross - parseFloat(r.course_rating)) * 113) / Number(r.slope_rating);
      return { id: r.id, date: r.date_played, differential: Number(diff.toFixed(2)) };
    });

  if (diffs.length < 5) return null;

  const mostRecent = diffs.slice(0, 20);
  const n = mostRecent.length;
  const use = getUseCount(n);
  if (use === 0) return null;

  const lowest = mostRecent.map((d) => d.differential).sort((a, b) => a - b).slice(0, use);
  const avg = lowest.reduce((s, v) => s + v, 0) / lowest.length;
  const multiplier = 1.0;
  const index = Number((avg * multiplier).toFixed(2));
  return index;
}
