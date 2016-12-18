const St = imports.gi.St;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const TAG = "CryptoCurrencyPrices";
const BLOCKCHAIN_API_URL = "https://api.blockchain.info/stats";
const COINMARKETCAP_API_URL = "https://api.coinmarketcap.com/v1/ticker?limit=10";
const COINMARKETCAP_BTC_API_URL = "https://api.coinmarketcap.com/v1/ticker/bitcoin";
const COINMARKETCAP_ETH_API_URL = "https://api.coinmarketcap.com/v1/ticker/ethereum";
const CURRENCY_IDS = ["bitcoin", "ethereum"]
let ccpMenu;
let _httpSession;

const CryptoCurrencyPricesIndicator = new Lang.Class({
	Name: "CryptoCurrencyPricesIndicator",
	Extends: PanelMenu.Button,

	_init: function() {
		this.parent(0.0, "Crypto Currency Prices Indicator", false);
		this.buttonText = new St.Label({
			text: _("Loading..."),
			y_align: Clutter.ActorAlign.CENTER
		});
		this.actor.add_actor(this.buttonText);
		this._refresh();
	},

	_refresh: function() {
		this._loadData();
		this._removeTimeout();
		this._timeout = Mainloop.timeout_add_seconds(60, Lang.bind(this, this._refresh));
		return true;
	},

	_loadData: function() {
		// let bitcoinPriceValue = 0.0;
		// let ethereumPriceValue = 0.0;
		// let bitcoinPriceText = new St.Label({
		// 	style_class: "price-label",
		// 	text: "BTC: " + bitcoinPriceValue
		// });
		// let ethereumPriceText = new St.Label({
		// 	style_class: "price-label",
		// 	text: "ETH: " + ethereumPriceValue
		// });
		_httpSession = new Soup.Session();

		let message = Soup.form_request_new_from_hash("GET", COINMARKETCAP_API_URL, {});
		//  let messageBTC = Soup.form_request_new_from_hash("GET", COINMARKETCAP_BTC_API_URL, {});
		//  let messageETH = Soup.form_request_new_from_hash("GET", COINMARKETCAP_ETH_API_URL, {});
		// execute the request and define the callback
		_httpSession.queue_message(message, Lang.bind(this, function(_httpSession, message) {
			if (message.status_code !== 200) {
				return;
			}
			let _json = JSON.parse(message.response_body.data);
			// global.log(TAG + "(BTC):" + bitcoinPriceValue);
			this._refreshUI(_json);
		}));

		//  // execute the request and define the callback
		//  _httpSession.queue_message(messageBTC, Lang.bind(this, function(_httpSession, messageBTC) {
		//    if (messageBTC.status_code !== 200) {
		//      return;
		//    }
		//    let _json = JSON.parse(messageBTC.response_body.data);
		//    bitcoinPriceValue = Number(_json[0]["price_usd"]);
		//    // global.log(TAG + "(BTC):" + bitcoinPriceValue);
		//    bitcoinPriceText.set_text("BTC: " + bitcoinPriceValue.toFixed(2));
		//  }));
		//  // execute the request and define the callback
		//  _httpSession.queue_message(messageETH, Lang.bind(this, function(_httpSession, messageETH) {
		//    if (messageETH.status_code !== 200) {
		//      return;
		//    }
		//    let _json = JSON.parse(messageETH.response_body.data);
		//    ethereumPriceValue = Number(_json[0]["price_usd"]);
		//    // global.log(TAG + "(ETH):" + ethereumPriceValue);
		//
		//  }));
	},

	_refreshUI: function(data) {
		let _text = "";
		for (let cnt = 0; cnt < CURRENCY_IDS.length; cnt++) {
			let _data = data.filter(function(el) {
				return el["id"] === CURRENCY_IDS[cnt];
			})[0];
			// global.log(TAG + "->fetched price->" + _data["symbol"] + ": " + _data["price_usd"]);
			_text += (_data["symbol"] + ": " + Number(_data["price_usd"]).toFixed(2) + " ")
		}
		// CURRENCY_IDS.forEach(function(id) {
		// 	let _data = data.filter(function(el) {
		// 		return el["id"] === id;
		// 	})[0];
		// 	// global.log(TAG + "->fetched price->" + _data["symbol"] + ": " + _data["price_usd"]);
		// 	_text += (_data["symbol"] + ": " + _data["price_usd"])
		// });
		this.buttonText.set_text(_text);
	},

	_refreshValues: function() {
		if (this._timeout) {
			Mainloop.source_remove(this._timeout);
			this._timeout = null;
		}
		let dateTime = new GLib.DateTime();
		// text.set_text(dateTime.format("%H:%M:%S"));
		global.log(TAG + ": refreshing at: " + dateTime.format("%H:%M:%S"));


		// the refresh function will be called every 10 sec.
		this._timeout = Mainloop.timeout_add_seconds(60, Lang.bind(this, this._refresh));
	},
	_removeTimeout: function() {
		if (this._timeout) {
			Mainloop.source_remove(this._timeout);
			this._timeout = null;
		}
	},
	_stop: function() {
		if (_httpSession !== undefined)
			_httpSession.abort();
		_httpSession = undefined;

		if (this._timeout)
			Mainloop.source_remove(this._timeout);
		this._timeout = undefined;

		this.menu.removeAll();
	}
});

function init() {
	// button = new St.Bin({
	// 	style_class: "panel-button",
	// 	reactive: true,
	// 	can_focus: true,
	// 	x_fill: true,
	// 	y_fill: false,
	// 	track_hover: true
	// });
	// let icon = new St.Icon({
	// 	icon_name: "system-run-symbolic",
	// 	style_class: "system-status-icon"
	// });
	//
	// button.set_child(icon);
	// button.connect("button-press-event", _refreshValues);
}

function enable() {
	// Main.panel._rightBox.insert_child_at_index(bitcoinPriceText, 0);
	// Main.panel._rightBox.insert_child_at_index(ethereumPriceText, 0);
	// Main.panel._rightBox.insert_child_at_index(button, 0);
	ccpMenu = new CryptoCurrencyPricesIndicator();
	Main.panel.addToStatusArea("ccp-indicator", ccpMenu);
}

function disable() {
	// Main.panel._rightBox.remove_child(bitcoinPriceText);
	// Main.panel._rightBox.remove_child(bitcoinPriceText);
	// Main.panel._rightBox.remove_child(button);
	ccpMenu._stop();
	ccpMenu.destroy();
}
