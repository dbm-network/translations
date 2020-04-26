module.exports = {

//---------------------------------------------------------------------
// Action Name
//
// This is the name of the action displayed in the editor.
//---------------------------------------------------------------------

name: "Znajdź tekst",

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
	return `Znajdź "${data.wordtoFind}"`;
},

//---------------------------------------------------------------------
	// DBM Mods Manager Variables (Optional but nice to have!)
	//
	// These are variables that DBM Mods Manager uses to show information
	// about the mods for people to see in the list.
	//---------------------------------------------------------------------

	// Who made the mod (If not set, defaults to "DBM Mods")
	author: "iAmaury",

	// The version of the mod (Defaults to 1.0.0)
	version: "1.8.7", //Added in 1.8.7

	// A short description to show on the mod line for this mod (Must be on a single line)
	short_description: "Find text",

	// If it depends on any other mods by name, ex: WrexMODS if the mod uses something from WrexMods

//---------------------------------------------------------------------
// Action Storage Function
//
// Stores the relevant variable info for the editor.
//---------------------------------------------------------------------

variableStorage: function(data, varType) {
	const type = parseInt(data.storage);
	if(type !== varType) return;
	let dataType = 'Number';
	return ([data.varName, dataType]);
},
//---------------------------------------------------------------------
// Action Fields
//
// These are the fields for the action. These fields are customized
// by creating elements with corresponding IDs in the HTML. These
// are also the names of the fields stored in the action's JSON data.
//---------------------------------------------------------------------

fields: ["text", "wordtoFind", "position", "storage", "varName"],

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
    <div id="modinfo">
	<p>
	   <u>Informacje o modzie:</u><br>
	   Stworzony przez <b>iAmaury</b>!<br>
	</p>
	</div><br>
	<div style="float: left; width: 65%; padding-top: 8px;">
		Tekst do znalezienia:
		<input id="wordtoFind" class="round" type="text">
	</div>
	<div style="float: left; width: 29%; padding-top: 8px;">
		Pozycja:<br>
		<select id="position" class="round">
			<option value="0" selected>Pozycja na starcie</option>
			<option value="1">Pozycja na końcu</option>
	</select>
	</div>
	<div style="float: left; width: 99%; padding-top: 8px;">
		Szukaj:
        <textarea id="text" rows="3" placeholder="Tutaj wstaw tekst..." style="width: 95%; font-family: monospace; white-space: nowrap; resize: none;"></textarea>
	</div>
	<div style="float: left; width: 35%; padding-top: 8px;">
		Przechowuj wynik jako:<br>
		<select id="storage" class="round" onchange="glob.variableChange(this, 'varNameContainer')">
			${data.variables[0]}
		</select>
	</div>
	<div id="varNameContainer" style="float: right; display: none; width: 60%; padding-top: 8px;">
		Nazwa zmiennej:<br>
		<input id="varName" class="round" type="text" >
	</div>
	<div style="float: left; width: 99%; padding-top: 8px;">
	    <p>
	    Ta czynność wyświetli pozycję tekstu w zależności od wyboru.<br>
		Jeśli wybierzesz <b>Pozycja na końcu</b>, znajdzie pozycję ostatniego znaku twojego tekstu.<br>
		Jeśli wybierzesz <b>Pozycja na starcie</b>, znajdzie pozycję pierwszego znaku Twojego tekstu.
		<b>Przykład:</b> Szukamy słowa "a" | <u>To jest<b> *</b>a<b>- </b>test</u> | * na starcie (8) | - na końcu (9)
		</p>
	</div>`
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

	glob.variableChange(document.getElementById('storage'), 'varNameContainer');
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
	const text = this.evalMessage(data.text, cache);
	const wordtoFind = this.evalMessage(data.wordtoFind, cache);
	const position = parseInt(data.position);
	// Check if everything is ok
	if(!wordtoFind) return console.log("Please enter the word to find.")
	if(!text) return console.log("Please enter some text.")

	// Main code
	let result;
	switch(position) {
		case 0:
			result = `${data.text}`.indexOf(`${data.wordtoFind}`)
			break;
		case 1:
			result = `${data.wordtoFind}`.length + `${data.text}`.indexOf(`${data.wordtoFind}`)
			break;
		default:
			break;
	}
	// Storing
	const storage = parseInt(data.storage);
	const varName = this.evalMessage(data.varName, cache);
	this.storeValue(result, storage, varName, cache);

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
