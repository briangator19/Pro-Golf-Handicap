import express from 'express';
import { pool } from '../db/pool';
import { z } from 'zod';

const router = express.Router();

router.post('/', async (req, res) => {
  const schema = z.object({
    name: z.string(),
    venue: z.string().optional(),
    course_rating: z.number().optional(),
    slope_rating: z.number().optional(),
    tees: z.any().optional()
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
  const { name, venue, course_rating, slope_rating, tees } = parsed.data;
  const q = `INSERT INTO courses (name, venue, course_rating, slope_rating, tees) VALUES ($1,$2,$3,$4,$5) RETURNING *`;
  const { rows } = await pool.query(q, [name, venue || null, course_rating || 72.0, slope_rating || 113, tees ? JSON.stringify(tees) : '{}']);
  res.status(201).json(rows[0]);
});

router.get('/', async (req, res) => {
  const q = 'SELECT * FROM courses ORDER BY name LIMIT 500';
  const { rows } = await pool.query(q);
  res.json(rows);
});

export default router;
