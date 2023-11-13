import { validateAddress } from '@taquito/utils';


function validateAdd(address) {
    const validation = validateAddress(address);
    return validation;
}

function tratarMetadataObjkt(data) {
    const metadata = {
        name: data['name'],
        artifact_uri: data['artifact_uri'],
        display_uri: data['display_uri'],
        mime: data['mime'],
        token_id: data['token_id'] || data['onChainId'],
        contract: data['fa_contract']
    }
    return metadata;
}

function tratarDadosObjkt(data) {
    const dados = {
        timestamp: data['timestamp'],
        price: data['price'],
        amount: data['amount'],
        amount_left: data['amount_left'],
        status: data['status']
    }
    return dados;
}

function tratarDadosLive(data) {
    
    const events = {
        list_create: "List",
        list_buy: "Buy",
        mint: "Mint",
        open_edition_buy: "Buy Open Edition",
        open_edition_create: "List Open Edition"
    }
    const event = {
        price: data['price'],
        event_type: data['event_type'] || data['marketplace_event_type'],
        timestamp: data['timestamp'],
        sender: data['recipient_address'] || data.creator['address'], 
        creator: data.creator['address'],
    }

    const EventTratado = Object.assign({}, event, {event_type: events[event.event_type]});
    return EventTratado;
}

function tratarDadosSell(data) {
    const tokens = data.reduce((r, a) => {
        if (!r[a.buyer_address]) {
          r[a.buyer_address] = { 
            address: a.buyer_address,
            domain: a.buyer.tzdomain,
            name: a.buyer.alias,
            totalTokens: 0,
            totalEditions: 0,
            price: 0,
            tokens: {} };
        }
        if (!r[a.buyer_address].tokens[a.token_pk]) {
          r[a.buyer_address].tokens[a.token_pk] = { amount: 0 };
          r[a.buyer_address].totalTokens += 1;        
        }
        r[a.buyer_address].tokens[a.token_pk].amount += a.amount;
        r[a.buyer_address].totalEditions += a.amount;
        r[a.buyer_address].price += a.price;
        return r;
      }, {});

    const sortedTokens = Object.values(tokens).sort((a, b) => b.price - a.price);

    return sortedTokens;
}

function tratarDadosBuy(data) {
    const tokens = data.reduce((r, a) => {
        if (!r[a.seller_address]) {
          r[a.seller_address] = { 
            address: a.seller_address,
            domain: a.seller.tzdomain,
            name: a.seller.alias,
            totalTokens: 0,
            totalEditions: 0,
            price: 0,
            tokens: {},
            sales: 0 };
        }
        if (!r[a.seller_address].tokens[a.token_pk]) {
          r[a.seller_address].tokens[a.token_pk] = { amount: 0, sales: 0 };
          r[a.seller_address].totalTokens += 1;        
        }
        r[a.seller_address].tokens[a.token_pk].amount += a.amount;
        r[a.seller_address].totalEditions += a.amount;
        r[a.seller_address].price += a.price;

        if (a.token.listing_sales && a.token.listing_sales.length > 0) {
          r[a.seller_address].tokens[a.token_pk].sales = a.token.listing_sales[0].price;
          r[a.seller_address].sales += a.token.listing_sales[0].price;
        }

        return r;
      }, {});

    const sortedTokens = Object.values(tokens).sort((a, b) => b.price - a.price);
    
    return sortedTokens;
}



export { tratarMetadataObjkt, tratarDadosObjkt, tratarDadosLive, validateAdd, tratarDadosSell, tratarDadosBuy };