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
  
    let stats = {
        totalTokens: 0,
        totalEditions: 0,
        totalEditionsSold: 0,
        totalSpent: 0,
        totalReceived: 0,
        totalGain: 0,
        totalRoyalties: 0,
        totalArtists: 0
    };
  
    let artists = new Set();
    let tokens = {};
    let artistData = {};
  
    data.forEach(item => {
        let obj = artistData[item.seller_address] || {
            artistAddress: item.seller_address,
            artistName: item.seller.alias,
            artistDomain: item.seller.tzdomain,
            tokensBought: 0,
            editionsBought: 0,
            spent: 0,
            saleValue: 0,
            PL: 0
        };
        
        obj.tokensBought += 1;
        obj.editionsBought += item.amount;
        obj.spent += item.price;
        obj.saleValue += item.token.listing_sales.reduce((acc, sale) => acc + sale.price, 0);
        obj.PL += obj.saleValue > 0 ? obj.saleValue - obj.spent : 0;
    
        stats.totalTokens += 1;
        stats.totalEditions += item.amount;
        stats.totalEditionsSold += item.token.listing_sales.length;
        stats.totalSpent += item.price;
        stats.totalReceived += obj.saleValue;
        if (obj.saleValue > 0) {
            stats.totalGain += obj.PL;
        }
        
        let royalties = item.token.royalties.reduce((acc, royalty) => acc + royalty.amount, 0);
        obj.royalties = obj.saleValue * royalties / 10 * 1 / 100;
        stats.totalRoyalties += obj.royalties;
    
        artists.add(obj.artistName || obj.artistAddress);
    
        if (tokens[item.token_pk]) {
            tokens[item.token_pk] += item.amount;
        } else {
            tokens[item.token_pk] = item.amount;
        }
  
        artistData[item.seller_address] = obj;
    });
  
    stats.totalArtists = artists.size;
    stats.totalTokens = Object.keys(tokens).length;
    stats.totalEditions = Object.values(tokens).reduce((a, b) => a + b, 0);
  
    let result = Object.values(artistData);
    result.sort((a, b) => b.spent - a.spent);
     
    result.push(stats);
    
    return {
       result
    }
}

function tratarPrices(item) {

    const metadata = tratarMetadataObjkt(item.token);
    const creator = item.token.creators[0]['creator_address'];
    const min_price = Math.min(...item.token.listings_active.map(listing => listing.price));
    const item_tag = item.token.tags[0]?.tag?.name || null;
    const marketplace = item.marketplace['name'];
    const supply = item.token['supply'];

    metadata['creator'] = creator;
    metadata['min_price'] = min_price;
    metadata['tag'] = item_tag;
    metadata['marketplace'] = marketplace;
    metadata['supply'] = supply;

    return metadata;
}

function user_infos(data) {
    const creator = data.creator;
    const infos = {
        first_mint: data.timestamp,
        address: creator.address,
        name: creator.alias,
        domain: creator.tzdomain,
        twitter: creator.twitter,
        website: creator.website,
        description: creator.description
    }
    return infos;
}
  

export { tratarMetadataObjkt, tratarDadosObjkt, tratarDadosLive, validateAdd, tratarDadosSell, tratarDadosBuy, tratarPrices, user_infos };