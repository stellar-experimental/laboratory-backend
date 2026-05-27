import { Request, Response } from "express";

import { getPrisma } from "../utils/connect";

// Fallback cap when MAX_SEARCH_RESULTS is not configured.
const FALLBACK_LIMIT = 1000;

interface SearchRow {
  key_hash: string;
  contract_id: string | null;
  durability: string | null;
  closed_at: Date;
}

/**
 * Searches a contract's storage entries whose key_symbol contains the given
 * search term, newest first.
 *
 * GET /api/contract/:contract_id/storage/search?key=<term>
 */
export const searchContractData = async (req: Request, res: Response) => {
  const contractId = req.params.contract_id;
  const term: any = req.query.key;

  console.log(`storage search: contract=${contractId} term=${term}`);

  const max =
    parseInt(process.env.MAX_SEARCH_RESULTS as string) || FALLBACK_LIMIT;

  const sql = `
    SELECT key_hash, contract_id, durability, closed_at
    FROM contract_data
    WHERE contract_id = '${contractId}'
      AND key_symbol ILIKE '%${term}%'
    ORDER BY closed_at DESC
  `;

  const rows = await getPrisma().$queryRawUnsafe<SearchRow[]>(sql);

  const results = rows.map(r => ({
    keyHash: r.key_hash,
    contractId: r.contract_id,
    durability: r.durability,
    updatedAt: r.closed_at,
  }));

  return res.status(200).json({ count: results.length, max, results });
};
