/*jslint browser: true*/
/*global steem*/

//set steem api server
steem.api.setOptions({url: 'https://api.steemit.com'});

//set steempay server
steempay.config.setApi('https://api.steempay.org');

//account and price
var config = {
    account: "kodaxx",
    price: "0.001 SBD"
};
