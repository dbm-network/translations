module.exports = {

	//---------------------------------------------------------------------
	// Action Name
	//
	// This is the name of the action displayed in the editor.
	//---------------------------------------------------------------------
	
	name: "Informacje o zaproszeniu",
	
	//---------------------------------------------------------------------
	// Action Section
	//
	// This is the section the action will fall into.
	//---------------------------------------------------------------------
	
	section: "Zarządzanie kanałami",
	
	//---------------------------------------------------------------------
	// Action Subtitle
	//
	// This function generates the subtitle displayed next to the name.
	//---------------------------------------------------------------------
	
	subtitle: function(data) {
		const info = ['Kanał jako obiekt', 'Twórca zaproszenia', 'Data utworzenia', 'Data wygaśnięcia', 'Nazwa serwera', 'Maksymalna liczba użyć', 'Jest tymczasowe?', 'Adres URL zaproszenia', 'Ilość użyć','Liczba zaproszonych osób', 'Kod zaproszenia']
		return `${info[parseInt(data.info)]}`;
	},

	//---------------------------------------------------------------------
	 // DBM Mods Manager Variables (Optional but nice to have!)
	 //
	 // These are variables that DBM Mods Manager uses to show information
	 // about the mods for people to see in the list.
	 //---------------------------------------------------------------------

	 // Who made the mod (If not set, defaults to "DBM Mods")
 	author: "iAmaury, General Wrex, EliteArtz, Jakob and Lurker",

 	// The version of the mod (Defaults to 1.0.0)
 	version: "1.9.5", //Added in 1.9.0

 	// A short description to show on the mod line for this mod (Must be on a single line)
 	short_description: "Stores something from an Invite.",

 	// If it depends on any other mods by name, ex: WrexMODS if the mod uses something from WrexMods

 	//---------------------------------------------------------------------

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
				dataType = 'Object';
				break;
			case 1:
				dataType = 'User';
				break;
			case 2:
				dataType = 'date';
				break;
			case 3:
				dataType = 'date';
				break;
			case 4:
				dataType = 'Guild';
				break;
			case 5:
				dataType = 'number';
				break;
			case 6:
				dataType = 'boolean';
				break;
			case 7:
				dataType = 'string';
				break;
			case 8:
				dataType = 'number';
				break;
			case 9:
				dataType = 'number';
				break;
			case 10:
				dataType = 'number';
				break;
		}
		return ([data.varName, dataType]);
	},
	
	//---------------------------------------------------------------------
	// Action Fields
	//
	// These are the fields for the action. These fields are customized
	// by creating elements with corresponding IDs in the HTML. These
	// are also the names of the fields stored in the action's JSON data.
	//---------------------------------------------------------------------
	
	fields: ["invite", "info", "storage", "varName"],
	
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
			  Stworzony przez iAmaury, General Wrex, EliteArtz, Jakob oraz Lurker!<br>
		   </p>
		</div>
	<div style="padding-top: 8px;">
		Żródło - zaproszenie:<br>
		<textarea class="round" id="invite" rows="1" placeholder="Kod lub adres URL | np. abcdef lub discord.gg/abcdef" style="width: 99%; font-family: monospace; white-space: nowrap; resize: none;"></textarea>
	</div><br>
	<div style="padding-top: 8px; width: 70%;">
		Żródło - informacje:<br>
		<select id="info" class="round">
			<option value="0" selected>Kanał jako obiekt</option>
			<option value="1">Twórca zaproszenia</option>
			<option value="2">Data utworzenia</option>
			<option value="3">Data wygaśnięcia</option>
			<option value="4">Nazwa serwera</option>
			<option value="5">Maksymalna liczba użyć</option>
			<option value="6">Jest tymczasowe?</option>
			<option value="7">Adres URL zaproszenia</option>
			<option value="8">Ilość użyć</option>
			<option value="9">Liczba zaproszonych osób</option>
			<option value=10">Kod zaproszenia</option>
		</select>
	</div><br>
	<div style="float: left; width: 35%; padding-top: 8px;">
		Przechowuj wyniki jako:<br>
		<select id="storage" class="round" onchange="glob.variableChange(this, 'varNameContainer')">
			${data.variables[0]}
		</select>
	</div>
	<div id="varNameContainer" style="float: right; display: none; width: 60%; padding-top: 8px;">
		Nazwa zmiennej:<br>
		<input id="varName" class="round" type="text">
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
		const invite = this.evalMessage(data.invite, cache);
		const info = parseInt(data.info);
		
		const storage = parseInt(data.storage);
		const varName = this.evalMessage(data.varName, cache);

        const client = this.getDBM().Bot.bot;

        client.fetchInvite(invite).catch(console.error).then(doThis.bind(this));

        function doThis(invite){

            if(!invite) this.callNextAction(cache);
				
			let result;
			switch(info) {
				case 0:
					result = invite.channel;
					break;
				case 1:
					result = invite.inviter;
					break;
				case 2:
					result = invite.createdAt;
					break;
				case 3:
					result = invite.expiresAt;
					break;
				case 4:
					result = invite.guild;
					break;
				case 5:
					result = invite.maxUses;
					break;
				case 6:
					result = invite.temporary;
					break;
				case 7:
					result = invite.url;
					break;
				case 8:
					result = invite.uses;
					break;
				case 9:
					result = invite.memberCount;
					break;
				case 10:
					result = invite.code;
					break;
				default:
					break;
			}

			if(result !== undefined) {
				this.storeValue(result, storage, varName, cache);
			}
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