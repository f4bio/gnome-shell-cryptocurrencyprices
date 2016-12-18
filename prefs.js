// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-

const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const Gettext = imports.gettext.domain("gnome-shell-extensions");
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const PREFS_SCHEMA = "org.gnome.shell.extensions.cryptocurrencyprices";
const TAG = "CryptoCurrencyPrices(Prefs)";

function init() {
	Convenience.initTranslations();
}

const ExamplePrefsWidget = new GObject.Class({
	Name: "Example.Prefs.Widget",
	GTypeName: "ExamplePrefsWidget",
	Extends: Gtk.Grid,

	_init: function(params) {
		this.parent(params);
		this.margin = 12;
		this.column_spacing = 6;
		this.set_orientation(Gtk.Orientation.VERTICAL);

		this._settings = Convenience.getSettings(PREFS_SCHEMA);
		let _ids = this._settings.get_strv("currency-ids");
		let _labels = this._settings.get_strv("currency-labels");
		let _enableds = this._settings.get_strv("currency-enableds");

		let _switches = [_ids.length];

		for (let cnt = 0; cnt < _ids.length; cnt++) {
			_switches[cnt] = new Gtk.Switch({
				active: (_enableds[cnt] === "true"),
				halign: Gtk.Align.END
			});
			global.log(TAG+": "+JSON.stringify(_switches[cnt]));
			_switches[cnt].connect("notify::active", Lang.bind(this, function(switcher) {
				global.log(TAG+": "+JSON.stringify(_enableds));
				_enableds[cnt] = ""+switcher.get_active();
				this._settings.set_strv("currency-enableds", _enableds);
			}));
			this.attach(_switches[cnt], 1, cnt, 1, 1);
			this.attach_next_to(new Gtk.Label({
				label: "<b>" + _labels[cnt] + "</b>",
				use_markup: true,
				halign: Gtk.Align.START
			}), _switches[cnt], Gtk.PositionType.LEFT, 1, 1);
		}

		// this._settings.bind("currency-bitcoin-enabled",
		// 	bitcoinEnabled, "active", Gio.SettingsBindFlags.DEFAULT);
		// this._settings.bind("currency-ethereum-enabled",
		// 	ethereumEnabled, "active", Gio.SettingsBindFlags.DEFAULT);
	}
});

function buildPrefsWidget() {
	let widget = new ExamplePrefsWidget();
	widget.show_all();

	return widget;
}
