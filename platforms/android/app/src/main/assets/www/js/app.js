/*jslint browser: true*/
/*global $, steempay, config, navigation, window, document*/

//if device does not have internet access, show connection page
navigation.notOnline("#connection");
//if device goes offline, show connection page
window.addEventListener('offline', function () {
    navigation.showPage("#connection");
});
//if device comes online, show connection page
window.addEventListener('online', function () {
    navigation.showPage("#home");
});
//add listener for NFC
document.addEventListener("deviceready", function () {
    steempay.checkNfc();
});

//attach functions to buttons
$(document).ready(function () {
    $('#purchase').click(function () {
        steempay.isActive = true;
        steempay.startListening();
    });

    $('#cancel').click(function () {
        //stop looking for transaction
        steempay.stopPolling();
        navigation.showPage("#home");
    });
    //attach config to gui elements
    $(".account").text("@" + config.account);
    $(".price").text(config.price);
});