var steempay = {
  config: {
    api: 'https://api.steempay.org',

    setApi: function(url) {
      if (url.endsWith('/')) {
        steempay.config.api = url.slice(0, -1);
      } else {
        steempay.config.api = url;
      }
    }
  },

  utils: {

    randomMemo: function(num = 7) {
      var text = "",
        possible = "abcdefghijkmnopqrstuvwxyz023456789", //remove 1 and L...look too much alike?
        length = num;
      for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    },

    validateAccountExists: function(user) {
      if (user === '') {
        return false;
      }
      return new Promise(resolve => {
        steempay.utils.ajax(`${steempay.config.api}/${user}`)
          .then(function(result) {
            resolve(result.unknown_user !== user);
          })
          .catch(function(e) {
            console.log(`error: ${e}`);
          });
      });
    },

    validateAccountName(value) {
      let i, label, len, suffix;

      suffix = "account name should ";
      if (!value) {
        return suffix + "not be empty";
      }
      const length = value.length;
      if (length < 3) {
        return suffix + "be longer";
      }
      if (length > 16) {
        return suffix + "be shorter";
      }
      if (/\./.test(value)) {
        suffix = "each account segment should ";
      }
      const ref = value.split(".");
      for (i = 0, len = ref.length; i < len; i++) {
        label = ref[i];
        if (!/^[a-z]/.test(label)) {
          return suffix + "start with a letter";
        }
        if (!/^[a-z0-9-]*$/.test(label)) {
          return suffix + "have only letters, digits, or dashes";
        }
        if (/--/.test(label)) {
          return suffix + "have only one dash in a row";
        }
        if (!/[a-z0-9]$/.test(label)) {
          return suffix + "end with a letter or digit";
        }
        if (!(label.length >= 3)) {
          return suffix + "be longer";
        }
      }
      return null;
    },

    ajax: function(url) {
      return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
          resolve(JSON.parse(this.responseText));
        };
        xhr.onerror = reject;
        xhr.open('GET', url);
        xhr.send();
      });
    }

  },

  account: {
    getUserInfo: function(user) {
      return new Promise(resolve => {
        steempay.utils.ajax(`${steempay.config.api}/${user}`)
          .then(function(result) {
            resolve({
              avatar: result.avatar,
              location: result.location,
              sbd_balance: result.balance_sbd,
              steem_balance: result.balance_steem
            });
          })
          .catch(function(e) {
            console.log(`error: ${e}`);
          });
      });
    },

    getUsdValues: function(user) {
      return new Promise(resolve => {
        steempay.utils.ajax(`${steempay.config.api}/${user}/value`)
          .then(function(result) {
            resolve({
              sbd_usd: result['steem-dollars'].price_usd.toFixed(2),
              steem_usd: result.steem.price_usd.toFixed(2)
            });
          })
          .catch(function(e) {
            console.log(`error: ${e}`);
          });
      });
    },

    getUserHistory: function(user) {
      return new Promise(resolve => {
        steempay.utils.ajax(`${steempay.config.api}/${user}/history`)
          .then(function(result) {
            resolve(result);
          })
          .catch(function(e) {
            console.log(`error: ${e}`);
          });
      });
    }
  },

  transaction: {

    isWatching: true,

    watch: function(account, amount, memo, callback) {
      if (steempay.transaction.isWatching) {
        window.setTimeout(async function() {
          var log = await steempay.account.getUserHistory(account);

          log.forEach(function(element) {
            if (parseFloat(element.amount) >= parseFloat(amount) && element.memo === memo) {
              steempay.transaction.watchStop();
              callback();
            }
          }, callback);

          steempay.transaction.watch(account, amount, memo, callback);

        }, 2500);
      }
    },

    watchStop: function() {
      steempay.transaction.isWatching = false;
    }

  },
};
