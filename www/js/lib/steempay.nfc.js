/*jslint browser: true*/
/*global console, window, navigation, setTimeout*/

steempay.nfc = {
  //Check if NFC is available or disabled on the device - todo: pass in custom handlers
  checkNfc: function() {
    nfc.enabled(
      function() {
        console.log("nfc is enabled");
      },
      function(reason) {
        if (reason === "NFC_DISABLED") {
          swal("Error!", "Please enable NFC on this device", "error");
          //show NFC settings dialog
          nfc.showSettings(
            function() {
              console.log("showing settings");
            },
            function(msg) {
              swal("Error!", msg, "error");
            }
          );
        } else {
          swal("Error!", "NFC is not available on this device.", "error");
        }
      }
    );
  },
  //Toggle to start/stop listening for NFC Tags - default: false;
  isListening: false,
  //Start listening for NFC Tags
  startListening: function(successCallback) {
    if (steempay.nfc.isListening) {
      console.log("already listening");
      app.$data.route = 'nfc'; //todo: change this specific code out
    } else {
      steempay.nfc.isListening = true;
      nfc.addNdefListener(
        steempay.nfc.nfcHandler,
        successCallback(),
        function(error) { // error callback
          console.log("error: " + JSON.stringify(error));
        }
      );
    }
  },
  //Stop listening for NFC Tags
  stopListening: function() {
    if (!steempay.nfc.isListening) {
      console.log("wasn't listening");
    } else {
      steempay.isListening = false;
      nfc.removeNdefListener(
        steempay.nfc.nfcHandler,
        function() { // success callback
          console.log("stopped listening");
        },
        function(error) { // error callback
          console.log("error: " + +JSON.stringify(error));
        }
      );
    }
  },
  //NFC Handler function
  nfcHandler: async function(record) {
    //check card type
    if (nfc.bytesToString(record.tag.ndefMessage[0].type) === "steempay/account") {
      //if card type matches, get pin
      var pin = prompt("Pin?");
      //get account and key from card, decrypt key with pin
      var acc = nfc.bytesToString(record.tag.ndefMessage[0].payload),
        key = CryptoJS.AES.decrypt(nfc.bytesToString(record.tag.ndefMessage[1].payload), pin).toString(CryptoJS.enc.Utf8),
        memo = app.$data.memo;
      //verify that decrypted key converted to pub matches public key
      if (await verify(acc, key)) {
        app.$data.route = 'loader';; //todo: put this specific code somewhere else
        steem.broadcast.transfer(key, acc, config.account, config.price, memo, function(err, result) {
          console.log(err, result);
        });
        steempay.nfc.stopListening();
        //wrong pin or invalid account
      } else {
        swal("Error!", "Account does not exist or invalid pin", "error");
        console.log("account does not exist or invalid pin");
        //steempay.stopListening();
      }
      //if card type does not match, they did not scan steempay wallet
    } else {
      swal("Error!", "Please scan a SteemPay Wallet Card", "error");
      console.log("please scan a steempay wallet card");
      //steempay.stopListening();
    }
  }
}
