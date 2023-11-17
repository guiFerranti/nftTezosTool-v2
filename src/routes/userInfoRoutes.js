import express from 'express';
import { user_info } from '../api/api.js';

const router = express.Router();

router.get('/:address', async (req, res) => {
    const address = req.params.address;
    try {
        const response = await user_info(address);
        res.json(response);
    } catch (e) {
        console.log(e);
    }
})

export default router;