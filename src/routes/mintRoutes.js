import express from 'express';
import { minted } from '../api/api.js';

const router = express.Router();

router.get('/:address', async (req, res) => {
    const address = req.params.address;
    try {
        const result = await minted(address);
        res.json(result)
    } catch (e) {
        console.log(e)
        res.status(500).json("Error")
    }
})

export default router;