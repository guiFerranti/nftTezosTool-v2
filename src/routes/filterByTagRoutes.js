import express from 'express';
import { filter_by_tags } from '../api/api.js'

const router = express.Router();

router.get('/:tag', async (req, res) => {
    const tag = req.params.tag;
    try {
        const response = await filter_by_tags(tag);
        res.json(response);
    } catch (e) {
        console.log(e);
    }
})

export default router;