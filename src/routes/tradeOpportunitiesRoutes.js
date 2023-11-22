import { trade_opportunities } from '../api/api.js'
import express from 'express';

const router = express.Router();
router.get("/", async (req, res) => {
    try {
        const response = await trade_opportunities();
        res.json(response);
    } catch (e) {
        console.log(e);
    }
})

export default router;