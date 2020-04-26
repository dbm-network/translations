module.exports = {

//---------------------------------------------------------------------
// Action Name
//
// This is the name of the action displayed in the editor.
//---------------------------------------------------------------------

name: "Wyślij wiadomość",

//---------------------------------------------------------------------
// Action Section
//
// This is the section the action will fall into.
//---------------------------------------------------------------------

section: "Wiadomości",

// Who made the mod (If not set, defaults to "DBM Mods")
author: "DBM, Lasse & NetLuis",

// The version of the mod (Defaults to 1.0.0)
version: "1.9.4", //Added in 1.9.4

// A short description to show on the mod line for this mod (Must be on a single line)
short_description: "Added If Message Delivery Fails option.",

//---------------------------------------------------------------------
// Action Subtitle
//
// This function generates the subtitle displayed next to the name.
//---------------------------------------------------------------------

subtitle: function(data) {
	const channels = ['Ten sam kanał', 'Autor komendy', 'Wspomniany członek', 'Wspomniany kanał', 'Domyślny kanał', 'Zmienna tymczasowa', 'Zmienna serwerowa', 'Zmienna globalna'];
	return `${channels[parseInt(data.channel)]}: "${data.message.replace(/[\n\r]+/, '')}"`;
},

//---------------------------------------------------------------------
// Action Storage Function
//
// Stores the relevant variable info for the editor.
//---------------------------------------------------------------------

variableStorage: function(data, varType) {
	const type = parseInt(data.storage);
	if(type !== varType) return;
	return ([data.varName2, 'Message']);
},

//---------------------------------------------------------------------
// Action Fields
//
// These are the fields for the action. These fields are customized
// by creating elements with corresponding IDs in the HTML. These
// are also the names of the fields stored in the action's JSON data.
//---------------------------------------------------------------------

fields: ["channel", "varName", "message", "storage", "varName2", "iffalse", "iffalseVal"],

//---------------------------------------------------------------------
// Command HTML
//
// This function returns a string containing the HTML used for
// editting actions. 
//
// The "isEvent" parameter will be true if this action is being used
// for an event. Due to their nature, events lack certain information, 
// so edit the HTML to reflect this.
//
// The "data" parameter stores constants for select elements to use. 
// Each is an array: index 0 for commands, index 1 for events.
// The names are: sendTargets, members, roles, channels, 
//                messages, servers, variables
//---------------------------------------------------------------------

html: function(isEvent, data) {
	return `
	<div style="width: 550px; height: 350px; overflow-y: scroll;">
	<div><p>Akcja została zmodyfikowna przez DBM Mods.</p></div><br>
<div>
	<div style="float: left; width: 35%;">
		Wyślij do:<br>
		<select id="channel" class="round" onchange="glob.sendTargetChange(this, 'varNameContainer')">
			${data.sendTargets[isEvent ? 1 : 0]}
		</select>
	</div>
	<div id="varNameContainer" style="display: none; float: right; width: 60%;">
		Nazwa zmiennej:<br>
		<input id="varName" class="round" type="text" list="variableList"><br>
	</div>
</div><br><br><br>
<div style="padding-top: 8px;">
	Wiadomość:<br>
	<textarea id="message" rows="9" placeholder="Wpisz tutaj wiadomość..." style="width: 99%; font-family: monospace; white-space: nowrap; resize: none;"></textarea>
</div><br>
<div>
	<div style="float: left; width: 35%;">
		Przechowuj zmienną jako:<br>
		<select id="storage" class="round" onchange="glob.variableChange(this, 'varNameContainer2')">
			${data.variables[0]}
		</select>
	</div>
	<div id="varNameContainer2" style="display: none; float: right; width: 60%;">
		Nazwa zmiennej:<br>
		<input id="varName2" class="round" type="text">
	</div>
</div><br><br><br>
<div style="padding-top: 8px;">
        <div style="float: left; width: 35%;">
            Jeśli dostarczenie wiadomości nie powiedzie się:<br>
            <select id="iffalse" class="round" onchange="glob.onChangeFalse(this)">
				<option value="0" selected>Kontynuuj akcję</option>
				<option value="1">Zatrzymaj sekwencję działania</option>
				<option value="2">Skocz do akcji</option>
				<option value="3">Pomiń następne akcje</option>
		 </select>
		</div>
		<div id="iffalseContainer" style="display: none; float: right; width: 60%;"><span id="iffalseName">Action Number</span>:<br><input id="iffalseVal" class="round" type="text"></div>`;
},

//---------------------------------------------------------------------
// Action Editor Init Code
//
// When the HTML is first applied to the action editor, this code
// is also run. This helps add modifications or setup reactionary
// functions for the DOM elements.
//---------------------------------------------------------------------

init: function() {
	const {glob, document} = this;

	glob.sendTargetChange(document.getElementById('channel'), 'varNameContainer');
	glob.variableChange(document.getElementById('storage'), 'varNameContainer2');
	glob.onChangeFalse(document.getElementById('iffalse'));
},

//---------------------------------------------------------------------
// Action Bot Function
//
// This is the function for the action within the Bot's Action class.
// Keep in mind event calls won't have access to the "msg" parameter, 
// so be sure to provide checks for variable existance.
//---------------------------------------------------------------------

action: function(cache) {
	const data = cache.actions[cache.index];
	const server = cache.server;
	const msg = cache.msg;
	const channel = parseInt(data.channel);
	const message = data.message;
	if(channel === undefined || message === undefined) return;
	const varName = this.evalMessage(data.varName, cache);
	const target = this.getSendTarget(channel, varName, cache);
	if(Array.isArray(target)) {
		this.callListFunc(target, 'send', [this.evalMessage(message, cache)]).then(function(resultMsg) {
			const varName2 = this.evalMessage(data.varName2, cache);
			const storage = parseInt(data.storage);
			this.storeValue(resultMsg, storage, varName2, cache);
			this.callNextAction(cache);
		}.bind(this));
	} else if(target && target.send) {
		target.send(this.evalMessage(message, cache)).then(function(resultMsg) {
			const varName2 = this.evalMessage(data.varName2, cache);
			const storage = parseInt(data.storage);
			this.storeValue(resultMsg, storage, varName2, cache);
			this.callNextAction(cache);
		}.bind(this)).catch(err => {
			if(err.message == ('Cannot send messages to this user')) {
				this.executeResults(false, data, cache);
			} else {
			this.displayError.bind(this, data, cache)}
		});
	} else {
		this.callNextAction(cache);
	}
},

//---------------------------------------------------------------------
// Action Bot Mod
//
// Upon initialization of the bot, this code is run. Using the bot's
// DBM namespace, one can add/modify existing functions if necessary.
// In order to reduce conflictions between mods, be sure to alias
// functions you wish to overwrite.
//---------------------------------------------------------------------

mod: function(DBM) {
}

}; // End of module
