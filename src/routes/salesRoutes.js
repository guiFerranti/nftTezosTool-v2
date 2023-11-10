import express from 'express';
import { sales } from '../api/api.js';

const router = express.Router();

router.get('/:address', async (req, res)=> {
    const address = req.params.address;
    try {
        const response = await sales(address);
        res.json(response)
    } catch (e) {
        console.log(e)
        res.status(500).json("Error")
    }
})

export default router;