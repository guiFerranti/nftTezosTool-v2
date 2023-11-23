import express from 'express';
import validateRoutes from './routes/validateRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import liveFeedRoutes from './routes/liveFeedRoutes.js';
import followingTableRoutes from './routes/followingTableRoutes.js';
import collectingSalesRoutes from './routes/collectingSalesRoutes.js';
import mintRoutes from './routes/mintRoutes.js';
import tokenBalanceRoutes from './routes/tokenBalanceRoutes.js';
import filterByTagRoutes from './routes/filterByTagRoutes.js';
import filterByEditionRoutes from './routes/filterByEditionRoutes.js';
import userInfoRoutes from './routes/userInfoRoutes.js'
import bidWarRoutes from './routes/bidWarRoutes.js'
import tradeOpportunities from './routes/tradeOpportunitiesRoutes.js'
import psMarketRoutes from './routes/psMarketRoutes.js';

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Servidor escutando na porta: ${port}`);
});

app.get('/', (req, res) => {
    res.json('Working')
})

app.use('/validate', validateRoutes);
app.use('/sales', salesRoutes);
app.use('/live_feed', liveFeedRoutes);
app.use('/following_table', followingTableRoutes);
app.use('/collecting_stats', collectingSalesRoutes);
app.use('/filter_by_tags', filterByTagRoutes);
app.use('/filter_by_edition', filterByEditionRoutes);
app.use('/user_info', userInfoRoutes);
app.use('/bid_war', bidWarRoutes);
app.use('/trade_opportunities', tradeOpportunities)
app.use('/market', psMarketRoutes)
 //v1 tools
app.use('/mint', mintRoutes);
app.use('/token_balance', tokenBalanceRoutes);
