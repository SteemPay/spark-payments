/*jslint browser: true*/
/*global $, navigator*/

var navigation = {
    showPage: function (page) {
        if (!$(page).hasClass("hidden")) {
            return true;
        }
        $(".hideable").addClass("hidden");
        $(page).removeClass("hidden");
    },
    notOnline: function (page) {
        if (!navigator.onLine) {
            this.showPage(page);
        }
    }
};