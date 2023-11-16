import { request } from 'graphql-request';
import { tratarMetadataObjkt, tratarDadosObjkt, tratarDadosLive, tratarDadosSell, tratarDadosBuy } from '../utils/utils.js';
import queries from './queries.js';

const baseUrlOBJKT = 'https://data.objkt.com/v3/graphql/';

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
  
  for (const item of response.listing_active) {

    const metadata = tratarMetadataObjkt(item.token);
    const creator = item.token.creators[0]['creator_address']
    const min_price = Math.min(...item.token.listings_active.map(listing => listing.price));
    const item_tag = item.token.tags[0].tag['name'];
    const marketplace = item.marketplace['name']

    metadata['creator'] = creator;
    metadata['min_price'] = min_price;
    metadata['tag'] = item_tag;
    metadata['marketplace'] = marketplace;

    items_filtered.push(metadata);
  }

  return items_filtered;
}

export { sales, liveFeed, minted, token_balance, collecting_stats, filter_by_tags };
