/*jslint browser: true*/
/*global steem*/

//set steem api server
steem.api.setOptions({url: 'https://api.steemit.com'});

//set steempay server
steempay.config.setApi('https://api.steempay.org');

//account
var config = {
    account: "kodaxx"
};
