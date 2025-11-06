import express from 'express';
import { pool } from '../db/pool';
import { computeHandicapForPlayer } from '../services/handicapService';
import { z } from 'zod';

const router = express.Router();

// Create player
router.post('/', async (req, res) => {
  const schema = z.object({ name: z.string(), tour: z.string().optional(), nationality: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const { name, tour, nationality } = parsed.data;
  const q = 'INSERT INTO players (name, tour, nationality) VALUES ($1,$2,$3) RETURNING *';
  const { rows } = await pool.query(q, [name, tour || null, nationality || null]);
  res.status(201).json(rows[0]);
});

// Add a score (manual ingestion)
router.post('/:id/scores', async (req, res) => {
  const playerId = Number(req.params.id);
  const schema = z.object({
    date_played: z.string(), // ISO date
    gross_score: z.number(),
    adjusted_gross: z.number(),
    course_id: z.number().optional(),
    tournament_id: z.number().optional(),
    round_number: z.number().optional(),
    par: z.number().optional(),
    notes: z.string().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const body = parsed.data;
  const q = `INSERT INTO scores (player_id, date_played, gross_score, adjusted_gross, course_id, tournament_id, round_number, par, notes)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`;
  const vals = [playerId, body.date_played, body.gross_score, body.adjusted_gross, body.course_id || null, body.tournament_id || null, body.round_number || null, body.par || null, body.notes || null];
  const { rows } = await pool.query(q, vals);
  // Recompute handicap and store in history
  const currentIndex = await computeHandicapForPlayer(playerId);
  if (currentIndex !== null) {
    await pool.query(`INSERT INTO handicap_history (player_id, handicap_index, details) VALUES ($1,$2,$3)`, [playerId, currentIndex, JSON.stringify({ reason: 'manual score ingestion' })]);
  }
  res.status(201).json(rows[0]);
});

// Get player with recent scores and current index
router.get('/:id', async (req, res) => {
  const playerId = Number(req.params.id);
  const playerQ = 'SELECT * FROM players WHERE id=$1';
  const playerRes = await pool.query(playerQ, [playerId]);
  if (playerRes.rowCount === 0) return res.status(404).json({ error: 'player not found' });
  const scoresRes = await pool.query('SELECT * FROM scores WHERE player_id=$1 ORDER BY date_played DESC LIMIT 200', [playerId]);
  const historyRes = await pool.query('SELECT * FROM handicap_history WHERE player_id=$1 ORDER BY calculated_at DESC LIMIT 200', [playerId]);
  const currentIndex = await computeHandicapForPlayer(playerId);
  res.json({ player: playerRes.rows[0], scores: scoresRes.rows, handicap_index: currentIndex, history: historyRes.rows });
});

export default router;
