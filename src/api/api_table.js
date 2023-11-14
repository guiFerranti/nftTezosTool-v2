import axios from 'axios';
import { request, gql } from 'graphql-request';
import { PL, userData, firstLastMint, tokensCount } from '../utils/table.js'
import queries from './queries.js';

const api_key = process.env.API_KEY;
const baseUrlOBJKT = 'https://data.objkt.com/v3/graphql/';
const baseUrlTzPro = 'https://api.tzpro.io/';
const baseUrlTzkt = 'https://api.tzkt.io/';


async function totalEdBS(address) {
    const sold = await axios.get(`${baseUrlTzPro}v1/wallets/${address}/nft_trades?seller=${address}&limit=10000&api_key=${api_key}`);
    const buy = await axios.get(`${baseUrlTzPro}v1/wallets/${address}/nft_trades?buyer=${address}&limit=10000&api_key=${api_key}`);
    return {sold: sold.data.length, buy: buy.data.length};
}

async function following_analysis(addresses) {
  const address = addresses.split(",");
  const listResults = []
  for (const add of address) {
    const variables = {
        address: add
    }

    //consultas api
    const plData_ = await axios.get(`${baseUrlTzPro}explorer/account/${add}?api_key=${api_key}`)
    const tokenBalData = await axios.get(`${baseUrlTzkt}v1/tokens/balances?account=${add}&limit=1000&balance.gt=0&token.standard=fa2`)
    const userData_ = await request(baseUrlOBJKT, queries.userDataRequest, variables);
    const mintDateFirst = await request(baseUrlOBJKT, queries.userMintedFirst, variables);
    const mintDateLast = await request(baseUrlOBJKT, queries.userMintedLast, variables);
    const transfers = await totalEdBS(add);

    // tratar dados
    const userTratado = userData(userData_.event[0].creator);
    const plTratado = PL(plData_.data);
    const mintDate = firstLastMint(mintDateFirst.token[0], mintDateLast.token[0]);
    const tokenBalance = tokensCount(tokenBalData.data)

    //objeto
    const dados = {
        user_info: userTratado,
        pl: plTratado,
        mint_info: mintDate,
        token_transfers: transfers,
        token_balance: tokenBalance
    }
    listResults.push(dados);
  }
  return listResults;
}

export { following_analysis };