const Main = imports.ui.main;
const GLib = imports.gi.GLib;

var HOURS = [ "DODICI",
	"UNA",
	"DUE",
	"TRE",
	"QUATTRO",
	"CINQUE",
	"SEI",
	"SETTE",
	"OTTO",
	"NOVE",
	"DIECI",
	"UNDICI" ];
var FUZZY_RULES = [ "%s in PUNTO",
	"%s e CINQUE",
	"%s e DIECI",
	"%s e un QUARTO",
	"%s e VENTI",
	"%s e VENTICINQUE",
	"%s e MEZZA",
	"%s e VENTICINQUE",
	"%s meno VENTI",
	"%s meno un QUARTO",
	"%s meno DIECI",
	"%s meno CINQUE" ];

var clockLabel;
var signalID;
var defaultText;

function setText() {
	var now = GLib.DateTime.new_now_local();
	var hour = now.get_hour();
	var minute = now.get_minute();
	var rule = Math.floor((minute + 2) / 5); // Round minutes

	if (hour >= 12) // 0-23 to 0 to 11
		hour -= 12;

	if (rule > 6) // "To" the next hour
		hour += 1;

	if (hour == 12)
		hour = 0;

	if (rule == 12) // Use the OCLOCK rule
		rule = 0;

	var currentText = clockLabel.get_text();
	var desiredText = FUZZY_RULES[rule].format(HOURS[hour]);

	if (currentText != desiredText) {
		// Only set the text if it's changed to avoid loops
		defaultText = currentText; // defaultText from Shell
		clockLabel.set_text(desiredText);
	}
}

function enable() {
	var statusArea = Main.panel.statusArea;

	if (!statusArea || !statusArea.dateMenu || !statusArea.dateMenu.actor) {
		print("Looks like Shell has changed things again; aborting.");
		return;
	}

	statusArea.dateMenu.actor.first_child.get_children().forEach(function(actor) {
		// Assume that the text label is the first StLabel we find.
		// This is dodgy behaviour but there's no reliable way to
		// work out which it is.
		if (actor.get_text && !clockLabel)
			clockLabel = actor;
	});

	if (!clockLabel) {
		print("Looks like Shell has changed things again; aborting.");
		return;
	}

	defaultText = clockLabel.get_text();
	// on text changed signal, run setText funcation
	signalID = clockLabel.connect("notify::text", setText);

	setText(); // Don't wait for the first signal to change the text
}

function disable() {
	if (clockLabel && signalID) {
		// Stop reciving text changed signal
		clockLabel.disconnect(signalID);
		clockLabel.set_text(defaultText);
	}
}

