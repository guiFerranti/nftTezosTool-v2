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
      totalRoyalties: 0
  };
  
  let result = data.map(item => {
      let obj = {};
      obj.artistAddress = item.seller_address;
      obj.artistName = item.seller.alias;
      obj.artistDomain = item.seller.tzdomain;
      obj.tokensBought = 1;
      obj.editionsBought = item.amount;
      obj.spent = item.price;
      obj.saleValue = item.token.listing_sales.reduce((acc, sale) => acc + sale.price, 0);
      obj.PL = obj.saleValue > 0 ? obj.saleValue - obj.spent : 0;
  
      stats.totalTokens += obj.tokensBought;
      stats.totalEditions += obj.editionsBought;
      stats.totalEditionsSold += item.token.listing_sales.length;
      stats.totalSpent += obj.spent;
      stats.totalReceived += obj.saleValue;
      if (obj.saleValue > 0) {
          stats.totalGain += obj.PL;
      }
      stats.totalRoyalties += item.token.royalties.reduce((acc, royalty) => acc + royalty.amount, 0);
  
      return obj;
  });

  result.sort((a, b) => b.spent - a.spent);
  
  result.push({stats: stats});
  
  return {
     bought: result
  }
}


export { tratarMetadataObjkt, tratarDadosObjkt, tratarDadosLive, validateAdd, tratarDadosSell, tratarDadosBuy };