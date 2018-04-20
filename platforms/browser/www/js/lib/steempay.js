/*jslint browser: true*/
/*global $, console, XMLHttpRequest, window, navigation, setTimeout*/

var steempay = {
    randMemo: function () {
        var text = "",
            possible = "abcdefghijkmnopqrstuvwxyz023456789", //remove 1 and L...look too much alike?
            length = 7;
        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    },
    isActive: true,
    startPolling: function (account, amount, memo) {
        if (steempay.isActive) {
            console.log("looking for transaction...");
            window.setTimeout(function () {
                $.ajax({
                    url: "https://api.steemjs.com/get_account_history?account=" + account + "&from=-1&limit=100",
                    type: "GET",
                    success: function (result) {
                        //SUCCESS LOGIC
                        var log = result.reverse();

                        log.forEach(function (element) {
                            if (element[1].op[0] === "transfer" &&
                                parseFloat(element[1].op[1].amount) >= parseFloat(amount) &&
                                element[1].op[1].memo === memo) {
                                console.log("transaction found");
                                console.log(element);
                                navigation.showPage("#confirm");
                                setTimeout(function () {
                                    navigation.showPage("#home");
                                }, 10000);
                                steempay.isActive = false;
                            }
                        });

                        steempay.startPolling(account, amount, memo);
                    },
                    error: function () {
                        //ERROR HANDLING
                        console.log("error");
                        steempay.startPolling(account, amount, memo);
                    }
                });
            }, 2500);
        } else {
            console.log("stopped looking...");
        }
    },
    stopPolling: function () {
        steempay.isActive = false;
    },
    checkNfc: function () {
        nfc.enabled(
            function () {
                console.log("nfc is enabled")
            },
            function (reason) {
                if (reason === "NFC_DISABLED") {
                    alert("Please enable NFC on this device.");
                    nfc.showSettings(
                        function () {
                            console.log("showing settings");
                        },
                        function (msg) {
                            alert("Please enable NFC on this device. Error: " + msg);
                        }
                    );
                } else {
                    alert("NFC is not available on this device.");
                }
            }
        );
    },
    isListening: false,
    nfcHandler: async function (record) {
        //check card type
        if (nfc.bytesToString(record.tag.ndefMessage[0].type) === "steempay/account") {
            //if card type matches, get pin
            var pin = prompt("Pin?");
            //get account and key from card, decrypt key with pin
            var acc = nfc.bytesToString(record.tag.ndefMessage[0].payload),
                key = CryptoJS.AES.decrypt(nfc.bytesToString(record.tag.ndefMessage[1].payload), pin).toString(CryptoJS.enc.Utf8),
                memo = localStorage.getItem("memo");
            //verify that decrypted key converted to pub matches public key
            if (await verify(acc, key)) {
                navigation.showPage("#loader");
                steem.broadcast.transfer(key, acc, config.account, config.price, memo, function (err, result) {
                    console.log(err, result);
                });
                steempay.stopListening();
                //wrong pin or invalid account
            } else {
                alert("Account does not exist or invalid pin");
                console.log("account does not exist or invalid pin");
                //steempay.stopListening();
            }
            //if card type does not match, they did not scan steempay wallet
        } else {
            alert("Please scan a SteemPay Wallet Card");
            console.log("please scan a steempay wallet card");
            //steempay.stopListening();
        }
    },
    startListening: function () {
        if (steempay.isListening) {
            console.log("already listening");
            navigation.showPage("#sale");
        } else {
            steempay.isListening = true;
            nfc.addNdefListener(
                steempay.nfcHandler,
                function () { // success callback
                    steempay.isActive = true;
                    //generate random memo
                    var memo = steempay.randMemo();
                    localStorage.setItem("memo", memo);
                    //show user memo
                    $(".memo").text(memo);
                    //start looking for transaction
                    steempay.startPolling(config.account, config.price, memo);
                    navigation.showPage('#sale');
                    console.log("you can now scan a tag");
                },
                function (error) { // error callback
                    console.log("error: " + JSON.stringify(error));
                }
            );
        }
    },
    stopListening: function () {
        if (!steempay.isListening) {
            console.log("wasn't listening");
        } else {
            steempay.isListening = false;
            nfc.removeNdefListener(
                steempay.nfcHandler,
                function () { // success callback
                    console.log("stopped listening");
                },
                function (error) { // error callback
                    console.log("error: " + +JSON.stringify(error));
                }
            );
        }
    }
};