import { request, gql } from 'graphql-request';
import { tratarMetadataObjkt, tratarDadosObjkt, tratarDadosLive } from '../utils/utils.js'
import axios from 'axios';

const baseUrlOBJKT = 'https://data.objkt.com/v3/graphql/';
const baseUrlTzkt = 'https://api.tzkt.io/';

const objkt = gql`
query MyQuery($usernameOrAddress: String) {
    listing(
      where: {seller_address: {_eq: $usernameOrAddress}}
      order_by: {timestamp: desc}
    ) {
      fa_contract
      price
      token {
        fa_contract
        metadata
        mime
        token_id
        artifact_uri
        display_uri
        name
      }
      timestamp
      status
      amount
      amount_left
    }
  }
  `

const live_feed_mints = gql`
query MyQuery {
  event(
    order_by: {timestamp: desc}
    where: {token: {name: {_neq: "null"}}, event_type: {_nin: ["open_edition_update", "transfer"]}}
    limit: 100
  ) {
    price
    event_type
    marketplace_event_type
    timestamp
    recipient_address
    ophash
    creator {
      address
    }
    token {
      name
      mime
      fa_contract
      token_id
      artifact_uri
      display_uri
    }
  }
}
`

const live_feed_actions = gql`
query MyQuery {
  event(
    order_by: {timestamp: desc}
    where: {token: {name: {_neq: "null"}}, marketplace_event_type: {_in: ["list_create", "list_buy"]}}
    limit: 100
  ) {
    price
    event_type
    marketplace_event_type
    timestamp
    recipient_address
    ophash
    creator {
      address
    }
    token {
      name
      mime
      fa_contract
      token_id
      artifact_uri
      display_uri
    }
  }
}
`

const mint = gql`
query MyQuery($address: String!) {
  event(
    where: {creator: {address: {_eq: $address}}, event_type: {_eq: "mint"}}
    order_by: {timestamp: desc}
  ) {
    fa_contract
    token {
      artifact_uri
      display_uri
      name
      mime
      token_id
      supply
      creators {
        creator_address
      }
    }
    timestamp
    event_type
    marketplace_event_type
  }
}
`

const tokens_bal = gql`
query MyQuery($address: String!) {
  token(
    where: {holders: {holder_address: {_eq: $address}, quantity: {_gt: "0"}}, creators: {creator_address: {_nin: [$address]}}}
    order_by: {timestamp: desc}
  ) {
    artifact_uri
    display_uri
    mime
    name
    ophash
    supply
    timestamp
    token_id
    holders(where: {holder_address: {_eq: $address}, quantity: {_gt: "0"}}) {
      holder_address
      quantity
    }
  }
}
`


async function sales(address) {
    const variables = {
        usernameOrAddress: address
    }
    const tokens = [];
    const data = await request (baseUrlOBJKT, objkt, variables);
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
  const data = await request (baseUrlOBJKT, live_feed_mints);
  const data_actions = await request (baseUrlOBJKT, live_feed_actions);
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
  const data = await request(baseUrlOBJKT, mint, variables);
  for (const item of data.event) {
    console.log(item)
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
  const tokenBalData = await request(baseUrlOBJKT, tokens_bal, variables);
  const tokens = [];
  console.log(tokenBalData.token)
  for (const item of tokenBalData.token) {

    const metadata = tratarMetadataObjkt(item);
    const token = {
      metadata: metadata,
      contract: item['fa_contract'],
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

export { sales, liveFeed, minted, token_balance };
//{"address": "tz1V21HQQHXaKvmzRAMYWRwJNSh69crC7EXC"}