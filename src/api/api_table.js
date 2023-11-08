import axios from 'axios';
import { request, gql } from 'graphql-request';
import { PL, userData, firstLastMint, tokensCount } from '../utils/table.js'


const api_key = '90SNJX492YSDRLTL3ZEQZ12L3YD17I3';
const baseUrlOBJKT = 'https://data.objkt.com/v3/graphql/';
const baseUrlTzPro = 'https://api.tzpro.io/';
const baseUrlTzkt = 'https://api.tzkt.io/';

const userDataRequest = gql`
query MyQuery ($address: String!) {
    event(
      where: {creator: {address: {_eq: $address}}}
      limit: 1
    ) {
      id
      marketplace_event_type
      event_type
      creator {
        address
        twitter
        tzdomain
        website
        alias
      }
    }
  }
  
`

const userMintedFirst = gql`
query MyQuery($address: String!) {
    token(
      where: {creators: {creator_address: {_eq: $address}}}
      order_by: {timestamp: asc}
      limit: 1
    ) {
      token_id
      fa_contract
      timestamp
    }
  }  
  `

const userMintedLast = gql`
query MyQuery($address: String!) {
    token(
      where: {creators: {creator_address: {_eq: $address}}}
      order_by: {timestamp: desc}
      limit: 1
    ) {
      token_id
      fa_contract
      timestamp
    }
  }
  `


async function totalEdBS(address) {
    const sold = await axios.get(`${baseUrlTzPro}v1/wallets/${address}/nft_trades?seller=${address}&limit=10000&api_key=${api_key}`);
    const buy = await axios.get(`${baseUrlTzPro}v1/wallets/${address}/nft_trades?buyer=${address}&limit=10000&api_key=${api_key}`);
    return {sold: sold.data.length, buy: buy.data.length};
}



async function following_analysis(addresses) {
    const address = addresses.split(",");
    const listResults = []
    for (const add of address) {
      console.log(add)
      const variables = {
          address: add
      }
  
      //consultas api
      const plData_ = await axios.get(`${baseUrlTzPro}explorer/account/${add}?api_key=${api_key}`)
      const tokenBalData = await axios.get(`${baseUrlTzkt}v1/tokens/balances?account=${add}&limit=1000&balance.gt=0`)
      const userData_ = await request(baseUrlOBJKT, userDataRequest, variables);
      const mintDateFirst = await request(baseUrlOBJKT, userMintedFirst, variables);
      const mintDateLast = await request(baseUrlOBJKT, userMintedLast, variables);
      const transfers = await totalEdBS(address);
  
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