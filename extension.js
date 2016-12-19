const St = imports.gi.St;
const Mainloop = imports.mainloop;

const Gettext = imports.gettext.domain("gnome-shell-extensions");
const _ = Gettext.gettext;

const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
const Soup = imports.gi.Soup;
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const TAG = "CryptoCurrencyPrices";
const PREFS_SCHEMA = "org.gnome.shell.extensions.cryptocurrencyprices";
const TEXT_PATTERN = "%s: %.2f";
const BLOCKCHAIN_API_URL = "https://api.blockchain.info/stats";
const COINMARKETCAP_API_URL = "https://api.coinmarketcap.com/v1/ticker/%s";
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
		this._settings = Convenience.getSettings(PREFS_SCHEMA);
		this._ids = this._settings.get_strv("currency-ids");
		this._enableds = this._settings.get_strv("currency-enableds");
		this._data = {};
		this._text = "";
		this._refresh();
	},

	_refresh: function() {
		this._loadData();
		this._removeTimeout();
		this._timeout = Mainloop.timeout_add_seconds(60, Lang.bind(this, this._refresh));
		return true;
	},

	_loadData: function() {
		_httpSession = new Soup.Session();
		this._text = "";
		this._ids = this._settings.get_strv("currency-ids");
		this._enableds = this._settings.get_strv("currency-enableds");

		for (let cnt = 0; cnt < this._ids.length; cnt++) {
			// if((this._enableds[cnt] === "false")) {
			// 	continue;
			// }
			let message = Soup.form_request_new_from_hash(
				"GET", COINMARKETCAP_API_URL.format(this._ids[cnt]), {});

			_httpSession.queue_message(message,
				Lang.bind(this, function(_httpSession, message) {
					if (message.status_code !== 200) {
						return;
					}
					let _json = JSON.parse(message.response_body.data);
					// this._refreshUI(_json);
					global.log(TAG + " fetched: " + JSON.stringify(_json));
					this._refreshUI(_json[0]);
				}));
		}
	},

	_refreshUI: function(data) {
		global.log(TAG + " adding text: " + JSON.stringify(data));
		if (this._text !== "") {
			this._text += " | "
		}
		this._text += TEXT_PATTERN.format(data["symbol"], Number(data["price_usd"]));
		this.buttonText.set_text(this._text);
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

function init() {}

function enable() {
	ccpMenu = new CryptoCurrencyPricesIndicator();
	Main.panel.addToStatusArea("ccp-indicator", ccpMenu);
}

function disable() {
	ccpMenu._stop();
	ccpMenu.destroy();
}
