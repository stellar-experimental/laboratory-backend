import express, { Router } from "express";

import { searchContractData } from "../controllers/search";

const router: Router = express.Router();

// Search a contract's storage entries by key symbol.
router.get("/contract/:contract_id/storage/search", searchContractData);

export default router;
