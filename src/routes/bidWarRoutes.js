import express from 'express';
import { bid_war } from '../api/api.js'


const router = express.Router();

router.get('/', async(req, res) => {
    try {
        const response = await bid_war();
        res.json(response);
    } catch (e) {
        console.log(e);
    }
})

export default router;