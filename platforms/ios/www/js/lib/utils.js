function checkFormat(account, key) {
    var correct = false,
        isValid = steem.utils.validateAccountName(account);
    return (isValid === null);
}

function checkExist(account) {
    var exist;
    return new Promise(function (resolve, reject) {
        steem.api.lookupAccountNames([account], function (err, result) {
            if (err) {
                console.log("error: " + err);
            }
            if (result[0] !== null) {
                exist = true;
            } else {
                exist = false;
            }
            resolve(exist);
        })
    });
}

function keyMatch(account, key) {
    var match;
    return new Promise(function (resolve, reject) {
        steem.api.getAccounts([account], function (err, response) {
            //get active pubkey to check against key that is generated below
            if (err) {
                match = false;
                console.log("error: " + err);
            } else {
                var activePub = response[0].active.key_auths[0][0];
                //check if generated key is the same as known key for account
                if (steem.auth.wifIsValid(key, activePub)) {
                    //keys match - correct username/password combo
                    match = true;
                } else {
                    //keys do not match - incorrect username/password combo
                    match = false;
                }
            }
            resolve(match);
        })
    });
}

async function verify(account, key) {
    if (checkFormat(account)) {
        if (await checkExist(account)) {
            if (await keyMatch(account, key)) {
                return true;
            }
        }
    } else {
        return false;
    }
}