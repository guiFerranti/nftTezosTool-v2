import { loadFx, loadObjkt } from '../api/api.js'

function tratarMetadataFx(data) {
    const metadata = {
        name: data.metadata['name'],
        artifact_uri: data.metadata['artifactUri'],
        display_uri: data.metadata['displayUri'],
        mime: data.captureMedia['mimeType'],
        token_id: data['onChainId'],
        contract: data['contract'] || null
    }
    return(metadata);
}

function tratarDadosFx(data) {
    const dados = {
        timestamp: data['createdAt'],
        price: data['price'],
        amount: data['amount'],
        amount_left: data['amount'],
        contract: null,
        status: 'active'
    }
    return dados;
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

async function sortTokens(address) {
    const tokens_objkt = await loadObjkt(address);
    const tokens_fx = await loadFx(address);
    const AllTokens = tokens_objkt.concat(tokens_fx);

    const sortedTokens = AllTokens.sort((a, b) => new Date(a.dados.timestamp) - new Date(b.dados.timestamp));
    sortedTokens.reverse()

    return sortedTokens;
}


export { tratarMetadataFx, tratarDadosFx, tratarMetadataObjkt, tratarDadosObjkt, sortTokens, tratarDadosLive };