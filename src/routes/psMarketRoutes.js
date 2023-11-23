import express from 'express';
import { ps_market } from '../api/api.js';

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const response = await ps_market();
        res.json(response);
    } catch (e) {
        console.log(e)
    }
})

export default router;