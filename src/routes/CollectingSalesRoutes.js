import express from 'express';

const router = express.Router();

router.get('/:address', async (req, res) => {
    const address = req.params.address;
    try {
        // const response = await '';
        const response = address;
        res.json(response);
    } catch (e) {
        console.log(e);
        res.status(500).json("Error");
    }
})

export default router;