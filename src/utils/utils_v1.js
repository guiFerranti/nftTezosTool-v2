import { validateAddress } from '@taquito/utils';

function validateAdd(address) {
    const validation = validateAddress(address);
    return validation;
}

function resultadoParcial(name, description, image, creators, balance=null, totalSupply=null, contrato=null, token_id=null, transfer_count=null) {

        const obj = {
            name: name,
            description: description,
            image: image,
            creators: creators,
            contrato: contrato,
            token_id: token_id
        };
        obj.balance = balance;
        obj.totalSupply = totalSupply;
        obj.transfer_count= transfer_count;
        if (obj.balance == null) delete obj.balance;
        if (obj.totalSupply == null) delete obj.totalSupply;
        if (obj.contrato == null) delete obj.contrato;
        if (obj.token_id == null) delete obj.token_id;
        if (obj.transfer_count == null) delete obj.transfer_count;

        return obj;
}

async function nftInfo(lote, address=null) {
    let lista = [];
    for (let item of lote) {
        try {
            const data = item.token.metadata;
            const name = data.name;
            const description = data.description;
            const image = tratarIpfs(data.image || data.displayUri || data.artifactUri);
            const creators = data.creators;
            const contract = item.token.contract['address']
            const token_id = item.token['tokenId']
    
            if (data.creators) {
                if (item['balance'] > 0 && data.creators.indexOf (address) === -1) {
                    const totalSupply = item.token['totalSupply'];
                    const balance = item['balance'];
                    const obj = resultadoParcial(name, description, image, creators, balance, totalSupply, contract, token_id);
                    lista.push(obj)
                } else if (address === null) {
                    const obj = resultadoParcial(name, description, image, creators, null, null,contract, token_id);
                    lista.push(obj)
                }
            }
        } catch (e) {
            console.log('erro in nftInfo')
            console.log(e)
        }
    }
    return lista;
}

function procurarMint(lote) {
    return lote
      .filter(k => k.parameter?.entrypoint === 'mint' && k.type === 'transaction' && k.parameter.value.metadata)
      .map(k => ({
        metadata: tratarIpfs(bytes2Char(k.parameter.value.metadata[''])),
        amount: k.parameter.value.amount,
        transfer_count: k['tokenTransfersCount']
      }));
}

const hex2buf = (hex) => {
    return new Uint8Array(
        hex.match(/[0-9a-f]{2}/gi).map((h) => parseInt(h, 16))
    );
};

function bytes2Char(hex) {
    return Buffer.from(hex2buf(hex)).toString("utf8");
}

function tratarIpfs(ipfs) {
    try {
        const link = 'https://ipfs.io/ipfs/' + ipfs.slice(7);
        return link;
    } catch (e) {
        console.log( 'deu erro aqui'+ e)
    }
}

export { resultadoParcial, hex2buf, bytes2Char, tratarIpfs, nftInfo, procurarMint, validateAdd };
