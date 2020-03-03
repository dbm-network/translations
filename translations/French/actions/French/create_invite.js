module.exports = {

//---------------------------------------------------------------------
// Action Name
//
// This is the name of the action displayed in the editor.
//---------------------------------------------------------------------

name: "Créer une invitation",

//---------------------------------------------------------------------
// Action Section
//
// This is the section the action will fall into.
//---------------------------------------------------------------------

section: "Contrôle de salon",

//---------------------------------------------------------------------
// Action Subtitle
//
// This function generates the subtitle displayed next to the name.
//---------------------------------------------------------------------

subtitle: function(data) {
	const names = [
		'Same Channel', 
		'Mentioned Channel', 
		'1st Server Channel', 
		'Temp Variable', 
		'Server Variable', 
		'Global Variable'
	];
	const index = parseInt(data.storage);
	return parseInt(data.storage) < 3 ? `Inviter à ${names[index]}` : `Inviter à ${names[index]} (${data.varName})`;
},

//---------------------------------------------------------------------
// Action Storage Function
//
// Stores the relevant variable info for the editor.
//---------------------------------------------------------------------

variableStorage: function(data, varType) {
	const type = parseInt(data.storage);
	if(type !== varType) return;
	return ([data.varName2, 'Text']);
},

//---------------------------------------------------------------------
// Action Fields
//
// These are the fields for the action. These fields are customized
// by creating elements with corresponding IDs in the HTML. These
// are also the names of the fields stored in the action's JSON data.
//---------------------------------------------------------------------

fields: ["channel", "varName", "maxUses", "lifetime", "tempInvite", "unique", "storage", "varName2"],

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
		Salon source:<br>
		<select id="channel" class="round" onchange="glob.channelChange(this, 'varNameContainer')">
			${data.channels[isEvent ? 1 : 0]}
		</select>
	</div>
	<div id="varNameContainer" style="display: none; float: right; width: 60%;">
		Nom de la variable:<br>
		<input id="varName" class="round" type="text" list="variableList"><br>
	</div>
</div><br><br><br>
<div style="padding-top: 8px;">
	<div style="float: left; width: 70%;">
		Utilisations maximales:<br>
		<input id="maxUses" class="round" type="text" placeholder="Laisser vide pour l'infini."><br>
		Durée de vie de l'invitation (en secondes):<br>
		<input id="lifetime" class="round" type="text" placeholder="Laisser vide pour l'infini."><br>
	</div>
	<div style="float: right; width: 30%;">
		Invitation temporaire:<br>
		<select id="tempInvite" class="round" style="width: 90%;">
			<option value="true">Oui</option>
			<option value="false" selected>Non</option>
		</select><br>
		Unique:<br>
		<select id="unique" class="round" style="width: 90%;">
			<option value="true" selected>Oui</option>
			<option value="false">Non</option>
		</select>
	</div>
</div><br><br><br><br><br><br><br>
<div style="padding-top: 8px;">
	<div style="float: left; width: 35%;">
		Stocker dans:<br>
		<select id="storage" class="round" onchange="glob.variableChange(this, 'varNameContainer2')">
			${data.variables[0]}
		</select>
	</div>
	<div id="varNameContainer2" style="display: none; float: right; width: 60%;">
		Nom de la variable:<br>
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

	glob.channelChange(document.getElementById('channel'), 'varNameContainer');
	glob.variableChange(document.getElementById('storage'), 'varNameContainer2');
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
	const storage = parseInt(data.channel);
	const varName = this.evalMessage(data.varName, cache);
	const channel = this.getChannel(storage, varName, cache);
	const options = {};
	if(data.maxUses) {
		options.maxUses = parseInt(this.evalMessage(data.maxUses, cache));
	} else {
		options.maxUses = 0;
	}
	if(data.lifetime) {
		options.maxAge = parseInt(this.evalMessage(data.lifetime, cache));
	} else {
		options.maxAge = 0;
	}
	options.maxUses = Boolean(data.temporary === 'true');
	options.unique = Boolean(data.unique === 'true');
	if(Array.isArray(channel)) {
		this.callListFunc(channel, 'createInvite', [options]).then(function(invite) {
			const varName2 = this.evalMessage(data.varName2, cache);
			const storage2 = parseInt(data.storage);
			this.storeValue(`https://discord.gg/${invite.code}`, storage2, varName2, cache);
			this.callNextAction(cache);
		}.bind(this));
	} else if(channel && channel.createInvite) {
		channel.createInvite(options).then(function(invite) {
			const varName2 = this.evalMessage(data.varName2, cache);
			const storage2 = parseInt(data.storage);
			this.storeValue(`https://discord.gg/${invite.code}`, storage2, varName2, cache);
			this.callNextAction(cache);
		}.bind(this)).catch(this.displayError.bind(this, data, cache));
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
