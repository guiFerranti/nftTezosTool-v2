import express from 'express';
import { token_balance } from '../api/api.js';

const router = express.Router();

router.get('/:address', async (req, res) => {
    const address = req.params.address;
    try {
        const result = await token_balance(address);
        res.json(result)
    } catch (e) {
        console.log(e);
        res.status(500).json("Erro")
    }
})

export default router;