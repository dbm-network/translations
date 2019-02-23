module.exports = {

//---------------------------------------------------------------------
// Action Name
//
// This is the name of the action displayed in the editor.
//---------------------------------------------------------------------

name: "Rollen Info speichern",

//---------------------------------------------------------------------
// Action Section
//
// This is the section the action will fall into.
//---------------------------------------------------------------------

section: "Rollen Verwaltung",

//---------------------------------------------------------------------
// Action Subtitle
//
// This function generates the subtitle displayed next to the name.
//---------------------------------------------------------------------

subtitle: function(data) {
	const roles = ['Erwähnte Rolle', '1ste Author Rolle', '1ste Server Rolle', 'Temporäre Variabel', 'Serverweite Variabel', 'Globale Variabel'];
	const info = ['Rollen Objekt', 'Rollen ID', 'Rollen Name', 'Rollen Farbe', 'Rollen Position', 'Rollen Zeitstempel', 'Rolle erwähnbar?', 'Gruppierungs Rolle?'];
	return `${roles[parseInt(data.role)]} - ${info[parseInt(data.info)]}`;
},

//---------------------------------------------------------------------
// Action Storage Function
//
// Stores the relevant variable info for the editor.
//---------------------------------------------------------------------

variableStorage: function(data, varType) {
	const type = parseInt(data.storage);
	if(type !== varType) return;
	const info = parseInt(data.info);
	let dataType = 'Unbekannte Art';
	switch(info) {
		case 0:
			dataType = 'Rolle';
			break;
		case 1:
			dataType = 'Rollen ID';
			break;
		case 2:
			dataType = 'Text';
			break;
		case 3:
			dataType = 'Farbe';
			break;
		case 4:
		case 5:
			dataType = 'Text';
			break;
		case 6:
		case 7:
			dataType = 'Boolean';
			break;
	}
	return ([data.varName2, dataType]);
},

//---------------------------------------------------------------------
// Action Fields
//
// These are the fields for the action. These fields are customized
// by creating elements with corresponding IDs in the HTML. These
// are also the names of the fields stored in the action's JSON data.
//---------------------------------------------------------------------

fields: ["role", "varName", "info", "storage", "varName2"],

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
	<div style="float: left; width: 35%;">
		Ursprungs Rolle:<br>
		<select id="role" class="round" onchange="glob.roleChange(this, 'varNameContainer')">
			${data.roles[isEvent ? 1 : 0]}
		</select>
	</div>
	<div id="varNameContainer" style="display: none; float: right; width: 60%;">
		Variabel Name:<br>
		<input id="varName" class="round" type="text" list="variableList"><br>
	</div>
</div><br><br><br>
<div>
	<div style="padding-top: 8px; width: 70%;">
		Ursprungs Info:<br>
		<select id="info" class="round">
			<option value="0" selected>Rollen Objekt</option>
			<option value="1">Rollen ID</option>
			<option value="2">Rollen Name</option>
			<option value="3">Rollen Farbe</option>
			<option value="4">Rollen Position</option>
			<option value="5">Rollen Zeitstempel</option>
			<option value="6">Rolle erwähnbar?</option>
			<option value="7">Gruppierungs Rolle?</option>
		</select>
	</div>
</div><br>
<div>
	<div style="float: left; width: 35%;">
		Speichern in:<br>
		<select id="storage" class="round">
			${data.variables[1]}
		</select>
	</div>
	<div id="varNameContainer2" style="float: right; width: 60%;">
		Variabel Name:<br>
		<input id="varName2" class="round" type="text"><br>
	</div>
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

	glob.roleChange(document.getElementById('role'), 'varNameContainer')
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
	const role = parseInt(data.role);
	const varName = this.evalMessage(data.varName, cache);
	const info = parseInt(data.info);
	const targetRole = this.getRole(role, varName, cache);
	if(!targetRole) {
		this.callNextAction(cache);
		return;
	}
	let result;
	switch(info) {
		case 0:
			result = targetRole;
			break;
		case 1:
			result = targetRole.id;
			break;
		case 2:
			result = targetRole.name;
			break;
		case 3:
			result = targetRole.hexColor;
			break;
		case 4:
			result = targetRole.position;
			break;
		case 5:
			result = targetRole.createdTimestamp;
			break;
		case 6:
			result = targetRole.mentionable;
			break;
		case 7:
			result = targetRole.hoist;
			break;
		default:
			break;
	}
	if(result !== undefined) {
		const storage = parseInt(data.storage);
		const varName2 = this.evalMessage(data.varName2, cache);
		this.storeValue(result, storage, varName2, cache);
	}
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