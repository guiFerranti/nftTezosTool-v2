function userData(data) {

    const userData = {
        wallet: data['address'],
        twitter: data['twitter'],
        name: data['alias'],
        website: data['website'],
        domain: data['tzdomain']
    }
    return userData;
}

function PL(data) {
    const pl = {
        total_received: data['total_received'],
        total_sent: data['total_sent'],
        pl: data['total_received'] - data['total_sent']
    }
    return pl;
}

function firstLastMint(first, last) {
    const mints = {
        firstMint : {
            timestamp: first['timestamp'],
            contract: first['fa_contract'],
            token_id: first['token_id']
        },
        lastMint : {
            timestamp: last['timestamp'],
            contract: last['fa_contract'],
            token_id: last['token_id']
        }
    }
    return mints;
}
//tz2KbXVAfzDw8JX3WVTPjgePrqtPYQiUmyc4
//

function tokensCount(data) {
    let edition = 0;
    const totalToken = data.length;
    for(let k of data) {   
        edition += parseInt(k['balance']);
    }

    return {token: totalToken, edition: edition};
}
//tokens length
//first mint last
// ed ??

export { PL, userData, firstLastMint, tokensCount };