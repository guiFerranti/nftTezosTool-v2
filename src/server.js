import dotenv from 'dotenv';
import { sortTokens } from './utils/utils.js';
import { liveFeed } from './api/api.js'
import express from 'express';
import { following_analysis } from './api/api_table.js';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;


app.listen(port, () => {
    console.log(`Servidor escutando na porta: ${port}`);
});

app.get('/', (req, res) => {
    res.json('Working')
})

app.get('/sales/:address', async (req, res)=> {
    const address = req.params.address;
    try {
        const response = await sortTokens(address);
        res.json(response)
    } catch (e) {
        console.log(e)
    }

})

app.get('/live_feed', async (req, res) => {
    try {
        const response = await liveFeed();
        res.json(response)
    } catch (e) {
        console.log(e)
    }
})

app.get('/following_table/:address', async (req, res) => {
    const address = req.params.address;
    try {
        const response = await following_analysis(address);
        res.json(response);
    } catch (e) {
        console.log(e);
    }
})
 