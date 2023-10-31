import { sortTokens } from './utils/utils.js';
import express from 'express';

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