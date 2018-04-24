/*jslint browser: true*/
/*global $, steempay, config, navigation, window, document*/

//if device goes offline, show connection page
window.addEventListener('offline', function () {
    app.$data.route = 'connection';
});
//if device comes online, show connection page
window.addEventListener('online', function () {
    app.$data.route = 'home';
});
//add listener for NFC
document.addEventListener("deviceready", function () {
    steempay.nfc.checkNfc();
});

var app = new Vue({
  el: '#app',
  data: {
    route: 'home',
    account: `@${config.account}`,
    price: config.price,
    memo: 'memo'
  },
  methods: {
    purchase: function() {
      //generate random memo
      let memo = steempay.utils.randomMemo();
      this.memo = memo;
      //start listening for NFC
      steempay.nfc.startListening(function() {
        steempay.transaction.isWatching = true;
        let memo = app.$data.memo;
        //$(".memo").text(memo);
        //start looking for transaction
        console.log("account: " + config.account);
        console.log("price: " + config.price);
        console.log("memo: " + app.$data.memo);
        steempay.transaction.watch(config.account, config.price, memo, function() {
          //on success, show confirm page
          app.$data.route = 'confirmed';
          //after 10 seconds, show home page
          setTimeout(function () {
              app.$data.route = 'home';
          }, 10000);
        });
        console.log("you can now scan a tag");
      });
      //show NFC page after we start listening
      this.route = 'nfc';
    },
    cancel: function() {
      //stop looking for transaction
      steempay.nfc.stopListening();
      steempay.transaction.watchStop();
      this.route = 'home';
    },
    soon: function() {
      //temp function for coming soon sweetalert
      swal("Sorry", "Feature coming soon :(", "error");
    }
  },
  created() {
    //if device is offline, show connection page
    if (!navigator.onLine) {
        this.route = 'connection';
    }
    document.getElementById("status").innerHTML = 'processing payment...';
  }
})

//attach functions to buttons
// $(document).ready(function () {
//     $('#purchase').click(function () {
//         //start listening for NFC
//         steempay.nfc.startListening(function() {
//           steempay.transaction.isWatching = true;
//           //generate random memo
//           let memo = steempay.utils.randomMemo();
//           localStorage.setItem("memo", memo);
//           //show user the memo
//           $(".memo").text(memo);
//           //start looking for transaction
//           steempay.transaction.watch(config.account, config.price, memo, function() {
//             //on success, show confirm page
//             navigation.showPage("#confirm");
//             //after 10 seconds, show home page
//             setTimeout(function () {
//                 navigation.showPage("#home");
//             }, 10000);
//           });
//
//           navigation.showPage('#sale');
//           console.log("you can now scan a tag");
//         });
//     });
//
//     $('#cancel').click(function () {
//         //stop looking for transaction
//         steempay.transaction.watchStop();
//         navigation.showPage("#home");
//     });
// });
