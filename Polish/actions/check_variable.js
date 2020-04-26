module.exports = {

//---------------------------------------------------------------------
// Action Name
//
// This is the name of the action displayed in the editor.
//---------------------------------------------------------------------

name: "Sprawdź zmienną",

//---------------------------------------------------------------------
// Action Section
//
// This is the section the action will fall into.
//---------------------------------------------------------------------

section: "Warunki",

//---------------------------------------------------------------------
// Action Subtitle
//
// This function generates the subtitle displayed next to the name.
//---------------------------------------------------------------------

subtitle: function(data) {
	const comparisons = ["Istnieje", "Równa się", "Dokładnie równa się", "Mniej niż", "Większe niż", "Zawiera", "Dopasowuje regex", "Długość jest większa niż", "Długość jest mniejsza niż", "Długość jest równa","Zaczyna się od","Kończy się na","Dopasowuje pełny regeks","Mniej niż lub równa się","Większa niż lub równa się"];
	const results = ["Kontynuuj akcję", "Zatrzymaj sekwencję działania", "Skocz do akcji", "Pomiń następne akcje"];
	return `${comparisons[parseInt(data.comparison)]} | If True: ${results[parseInt(data.iftrue)]} ~ If False: ${results[parseInt(data.iffalse)]}`;
},

//---------------------------------------------------------------------
	 // DBM Mods Manager Variables (Optional but nice to have!)
	 //
	 // These are variables that DBM Mods Manager uses to show information
	 // about the mods for people to see in the list.
	 //---------------------------------------------------------------------

	 // Who made the mod (If not set, defaults to "DBM Mods")
	 author: "DBM, EGGSY, MrGold, Lasse, ZockerNico, TheMonDon", //UI fixed by MrGold

	 // The version of the mod (Defaults to 1.0.0)
	 version: "1.9.6", //Added in 1.9.1

	 // A short description to show on the mod line for this mod (Must be on a single line)
	 short_description: "Added more options to default action.",

	 // If it depends on any other mods by name, ex: WrexMODS if the mod uses something from WrexMods


	 //---------------------------------------------------------------------

//---------------------------------------------------------------------
// Action Fields
//
// These are the fields for the action. These fields are customized
// by creating elements with corresponding IDs in the HTML. These
// are also the names of the fields stored in the action's JSON data.
//---------------------------------------------------------------------

fields: ["storage", "varName", "comparison", "value", "iftrue", "iftrueVal", "iffalse", "iffalseVal"],

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
	<div><p>Ta akcja została zmodyfikowana przez DBM Mods.</p></div><br>
<div>
	<div style="float: left; width: 35%;">
		Źródło - zmienna:<br>
		<select id="storage" class="round" onchange="glob.refreshVariableList(this)">
			${data.variables[1]}
		</select>
	</div>
	<div id="varNameContainer" style="float: right; width: 60%;">
		Nazwa zmiennej:<br>
		<input id="varName" class="round" type="text" list="variableList">
	</div>
</div><br><br><br>
<div style="padding-top: 8px;">
	<div style="float: left; width: 35%;">
		Rodzaj porównania:<br>
		<select id="comparison" class="round" onchange="glob.onChange1(this)">
			<option value="0" selected>Exists</option>
			<option value="1">Równa się</option>
			<option value="2">Równa się dokładnie</option>
			<option value="3">Mniej niż</option>
			<option value="13">Mniej niż lub równa</option>
			<option value="4">Większa niż</option>
			<option value="14">Większa niż lub równa</option>
			<option value="5">Zawiera</option>
			<option value="6">Dopasowuje regex</option>
			<option value="12">Dopasowuje pełny regex</option>
			<option value="7">Długość jest większa niż</option>
			<option value="8">Długość jest mniejsza niż</option>
			<option value="9">Długość jest równa</option>
			<option value="10">Zaczyna się od</option>
			<option value="11">Kończy się na</option>
		</select>
	</div>
	<div style="float: right; width: 60%; display: none;" id="directValue">
		Przechowuj zmienną jako:<br>
		<input id="value" class="round" type="text" name="is-eval" placeholder="">
	</div>
</div><br><br><br>
<div style="padding-top: 8px;">
	${data.conditions[0]}
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

	glob.onChange1 = function(event) {
		if(parseInt(event.value) == 0) {
			document.getElementById('directValue').style.display = 'none';
		} else {
			document.getElementById('directValue').style.display = null;
		};
		switch(parseInt(event.value)) {
			case 6:
				document.getElementById('value').placeholder = "('My'|'Regex')";
				break;
			case 12:
				document.getElementById('value').placeholder = "/('My'|'Regex')\\w+/igm";
				break;
			default:
				document.getElementById('value').placeholder = "";
		};
	};

	glob.onChange1(document.getElementById('comparison'));
	glob.refreshVariableList(document.getElementById('storage'));
	glob.onChangeTrue(document.getElementById('iftrue'));
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
	const type = parseInt(data.storage);
	const varName = this.evalMessage(data.varName, cache);
	const variable = this.getVariable(type, varName, cache);
	let result = false;
	if(variable) {
		const val1 = variable;
		const compare = parseInt(data.comparison);
		let val2 = this.evalMessage(data.value, cache);
		if(compare !== 6) val2 = this.eval(val2, cache);
		if(val2 === false) val2 = this.evalMessage(data.value, cache);
		switch(compare) {
			case 0:
				result = Boolean(val1 !== undefined);
				break;
			case 1:
				result = Boolean(val1 == val2);
				break;
			case 2:
				result = Boolean(val1 === val2);
				break;
			case 3:
				result = Boolean(val1 < val2);
				break;
			case 4:
				result = Boolean(val1 > val2);
				break;
			case 5:
				if(typeof(val1.includes) === 'function') {
					result = Boolean(val1.includes(val2));
				}
				break;
			case 6:
				result = Boolean(val1.match(new RegExp('^' + val2 + '$', 'i')));
				break;
			case 7:
				result = Boolean(val1.length > val2);
				break;
			case 8:
				result = Boolean(val1.length < val2);
				break;
			case 9: //Added by Lasse
			  	result = Boolean(val1.length == val2);
			  	break;
			case 10: //Added by MrGold
			  	result = Boolean(val1.startsWith(val2));
			  	break;
			case 11: //Added by MrGold
			  	result = Boolean(val1.endsWith(val2));
			  	break;
			case 12: //Added by ZockerNico
				result = Boolean(val1.match(new RegExp(val2)));
				break;
			case 13: //Added by TheMonDon
				result = Boolean(val1 <= val2);
				break;
			case 14: //Added by TheMonDon
				result = Boolean(val1 >= val2);
				break;
		}
	}
	this.executeResults(result, data, cache);
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
