/**
 * Shell Volume Mixer
 *
 * Advanced mixer extension.
 *
 * @author Harry Karvonen <harry.karvonen@gmail.com>
 * @author Alexander Hofbauer <alex@derhofbauer.at>
 */

/* exported Button */

const Lang = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const St = imports.gi.St;


const Button = new Lang.Class({
    Name: 'ShellVolumeMixerButton',
    Extends: PanelMenu.Button,

    _init: function(mixer) {
        this.parent(0.0, 'ShellVolumeMixer');

        this.mixer = mixer;

        this._box = new St.BoxLayout();

        this._icon = new St.Icon({ style_class: 'system-status-icon' });
        this._bin = new St.Bin({ child: this._icon });

        this._stateIcon = new St.Icon({
            icon_name: 'audio-speakers-symbolic',
            style_class: 'system-status-icon'
        });

        this._box.add(this._bin);

        this.actor.add_actor(this._box);
        this.actor.add_style_class_name('panel-status-button');
        this.actor.connect('scroll-event', Lang.bind(this, this._onScrollEvent));

        this.mixer.connect('icon-changed', Lang.bind(this, this._onIconChanged));

        this.menu.actor.add_style_class_name('ShellVolumeMixer');
        this.menu.addMenuItem(this.mixer);

        this._onIconChanged();
    },

    _onScrollEvent: function (actor, event) {
        this.mixer.scroll(event);
    },

    _onIconChanged: function () {
        if (this.mixer.outputHasHeadphones()) {
            this.setIcon('audio-headphones-symbolic');
        } else {
            this.setIcon(this.mixer.getIcon());
        }
    },

    setIcon: function (icon_name) {
        this._icon.icon_name = icon_name;
    }
});