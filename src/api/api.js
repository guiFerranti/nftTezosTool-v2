import { request, gql } from 'graphql-request';
import { tratarMetadataFx, tratarDadosFx, tratarMetadataObjkt, tratarDadosObjkt, tratarDadosLive } from '../utils/utils.js'

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

const fxhash = gql`
query Query($usernameOrAddress: String) {
    account(usernameOrAddress: $usernameOrAddress) {
      listings {
        id
        version
        amount
        price
        royalties
        createdAt
        cancelledAt
        acceptedAt
        objkt {
          metadata
          captureMedia {
            mimeType
          }
          onChainId
        }
      }
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


async function loadFx(address) {
    const variables = {
        usernameOrAddress: address
    }
    const tokens = []
    const data = await request ('https://api.fxhash.xyz/graphql/', fxhash, variables);
    // pegar o tamanho da lista
    const tam = data.account.listings.length;
    // usar o tamanho para percorrer o array
    for (let i = 0; i < tam; i++) {
        // tratar cada dados
        const metadata = tratarMetadataFx(data.account.listings[i].objkt)
        const dados = tratarDadosFx(data.account.listings[i])
        // fazer o objeto
        const token = {
            metadata: metadata,
            dados: dados
        }
        tokens.push(token);
    }
    return tokens;
}

async function loadObjkt(address) {
    const variables = {
        usernameOrAddress: address
    }
    const tokens = [];
    const data = await request ('https://data.objkt.com/v3/graphql/', objkt, variables);
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
    const sortedTokens = tokens.sort((a, b) => new Date(a.dados.timestamp) - new Date(b.dados.timestamp));
    sortedTokens.reverse()
    return sortedTokens;
}

async function liveFeed() {
  const tokens = [];
  const data = await request ('https://data.objkt.com/v3/graphql/', live_feed_mints);
  const data_actions = await request ('https://data.objkt.com/v3/graphql/', live_feed_actions);
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
    const metadata2 = tratarMetadataObjkt(data.event[i].token)
    const dados2 = tratarDadosLive(data.event[i])
    const token2 = {
      token: metadata,
      dados: dados
    }
    tokens.push(token2);

  }
  return tokens
}

export { loadFx, loadObjkt, liveFeed };
