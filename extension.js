const St = imports.gi.St;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const TAG = "CryptoCurrencyPrices";
const BLOCKCHAIN_API_URL = "https://api.blockchain.info/stats";
const COINMARKETCAP_API_URL = "https://api.coinmarketcap.com/v1/ticker?limit=10";
const COINMARKETCAP_BTC_API_URL = "https://api.coinmarketcap.com/v1/ticker/bitcoin";
const COINMARKETCAP_ETH_API_URL = "https://api.coinmarketcap.com/v1/ticker/ethereum";
let bitcoinPriceValue = 0.0;
let ethereumPriceValue = 0.0;
let bitcoinPriceText = new St.Label({
  style_class: "price-label",
  text: "BTC: " + bitcoinPriceValue
});
let ethereumPriceText = new St.Label({
  style_class: "price-label",
  text: "ETH: " + ethereumPriceValue
});

function _refreshValues() {
    let dateTime = new GLib.DateTime();
    // text.set_text(dateTime.format("%H:%M:%S"));
    global.log(TAG + ": refreshing at: " + dateTime.format("%H:%M:%S"));

    // new http sesssion
    let _httpSession = new Soup.Session();
    let messageBTC = Soup.form_request_new_from_hash("GET", COINMARKETCAP_BTC_API_URL, {});
    let messageETH = Soup.form_request_new_from_hash("GET", COINMARKETCAP_ETH_API_URL, {});

    // execute the request and define the callback
    _httpSession.queue_message(messageBTC, Lang.bind(this, function(_httpSession, messageBTC) {
        if (messageBTC.status_code !== 200) {
            return;
        }
        let _json = JSON.parse(messageBTC.response_body.data);
        bitcoinPriceValue = Number(_json[0]["price_usd"]);
        global.log(TAG + "(BTC):" + bitcoinPriceValue);
        bitcoinPriceText.set_text("BTC: " + bitcoinPriceValue);
    }));
    // execute the request and define the callback
    _httpSession.queue_message(messageETH, Lang.bind(this, function(_httpSession, messageETH) {
        if (messageETH.status_code !== 200) {
            return;
        }
        let _json = JSON.parse(messageETH.response_body.data);
        ethereumPriceValue = Number(_json[0]["price_usd"]);
        global.log(TAG + "(ETH):" + ethereumPriceValue);
        ethereumPriceText.set_text("ETH: " + ethereumPriceValue);
    }));
}

function init() {
    button = new St.Bin({
      style_class: "panel-button",
      reactive: true,
      can_focus: true,
      x_fill: true,
      y_fill: false,
      track_hover: true
    });
    let icon = new St.Icon({
      icon_name: "system-run-symbolic",
      style_class: "system-status-icon"
    });

    button.set_child(icon);
    button.connect("button-press-event", _refreshValues);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(bitcoinPriceText, 0);
    Main.panel._rightBox.insert_child_at_index(ethereumPriceText, 0);
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(bitcoinPriceText);
    Main.panel._rightBox.remove_child(bitcoinPriceText);
    Main.panel._rightBox.remove_child(button);
}
