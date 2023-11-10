import { validateAdd } from './utils/utils.js';
import { liveFeed, sales, minted, token_balance } from './api/api.js'
import express from 'express';
import { following_analysis } from './api/api_table.js';
import validateRoutes from './routes/validateRoutes.js'
import salesRoutes from './routes/salesRoutes.js'
import liveFeedRoutes from './routes/liveFeedRoutes.js'
import followingTableRoutes from './routes/followingTableRoutes.js'
import CollectingSalesRoutes from './routes/CollectingSalesRoutes.js'
import mintRoutes from './routes/mintRoutes.js'
import tokenBalanceRoutes from './routes/tokenBalanceRoutes.js'

const app = express();
const port = process.env.PORT || 3000;


app.listen(port, () => {
    console.log(`Servidor escutando na porta: ${port}`);
});

app.get('/', (req, res) => {
    res.json('Working')
})

app.use('/validate', validateRoutes);
app.use('/sales', salesRoutes)
app.use('/live_feed', liveFeedRoutes)
app.use('/following_table', followingTableRoutes)
app.use('/collecting_sales', CollectingSalesRoutes)
 
//==================================
//==== TOOLS FROM V1 (rebuild) =====
//==================================

app.use('/mint', mintRoutes)
app.use('/token_balance', tokenBalanceRoutes)
