/*jslint browser: true*/
/*global $, steempay, navigation, window, document*/

//if device goes offline, show connection page
window.addEventListener('offline', function() {
  app.$data.route = 'connection';
});
//if device comes online, show connection page
window.addEventListener('online', function() {
  app.$data.route = 'home';
});
//add listener for NFC
document.addEventListener("deviceready", function() {
  steempay.nfc.checkNfc();
});
//add listener for android back button
document.addEventListener("backbutton", onBackKeyDown, false);
//back key event handler
function onBackKeyDown(e) {
  e.preventDefault();
  app.cancel()
  app.$data.route = 'home';
}

var app = new Vue({
  el: '#app',
  data: {
    route: 'home',
    account: localStorage.getItem('account'),
    price: '',
    usd: '',
    memo: '',
    recent: ''
  },
  methods: {
    //clear usd price, steem price, and memo
    clear: function() {
      this.usd = '';
      this.price = '';
      this.memo = '';
    },
    //adds pressed key to amount display
    add: function(num) {
      this.usd = `${this.usd}${num}`;
    },
    //begins purchase
    purchase: async function() {
      //if amount is empty, notify merchant and stop function
      if (this.usd === '') {
        swal("Error!", "Price cannot be blank. Please enter an amount.", "error");
        return;
      }
      //generate random memo
      this.memo = steempay.utils.randomMemo();
      //get current price
      this.price = `${(parseFloat(this.usd) / parseFloat(await steempay.utils.getExchangeRate('steem'))).toFixed(3)} STEEM`;
      //start listening for NFC
      steempay.nfc.startListening(function() {
        steempay.transaction.isWatching = true;
        let memo = app.$data.memo;
        //start looking for transaction
        steempay.transaction.watch(app.$data.account, app.$data.price, memo, function() {
          //on success, show confirm page and clear form
          app.$data.route = 'confirmed';
          app.clear();
          //grab latest transactions
          this.recent = await steempay.account.getUserHistory(this.account);
          //after 10 seconds, show home page
          setTimeout(function() {
            app.$data.route = 'home';
          }, 10000);
        });
        console.log("you can now scan a tag");
      });
      //show NFC page after we start listening
      this.route = 'nfc';
    },
    cancel: function() {
      //stop listening to nfc
      steempay.nfc.stopListening();
      //stop looking for transaction
      steempay.transaction.watchStop();
      //clear prices, memo, and return home
      this.clear();
      this.route = 'home';
    },
    //saves input value to local storage and return home
    save: async function() {
      this.account = this.account.toLowerCase();
      localStorage.setItem('account', this.account.toLowerCase());
      this.recent = await steempay.account.getUserHistory(this.account);
      this.route = 'home';
    },
    //temp function for coming soon sweetalert
    soon: function() {
      swal("Sorry", "Feature coming soon :(", "error");
    }
  },
  //when vue instance is created (app is started), do these things
  async created() {
    //if device is offline, show connection page
    if (!navigator.onLine) {
      this.route = 'connection';
    }
    if (!localStorage.getItem('account')) {
      this.route = 'settings';
    }
    document.getElementById("status").innerHTML = 'processing payment...';
    this.recent = await steempay.account.getUserHistory(this.account);
  }
});
