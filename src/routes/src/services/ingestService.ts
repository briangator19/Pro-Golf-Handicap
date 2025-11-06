import { pool } from '../db/pool';

export async function runTourIngest(tour: string) {
  // Placeholder; implement per-tour connectors here.
  return { message: `Ingest run for tour ${tour} is not yet implemented. Add connectors in services/ingestService.ts` };
}
