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
        res.status(500).json("Error")
    }

})

app.get('/live_feed', async (req, res) => {
    try {
        const response = await liveFeed();
        res.json(response)
    } catch (e) {
        res.status(500).json("Error")
    }
})

app.get('/following_table/:address', async (req, res) => {
    const addresses = req.params.address;
    try {
        const response = await following_analysis(addresses);
        res.json(response);
    } catch (e) {
        console.log(e)
        res.status(500).json("Error")

    }
})
 
//==================================
//========= TOOLS FROM V1 ==========
//==================================

import { getAllMints, getAllSells, getAllTokens, getBurnedTokens } from "./api/api_v1.js";
import { validateAdd } from "./utils/utils_v1.js"


app.get('/v1/mint/:address', async (req, res) => {
    const address = req.params.address;
    try {
        const result = await getAllMints(address);

        res.json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Ocorreu um erro ao buscar as mints.' });
    }
});

app.get('/v1/sales/:address', async (req, res) => {
    const address = req.params.address;
    try {
        const result = await getAllSells(address);
        res.json(result)
        
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: 'Ocorreu um erro ao buscar as vendas.' });
    }
})

app.get('/v1/token_balance/:address', async (req, res) => {
    const address = req.params.address;
    try {
        
        const result = await getAllTokens(address);
        res.json(result)
 
    } catch (e) {
        console.log(e);
        res.status(500).json({error: 'Ocorreu um erro ao buscar o saldo'})

    }
})

app.get('/v1/burn/:tokenId/:address', async (req, res) => {
    const tokenId = 793482795941889
    const address = "tz1W5C3scSjmfzgxkkXgQeRUrLoHWakHhET1";
    try {
        const [a, b] = await getBurnedTokens(tokenId, address);
        const c = [a, b]
        res.json(c)
    } catch (e) {
        console.log(e)
    }

})

app.get('/v1/validate/:address', async (req, res) => {
    const address = req.params.address;

    try {
        const response = validateAdd(address);
        res.json(response)
    } catch (e) {
        console.log(e)
    }
})
