import { request } from 'graphql-request';
import { tratarMetadataObjkt, tratarDadosObjkt, tratarDadosLive, tratarDadosSell, tratarDadosBuy, tratarPrices, user_infos, auction_info, tratarMetadataTezTok, psMarket } from '../utils/utils.js';
import queries from './queries.js';

const baseUrlOBJKT = 'https://data.objkt.com/v3/graphql/';
const baseUrlTezTok = 'https://api.teztok.com/v1/graphql'

async function offSet(query, address, prop) {
  const total_data = [];
  let offset = 0;
  while (true) {
    const variables =  {
      address: address,
      offset: offset
    }
    const data = await request (baseUrlOBJKT, query, variables);
    const new_data = data[prop];
    total_data.push(...new_data)
    if (new_data.length < 500) {
      break
    }
    offset += 500
  }
  return total_data;
}

async function sales(address) {
    const variables = {
        usernameOrAddress: address
    }
    const tokens = [];
    const data = await request (baseUrlOBJKT, queries.objkt, variables);
    // tam da lista
    const tam = data.listing.length;
    // varrer os itens
    for (let i = 0; i < tam; i++) {
        const dados = tratarDadosObjkt(data.listing[i])
        const metadata = tratarMetadataObjkt(data.listing[i].token)
        const token = {
            metadata: metadata,
            dados: dados
        }
        tokens.push(token);
    }
    return tokens;
}

async function liveFeed() {
  const tokens = [];
  const data = await request (baseUrlOBJKT, queries.live_feed_mints);
  const data_actions = await request (baseUrlOBJKT, queries.live_feed_actions);
  const tam = data.event.length;
  for (let i = 0; i < tam; i++){
    // dado mints
    const metadata = tratarMetadataObjkt(data.event[i].token)
    const dados = tratarDadosLive(data.event[i])
    const token = {
      token: metadata,
      dados: dados
    }
    tokens.push(token);
    // dados actions
    const metadata2 = tratarMetadataObjkt(data_actions.event[i].token)
    const dados2 = tratarDadosLive(data_actions.event[i])
    const token2 = {
      token: metadata2,
      dados: dados2
    }
    tokens.push(token2);

  }
  const sortedTokens = tokens.sort((a, b) => new Date(a.dados.timestamp) - new Date(b.dados.timestamp));
  sortedTokens.reverse()
  return sortedTokens;
}

async function minted(address) {
  const variables = {
    address: address
  }
  const tokens = []
  const data = await request(baseUrlOBJKT, queries.mint, variables);
  for (const item of data.event) {
    const metadata = tratarMetadataObjkt(item.token)
    const token = {
      metadata: metadata,
      creators: item.token.creators,
      contract: item['fa_contract'],
      supply: item.token['supply']
    }
    tokens.push(token);
  }
  return tokens;
}

async function token_balance(address) {
  const variables = {
    address: address
  }
  const tokenBalData = await request(baseUrlOBJKT, queries.tokens_bal, variables);
  const tokens = [];
  for (const item of tokenBalData.token) {
    const metadata = tratarMetadataObjkt(item);
    const token = {
      metadata: metadata,
      contract: item['fa_contract'],
      creators: item.creators[0]['creator_address'],
      editions: {
        supply: item['supply'],
        owned: item.holders[0]['quantity']
      },
      timestamp: item['timestamp']
    }
    tokens.push(token);
  }
  return tokens;
}

async function collecting_stats(address) {

  const sold_data = await offSet(queries.sold, address, 'listing_sale');
  const bought_data = await offSet(queries.bought, address, 'listing_sale');
  const data = {
    bought: tratarDadosBuy(bought_data),
    sold: tratarDadosSell(sold_data)
  }
  return data;
}

async function filter_by_tags(tag){
  const tags = tag.split(",")
  const items_filtered = []

  const response = await request(baseUrlOBJKT, queries.tags(tags));
  
  for (const item of response.listing) {

    const metadata = tratarPrices(item);

    items_filtered.push(metadata);
  }

  return items_filtered;
}

async function filter_by_edition(params) {
  const response = await request(baseUrlOBJKT, queries.edition(params));
  const items = [];

  for (const item of response.listing) {

    const metadata = tratarPrices(item);

    items.push(metadata);
  }

  return items;
}

async function user_info(address) {
  const variables = {
    address: address
  }
  const response = await request(baseUrlOBJKT, queries.userInfo, variables);
  let listings_solds = response.event[0].creator.listings_sold.length;
  let offset = 500;
  while (listings_solds === offset) {
    try {
      const variables = {
          address: address,
          offset: offset
      }
      const response = await request(baseUrlOBJKT, queries.userInfoSales, variables);
      offset += 500;
      listings_solds += response.event[0].creator.listings_sold.length;
    } catch (e) {
      //leave the loop
      listings_solds += 1;
    }
  }

  const infos = user_infos(response.event[0], listings_solds);
  return infos;
}

async function bid_war() {
  const response = await request(baseUrlOBJKT, queries.bidWar);
  
  const MappedBy = new Map();

  for (const item of response.english_auction_bid){
    
    const metadata = tratarPrices(item.auction);
    const auction_bid = auction_info(item.auction);
    const auction = {
      metadata: metadata,
      auction_info: auction_bid
    }

    const key = item.auction.hash;

    if (!MappedBy.has(key)) {
      MappedBy.set(key, auction);
    }
  }

  const tokens = Array.from(MappedBy.values());

  return tokens;
}

async function trade_opportunities() {
  const tokens = []
  const response = await request(baseUrlTezTok, queries.tradeOpportunities);

  for (const item of response.tokens) {
    const token = tratarMetadataTezTok(item);
    tokens.push(token);

  }
  return tokens;
}

async function ps_market() {
  const response = await request(baseUrlOBJKT, queries.PSMarket);
  const tokens = psMarket(response.listing);

  return tokens;
}



export { sales, liveFeed, minted, token_balance, collecting_stats, filter_by_tags, filter_by_edition, user_info, bid_war, trade_opportunities, ps_market };
