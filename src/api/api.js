import { request, gql } from 'graphql-request';
import { tratarMetadataFx, tratarDadosFx, tratarMetadataObjkt, tratarDadosObjkt } from '../utils/utils.js'

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
    return tokens;
}

export { loadFx, loadObjkt };
