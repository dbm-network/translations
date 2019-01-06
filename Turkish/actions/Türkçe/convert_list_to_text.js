module.exports = {

//---------------------------------------------------------------------
// Action Name
//
// This is the name of the action displayed in the editor.
//---------------------------------------------------------------------

name: "Listeyi Metne Dönüştür",

//---------------------------------------------------------------------
// Action Section
//
// This is the section the action will fall into.
//---------------------------------------------------------------------

section: "Listeler ve Döngüler",

//---------------------------------------------------------------------
// Action Subtitle
//
// This function generates the subtitle displayed next to the name.
//---------------------------------------------------------------------

subtitle: function(data) {
	const list = ['Sunucu Üyeleri', 'Sunucu Kanalları', 'Sunucu Rolleri', 'Sunucu Emojileri', 'Tüm Bot Sunucuları', 'Adı Geçen Üyenin Rolleri', 'Komutu Yazanın Rolleri', 'Geçici Değişken', 'Sunucu Değişkeni', 'Evrensel Değişken'];
	return `Convert ${list[parseInt(data.list)]} to Text`;
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

fields: ["list", "varName", "start", "middle", "end", "storage", "varName2"],

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
		Listenin Kaynağı:<br>
		<select id="list" class="round" onchange="glob.listChange(this, 'varNameContainer')">
			${data.lists[isEvent ? 1 : 0]}
		</select>
	</div>
	<div id="varNameContainer" style="display: none; float: right; width: 60%;">
		Değişken İsmi:<br>
		<input id="varName" class="round" type="text" list="variableList"><br>
	</div>
</div><br><br><br>
<div style="padding-top: 8px; display: table;">
	<div style="display: table-cell;">
		Başlangıç Karakterleri:<br>
		<input id="start" class="round" type="text">
	</div>
	<div style="display: table-cell;">
		Orta Karakterler:<br>
		<input id="middle" class="round" type="text">
	</div>
	<div style="display: table-cell;">
		Son Karakterler:<br>
		<input id="end" class="round" type="text" value="\\n">
	</div>
</div><br>
<div>
	<div style="float: left; width: 35%;">
		Depola:<br>
		<select id="storage" class="round">
			${data.variables[1]}
		</select>
	</div>
	<div id="varNameContainer2" style="float: right; width: 60%;">
		Değişken Adı:<br>
		<input id="varName2" class="round" type="text">
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

	glob.listChange(document.getElementById('list'), 'varNameContainer');
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
	const storage = parseInt(data.list);
	const varName = this.evalMessage(data.varName, cache);
	const list = this.getList(storage, varName, cache);

	const start = this.evalMessage(data.start, cache).replace('\\n', '\n');
	const middle = this.evalMessage(data.middle, cache).replace('\\n', '\n');
	const end = this.evalMessage(data.end, cache).replace('\\n', '\n');
	let result = '';

	for(let i = 0; i < list.length; i++) {
		if(i === 0) {
			result += (start + String(list[i]) + end);
		} else {
			result += (start + middle + String(list[i]) + end);
		}
	}

	if(result) {
		const varName2 = this.evalMessage(data.varName2, cache);
		const storage2 = parseInt(data.storage);
		this.storeValue(result, storage2, varName2, cache);
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