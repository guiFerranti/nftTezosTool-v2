import express from 'express';
import { liveFeed } from '../api/api.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const response = await liveFeed();
        res.json(response)
    } catch (e) {
        res.status(500).json("Error")
    }
})

export default router;