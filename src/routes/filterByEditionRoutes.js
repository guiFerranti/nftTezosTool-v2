import express from 'express';
import { filter_by_edition } from '../api/api.js';

const router = express.Router();

router.get('/:edition', async (req, res) => {
    const edition = req.params.edition;

    try {
        const response = await filter_by_edition(edition);
        res.json(response);
    } catch (e) {
        console.log(e);
    }
})

export default router;