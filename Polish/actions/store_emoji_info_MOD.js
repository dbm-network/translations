module.exports = {

	//---------------------------------------------------------------------
	// Action Name
	//
	// This is the name of the action displayed in the editor.
	//---------------------------------------------------------------------
	
	name: "Informacje o emoji",
	
	//---------------------------------------------------------------------
	// Action Section
	//
	// This is the section the action will fall into.
	//---------------------------------------------------------------------
	
	section: "Zarządzanie emoji",
	
	//---------------------------------------------------------------------
	// Action Subtitle
	//
	// This function generates the subtitle displayed next to the name.
	//---------------------------------------------------------------------
	
	subtitle: function(data) {
		const emoji = ['Jesteś oszustem!', 'Zmienna tymczasowa', 'Zmienna serwerowa', 'Zmienna globalna'];
		const info = ['Objekt - emoji', 'Emoji jest animowana?', 'Data utworzenia emoji', 'Nazwa emoji', 'Adres URL emoji', 'ID emoji', 'Znacznik czasu emoji', 'Emoji można usunąć?', 'Emoji została usunięta?', 'Serwer emoji', 'Identyfikator emoji', 'Emoji jest zarządzalna przez zewnętrzną usługę?', 'Emoji wymaga otaczających ją dwukropków?'];
		return `${emoji[parseInt(data.emoji)]} - ${info[parseInt(data.info)]}`;
	},
	
	//---------------------------------------------------------------------
	// DBM Mods Manager Variables (Optional but nice to have!)
	//
	// These are variables that DBM Mods Manager uses to show information
	// about the mods for people to see in the list.
	//---------------------------------------------------------------------
	
	// Who made the mod (If not set, defaults to "DBM Mods")
	author: "NetLuis & MrGold",
	
	// The version of the mod (Defaults to 1.0.0)
	version: "1.9.1", //Added in 1.9.0
	
	// A short description to show on the mod line for this mod (Must be on a single line)
	short_description: "Stores Emojis information",
	
	// If it depends on any other mods by name, ex: WrexMODS if the mod uses something from WrexMods
	depends_on_mods: [
	{name:'WrexMods',path:'aaa_wrexmods_dependencies_MOD.js'}
	],
	
	
	//---------------------------------------------------------------------
	// Action Storage Function
	//
	// Stores the relevant variable info for the editor.
	//---------------------------------------------------------------------
	
	variableStorage: function(data, varType) {
		const type = parseInt(data.storage);
		if(type !== varType) return;
		const info = parseInt(data.info);
		let dataType = 'Unknown Type';
		switch(info) {
			case 0:
			dataType = "Emoji Object";
			break;
		case 1:
			dataType = "Text";
			break;
		case 2:
			dataType = "Date";
			break;
		case 3:
		    dataType = "Emoji Name";
			break;
		case 4:
			dataType = "Emoji URL";
			break;
		case 5:
			dataType = "Emoji ID";
			break;
		case 6:
			dataType = "Number";
			break;
		case 7:
			dataType = "Boolean";
			break;
		case 8:
			dataType = "Boolean";
			break;
		case 9:
			dataType = "Server";
			break;
		case 10:
			dataType = "String";
			break;
		case 11:
			dataType = "Boolean";
			break;
		case 12:
			dataType = "Boolean";
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
	
	fields: ["emoji", "varName", "info", "storage", "varName2"],
	
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
				Stworzony przez NetLuis & MrGold!
			</p>
		</div><br>
	<div>
		<div style="float: left; width: 35%;">
			Source Emoji:<br>
			<select id="emoji" class="round" onchange="glob.refreshVariableList(this)">
				${data.variables[1]}
			</select>
		</div>
		<div id="varNameContainer" style="float: right; width: 60%;">
			Nazwa zmiennej:<br>
			<input id="varName" class="round" type="text" list="variableList"><br>
		</div>
	</div><br><br><br>
	<div>
		<div style="padding-top: 8px; width: 70%;">
			Źródło - informacje:<br>
			<select id="info" class="round">
			<option value="0" selected>Objekt - emoji</option>
			<option value="1">Emoji jest animowana?</option>
			<option value="2">Data utworzenia emoji</option>
			<option value="6">Znacznik czasu emoji</option>
			<option value="3">Nazwa emoji</option>
			<option value="4">Adres URL emoji</option>
			<option value="5">ID emoji</option>
			<option value="7">Emoji można usunąć??</option>
			<option value="8">Emoji została usunięta?</option>
			<option value="9">Serwer emoji</option>
			<option value="10">Identyfikator emoji</option>
			<option value="11">Emoji jest zarządzalna przez zewnętrzną usługę?</option>
			<option value="12">Emoji wymaga otaczających ją dwukropków??</option>
			</select>
		</div>
	</div><br>
	<div>
		<div style="float: left; width: 35%;">
			Przechowuj zmienną jako:<br>
			<select id="storage" class="round">
				${data.variables[1]}
			</select>
		</div>
		<div id="varNameContainer2" style="float: right; width: 60%;">
			Nazwa zmiennej:<br>
			<input id="varName2" class="round" type="text"><br>
			</div>
			<br><br><br><br><br>
			<div id="comment" style="padding-top: 30px; padding-top: 8px;">
				<p>
				Działa tylko z niestandardowymi emoji.<br>
		</div>
	</div>`
	},
	//display: none;
	//---------------------------------------------------------------------
	// Action Editor Init Code
	//
	// When the HTML is first applied to the action editor, this code
	// is also run. This helps add modifications or setup reactionary
	// functions for the DOM elements.
	//---------------------------------------------------------------------
	
	init: function() {
		const {glob, document} = this;
	
		glob.emojiChange(document.getElementById('emoji'));
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
		const emoji = parseInt(data.emoji);
		const varName = this.evalMessage(data.varName, cache);
		const info = parseInt(data.info);
		var WrexMods = this.getWrexMods(); //Find abb_custom_methods_MOD
		const emo = WrexMods.getEmoji(emoji, varName, cache); //Get Emoji
		if(!WrexMods) return;
		if(!emo) {
			console.log('This is not a emoji'); //Variable is not a emoji -> Error
			this.callNextAction(cache);
		}
		let result;
		switch(info) {
			case 0:
			result = emo;
			break;
		case 1:
			result = emo.animated;
			break;
		case 2:
			result = emo.createdAt;
			break;
		case 3:
			result = emo.name;
			break;
		case 4:
			result = emo.url;
			break;
		case 5:
			result = emo.id;
			break;
		case 6:
			result = emo.createdTimestamp;
			break;
		case 7:
			result = emo.deletable;
			break;
		case 8:
			result = emo.deleted;
			break;
		case 9:
			result = emo.guild;
			break;
		case 10:
			result = emo.identifier;
			break;
		case 11:
			result = emo.managed;
			break;
		case 12:
			result = emo.requiresColons;
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
	
