/**
 * Shell Volume Mixer
 *
 * Advanced mixer extension.
 *
 * @author Harry Karvonen <harry.karvonen@gmail.com>
 * @author Alexander Hofbauer <alex@derhofbauer.at>
 */

/* exported init,buildPrefsWidget */

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Gettext = imports.gettext.domain('gnome-shell-extensions-shell-volume-mixer');
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const _ = Gettext.gettext;

const Settings = Extension.imports.settings;

let prefs;

function init() {
    prefs = {
        position: {
            type: 'e',
            label: _('Position of volume mixer'),
            list: [
                {nick: 'aggregateMenu', name: _('Status Menu'), id: 0},
                {nick: 'left', name: _('Left'), id: 1},
                {nick: 'center', name: _('Center'), id: 2},
                {nick: 'right', name: _('Right'), id: 3}
            ],
            onChange: function(value) {
                let checkbox = prefs.remove_original.hbox;

                if (!checkbox) {
                    return;
                }

                if (value === 0) {
                    checkbox.set_sensitive(false);
                } else {
                    checkbox.set_sensitive(true);
                }
            }
        },
        remove_original: {
            type: 'b',
            label: _('Remove original slider'),
            sensitive: function() {
                return Settings.gsettings().get_enum('position') !== 0;
            }
        },
        output_type: {
            type: 'e',
            label: _('Type of output slider'),
            list: [
                {nick: 'default', name: _('Default'), id: 0},
                {nick: 'advItem', name: _('AdvItem'), id: 1}
            ]
        }
    };
}

function buildPrefsWidget() {
    let frame = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        border_width: 10
    });
    let vbox = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        margin: 20, margin_top: 10
    });
    let hbox;

    for (let pref in prefs) {
        hbox = buildHbox(prefs, pref);
        prefs[pref].hbox = hbox;
        vbox.add(hbox);
    }

    frame.add(vbox);
    frame.show_all();

    return frame;
}

function buildHbox(prefs, name) {
    let hbox;
    let pref = prefs[name];

    if (pref.type == 'b') {
        hbox = createBoolSetting(pref, name);
    } else if (pref.type == 'e') {
        hbox = createEnumSetting(pref, name);
    }

    return hbox;
}


function createEnumSetting(pref, name) {
    let key = name.replace('_', '-');

    let hbox = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        margin_top: 5
    });

    let setting_label = new Gtk.Label({
        label: pref.label,
        xalign: 0
    });

    let model = new Gtk.ListStore();
    model.set_column_types([GObject.TYPE_INT, GObject.TYPE_STRING]);
    let setting_enum = new Gtk.ComboBox({ model: model });
    setting_enum.get_style_context().add_class(Gtk.STYLE_CLASS_RAISED);
    let renderer = new Gtk.CellRendererText();
    setting_enum.pack_start(renderer, true);
    setting_enum.add_attribute(renderer, 'text', 1);

    for (let i = 0; i < pref.list.length; i++) {
        let item = pref.list[i];
        let iter = model.append();
        model.set(iter, [0, 1], [item.id, item.name]);
        if (item.id == Settings.gsettings().get_enum(key)) {
            setting_enum.set_active(item.id);
        }
    }

    setting_enum.connect('changed', function() {
        let [success, iter] = setting_enum.get_active_iter();
        if (!success) {
            return;
        }

        let id = model.get_value(iter, 0);

        Settings.gsettings().set_enum(key, id);

        if (typeof pref.onChange == 'function') {
            pref.onChange(id, pref, name);
        }
    });

    if (pref.help) {
        setting_label.set_tooltip_text(pref.help);
        setting_enum.set_tooltip_text(pref.help);
    }

    hbox.pack_start(setting_label, true, true, 0);
    hbox.add(setting_enum);

    return hbox;
}

function createBoolSetting(pref, name) {
    let key = name.replace('_', '-');

    let sensitive = true;
    if (typeof pref.sensitive == 'function') {
        sensitive = pref.sensitive();
    }

    let hbox = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        margin_top: 5,
        sensitive: sensitive
    });

    let setting_label = new Gtk.Label({
        label: pref.label,
        xalign: 0
    });

    let setting_switch = new Gtk.Switch({
        active: Settings.gsettings().get_boolean(key)
    });

    setting_switch.connect('notify::active', function(button) {
        Settings.gsettings().set_boolean(key, button.active);
    });

    if (pref.help) {
        setting_label.set_tooltip_text(pref.help);
        setting_switch.set_tooltip_text(pref.help);
    }

    hbox.pack_start(setting_label, true, true, 0);
    hbox.add(setting_switch);

    return hbox;
}