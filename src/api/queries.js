import { gql } from 'graphql-request';

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
    fa_contract
    creators {
      creator_address
    }
  }
}
`

const sold = gql`
query MyQuery($address: String!, $offset: Int!) {
  listing_sale(where: {seller_address: {_eq: $address}}, offset: $offset) {
    amount
    buyer_address
    price
    token_pk
    buyer {
      tzdomain
      alias
    }
  }
}
`

const bought = gql`
query MyQuery($address: String!, $offset: Int!) {
  listing_sale(where: {buyer_address: {_eq: $address}}, offset: $offset) {
    price
    token_pk
    seller {
      tzdomain
      alias
    }
    amount
    seller_address
    token {
      listing_sales(where: {seller_address: {_eq: $address}}) {
        amount
        price
      }
      royalties {
        amount
      }
    }
  }
}
`

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

function tags(params) {
  const tags = JSON.stringify(params);
  // ${tags}
  const request = gql`
  query MyQuery {
    listing(
    order_by: {timestamp: desc}
    where: {amount_left: {_gt: 1}, status: {_eq: "active"}, token: {tags: {tag: {name: {_in: ${tags}}}}}}
  ) {
      id
      timestamp
      amount
      amount_left
      token {
        listings_active {
          price
        }
        name
        mime
        display_uri
        artifact_uri
        fa_contract
        token_id
        supply
        creators {
          creator_address
        }
        tags(where: {tag: {name: {_in: ${tags}}}}) {
          tag {
            name
          }
        }
      }
      marketplace {
        name
      }
    }
  }
  `
  return request;
}

function edition(params) {
  const param = params === 'single' ? 'eq' : params === 'multi' ? 'gt' : null;

  if (param === null) {
    return "Invalid param"
  }

const editions = gql`
query MyQuery {
  listing(
    order_by: {timestamp: desc}
    where: {amount_left: {_gt: 1}, status: {_eq: "active"}, token: {supply: {_${param}: "1"}}}
  ) {
    token {
      listings_active {
        price
      }
      name
      mime
      display_uri
      artifact_uri
      fa_contract
      token_id
      supply
      creators {
        creator_address
      }
      tags {
        tag {
          name
        }
      }
    }
    marketplace {
      name
    }
  }
}
  `
  return editions;
}

const userInfo = gql`
query MyQuery($address: String!) {
  event(
    where: {creator_address: {_eq: $address}, event_type: {_eq: "mint"}}
    order_by: {timestamp: asc}
    limit: 1
  ) {
    timestamp
    creator {
      address
      alias
      tzdomain
      twitter
      website
      description
    }
  }
}
`

const queries = {
    objkt,
    live_feed_mints,
    live_feed_actions,
    mint,
    tokens_bal,
    sold,
    bought,
    userDataRequest,
    userMintedFirst,
    userMintedLast,
    tags,
    edition,
    userInfo
}


export default queries;