module.exports = {

//---------------------------------------------------------------------
// Action Name
//
// This is the name of the action displayed in the editor.
//---------------------------------------------------------------------

name: "Utwórz kotwicę",

//---------------------------------------------------------------------
// Action Section
//
// This is the section the action will fall into.
//---------------------------------------------------------------------

section: "Inne akcje",

//---------------------------------------------------------------------
// Action Subtitle
//
// This function generates the subtitle displayed next to the name.
//---------------------------------------------------------------------

subtitle: function(data) {
	return !!data.description ? `<font color="${data.color}">${data.description}</font>` : `Stwórz ${!!data.anchor_id ? `the "<font color="${data.color}">${data.anchor_id}</font>" anchor at the current position!` : 'an anchor!'}`;
},

author: "Deus Corvi && LeonZ",
version: "1.0.0",	// Added in 1.9.6

//---------------------------------------------------------------------
// Action Fields
//
// These are the fields for the action. These fields are customized
// by creating elements with corresponding IDs in the HTML. These
// are also the names of the fields stored in the action's JSON data.
//---------------------------------------------------------------------

fields: ["anchor_id", "color", "description"],

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
	<div>
		<p>
			<u>Informacje o modzie:</u><br>
			Ten mod tworzy punkt zaczepienia, na który możesz skakać bez<br>
			potrzeby skakania po akcjach lub ich pomijania.
		</p>
	</div><br>
	<div style="float: left; width: 74%;">
		ID kotwicy:<br>
		<input type="text" class="round" id="anchor_id"><br>
	</div>
	<div style="float: left; width: 24%;">
		Kolor kotwicy:<br>
		<input type="color" id="color"><br>
	</div>
	<div>
	<div style="float: left; width: 98%;">
		Opis:<br>
		<input type="text" class="round" id="description">
	</div>
</div>
	`
},

//---------------------------------------------------------------------
// Action Editor Init Code
//
// When the HTML is first applied to the action editor, this code
// is also run. This helps add modifications or setup reactionary
// functions for the DOM elements.
//---------------------------------------------------------------------

init: function() {
},

//---------------------------------------------------------------------
// Action Bot Function
//
// This is the function for the action within the Bot's Action class.
// Keep in mind event calls won't have access to the "msg" parameter, 
// so be sure to provide checks for variable existance.
//---------------------------------------------------------------------

action: function(cache) {
	this.callNextAction(cache);
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