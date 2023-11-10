import express from 'express';
import { following_analysis } from '../api/api_table.js';

const router = express.Router();

router.get('/:address', async (req, res) => {
    const addresses = req.params.address;
    try {
        const response = await following_analysis(addresses);
        res.json(response);
    } catch (e) {
        console.log(e);
        res.status(500).json("Error");

    }
})

export default router;