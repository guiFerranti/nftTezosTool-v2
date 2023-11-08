import axios from "axios";
import { resultadoParcial, tratarIpfs, bytes2Char, nftInfo, procurarMint } from "../utils/utils.js";

const step = 100;
const step_ = 30;

async function getNftInfo(lote) {
    let lista_obj = [];
    for (let ipfs of lote) {
        const response = await axios.get(ipfs.metadata);
        const resp = response.data;
        const name = resp.name;
        const description = resp.description;
        const creators = resp.creators;
        const image = tratarIpfs(resp.image || resp.displayUri);
        const totalSupply = ipfs.amount;
        const transfer_count = ipfs.transfer_count;
        const obj = resultadoParcial(name, description, image, creators, null, totalSupply, null, null, transfer_count);
        lista_obj.push(obj);
    }
    return lista_obj;
}


async function getAllMints(address) {
    let resultadoTotal = [];

    try {
        const response = await axios.get(`https://api.tzkt.io/v1/accounts/${address}/operations?entrypoint=mint&limit=1000&target.ni=KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton,KT18pVpRXKPY2c4U2yFEGSH3ZnhB2kL8kwXS`);
        for (let i = 0; i < response.data.length; i += step) {
            const lote = response.data.slice(i, i + step);
            const loteProcessado = procurarMint(lote);

            resultadoTotal.push(...loteProcessado);
        }
    } catch (e) {
        console.log(e);
    }

    let resultadoFinal = [];
    try {
        for (let i = 0; i < resultadoTotal.length; i += step_) {
            const lote = resultadoTotal.slice(i, i + step_);
            const resultado = await getNftInfo(lote);
            resultadoFinal.push(...resultado);
        }
    } catch (e) {
        console.log(e);
    }
    return resultadoFinal;
}


async function getAllSells(address) {
    let lista = []
    try {
        const response = await axios.get(`https://api.tzkt.io/v1/tokens/transfers?from=${address}&limit=1000`)
    
        for (let i = 0; i < response.data.length; i += step) {
            const lote = response.data.slice(i, i + step);
            const info = nftInfo(lote);

            lista.push(...info)
        }
        return lista;
    } catch (e) {
        console.log(e)
    }   
}

async function getAllTokens(address) {
    // only collected tokens (not created by the wallet)
    let lista = []

    try {
        const response = await axios.get(`https://api.tzkt.io/v1/tokens/balances?account=${address}&balance.gt=0&limit=1000&sort.desc=timestamp`);
        for (let i = 0; i < response.data.length; i += step) {
            const lote = response.data.slice(i, i + step);
            const info = await nftInfo(lote, address);
            lista.push(...info);
        }
        return lista;
    } catch (e) {
        console.log(e)
    }
}

async function getBurnedTokens(tokenId, address) {
    // most common burn address
    const burnAddress = 'tz1burnburnburnburnburnburnburjAYjjX'
    // tokenId = internal token id from tzkt
    let burned_balance = 0;
    let user_balance = 0;
    try {  
        const response = await axios.get(`https://api.tzkt.io/v1/tokens/balances?token.id=${tokenId}&account.in=${burnAddress},${address}`)

        if (response.data.length > 1) {
            for (let item of response.data) {
                if (item.account['address'] === burnAddress) {
                    burned_balance = item['balance'];
                } else if (item.account['address'] === address) {
                    user_balance = item['balance'];
                }
            } 
        } else if (response.data.length === 1) {
            if (response.data[0].account['address'] === burnAddress) {
                user_balance = 0;
                burned_balance = response.data[0]['balance'];

            } if (response.data[0].account['address'] === address) {
                user_balance = response.data[0]['balance']
                burned_balance = 0;
            }
        } else if (response.data.length === 0) {
            user_balance = 0;
            burned_balance = 0;
        }
    } catch (e) {
        console.log(e)
    }
    
    return [user_balance, burned_balance];
}

// async function getRoyalties(address) {
//     // 


// }

export { getAllMints, getAllSells, getAllTokens, getBurnedTokens };