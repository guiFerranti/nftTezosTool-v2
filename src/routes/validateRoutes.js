import express from 'express';
import { validateAdd } from '../utils/utils.js';

const router = express.Router();

router.get('/:address', async (req, res) => {
    const address = req.params.address;

    try {
        const response = validateAdd(address);
        res.json(response)
    } catch (e) {
        console.log(e)
    }
})

export default router;