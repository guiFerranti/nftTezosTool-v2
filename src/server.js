import dotenv from 'dotenv';
import { validateAdd } from './utils/utils.js';
import { liveFeed, sales, minted, token_balance } from './api/api.js'
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

app.get('/validate/:address', async (req, res) => {
    const address = req.params.address;

    try {
        const response = validateAdd(address);
        res.json(response)
    } catch (e) {
        console.log(e)
    }
})

app.get('/sales/:address', async (req, res)=> {
    const address = req.params.address;
    try {
        const response = await sales(address);
        res.json(response)
    } catch (e) {
        console.log(e)
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
//==== TOOLS FROM V1 (rebuild) =====
//==================================

app.get('/mint/:address', async (req, res) => {
    const address = req.params.address;
    try {
        const result = await minted(address);
        res.json(result)
    } catch (e) {
        console.log(e)
        res.status(500).json("Error")
    }
})

app.get('/token_balance/:address', async (req, res) => {
    const address = req.params.address;
    try {
        const result = await token_balance(address);
        res.json(result)
    } catch (e) {
        console.log(e);
        res.status(500).json("Erro")
    }
})






