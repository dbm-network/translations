module.exports = {

	//---------------------------------------------------------------------
	// Action Name
	//
	// This is the name of the action displayed in the editor.
	//---------------------------------------------------------------------

	name: "Ustaw ograniczenie czasowe",

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

	subtitle: function (data) {

		let value = parseInt(data.value);
		return `Ograniczenie czasowe: ${value} sekund(-y)`;
	},

	//---------------------------------------------------------------------
	// DBM Mods Manager Variables (Optional but nice to have!)
	//
	// These are variables that DBM Mods Manager uses to show information
	// about the mods for people to see in the list.
	//---------------------------------------------------------------------

	// Who made the mod (If not set, defaults to "DBM Mods")
	author: "Aamon#9130",

	// The version of the mod (Defaults to 1.0.0)
	version: "1.9.5", //Added in 1.9.5

	mod_version: "2",

	// A short description to show on the mod line for this mod (Must be on a single line)
	short_description: "This mod will restrict a command",



	//---------------------------------------------------------------------

	//---------------------------------------------------------------------
	// Action Storage Function
	//
	// Stores the relevant variable info for the editor.
	//---------------------------------------------------------------------

	//variableStorage: function (data, varType) {
	//},






	variableStorage: function (data, varType) {
		const type = parseInt(data.storage);
		if (type !== varType) return;
		return ([data.varName]);
	},


	//---------------------------------------------------------------------
	// Action Fields
	//
	// These are the fields for the action. These fields are customized
	// by creating elements with corresponding IDs in the HTML. These
	// are also the names of the fields stored in the action's JSON data.
	//---------------------------------------------------------------------

	fields: ["message", "value", "whattodo", "call", "storage", "varName", "source", "info"],

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

	html: function (isEvent, data) {
		return `
	<div>
		<div>
			<p>
			Stworzony przez <b>${this.author}</b>.<br>
			Za pomocą tej akcji możesz teraz dostosować ograniczenie czasu komendy.
			</p>
			
		</div>
		<div hidden style="float: left; width: 35%; padding-top: 20px;"> <<!-- todo: customized message-->
			Wiadomość - ostrzeżenie<br>
			<select id="message" class="round" onchange="glob.messageChange(this, 'varNameContainer')">
				${data.messages[isEvent ? 1 : 0]}
			</select>
		</div>
		
		
		<div style="float: left; width: 90%; padding-top: 15px;">
			Czas<br>
			<input id="value" class="round" type="text" placeholder="Wstaw tutaj czas liczony w sekundach"><br>
		</div>
		<div style="width: 35%; padding-top: 20px;">
		Jeśli limit czas. jest aktywny: <br>
		<select id="whattodo" class="round">
			<option value="0">Skocz do akcji</option>
			<option value="1">Pomiń akcje</option>
			<option value="2">Nic nie rób</option>
			<option value="3">Kontynuuj akcję</option>
		</select>
		</div>
		<div style="width: 35%; padding-top: 20px;">
		<input id="call" class="round" type="text">
		</div>
		<div>
		<div style="float: left; width: 35%;  padding-top: 8px;">
			Przech. czas do końca jako:<br>
			<select id="storage" class="round" onchange="glob.variableChange(this, 'varNameContainer')">
				${data.variables[0]}
			</select>
		</div>
		<div id="varNameContainer" style="float: right; width: 60%; padding-top: 8px;">
			Nazwa zmiennej:<br>
			<input id="varName" class="round" type="text"><br>
		</div>
		<div id="info" style="float: left; width: 75%; padding-top: 8px; ">
			ID komendy:<br>
			<input id="source" class="round" type="text" placeholder="Wstaw ID komendy (zostanie usunięty)...">
		</div>
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

	init: function () {

		try {
			const {
				glob,
				document
			} = this;


			//todo: set visibility to none to do nothing/call/stop actions and stuff like this blablabla
		} catch (err) {
			console.log(err);
		}
	},

	//---------------------------------------------------------------------
	// Action Bot Function
	//
	// This is the function for the action within the Bot's Action class.
	// Keep in mind event calls won't have access to the "msg" parameter,
	// so be sure to provide checks for variable existance.
	//---------------------------------------------------------------------

	action: function (cache) {
		const data = cache.actions[cache.index];

		const Files = this.getDBM().Files;

		const value = parseInt(data.value);
		const message = parseInt(data.message);
		const varName = this.evalMessage(data.varName, cache);
		const msg = this.getMessage(message, varName, cache);
		const whattodo = parseInt(data.whattodo);
		const val = parseInt(this.evalMessage(data.call, cache));
		const index = Math.max(val - 1, 0);
		const index2 = cache.index + val + 1;
		var _this = this;

		let id = this.evalMessage(data.source, cache);


		let cmd;
		const allData = Files.data.commands;
		for(let i = 0; i < allData.length; i++) {
			if(allData[i] && allData[i]._id === id) {
				cmd = allData[i];
				break;
			}
		};

		if(cmd == undefined || cmd == '') {return console.log('Please insert the current Command ID!')};



		//in the future update----  member permission/ add to dbm editor (maybe yes, maybe not)
		if (this.Cooldown(msg,cmd, value) === 1) {
			//console.log("execute");
			//and other stuff here if neded
			this.callNextAction(cache);
		} else {

			result = this.Cooldown(msg,cmd, value);
			if (result !== undefined) {
				const storage = parseInt(data.storage);
				const varName2 = _this.evalMessage(data.varName, cache);
				_this.storeValue(result, storage, varName2, cache);
			};

			switch (whattodo) {
				case 0:
					if (cache.actions[index]) {
						cache.index = index - 1;
						this.callNextAction(cache);
					};
					break;
				case 1:
					if (cache.actions[index2]) {
						cache.index = index2 - 1;
						this.callNextAction(cache);
					};
					break;
				case 2:
					break;
				case 3:
					this.callNextAction(cache);
					break;
				default:
				break;

			}



			// msg.delete(); //delete author command message 
			//msg.reply(`please cool down! (**${value}** seconds left)`);
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

	mod: function (DBM) {

		let userCooldown = {};
		let userTimeRemaining = {};
		var currentTime;
		DBM.Actions.Cooldown = function (msg, cmd, value) {


			const ceva = cmd._id.concat(msg.author.id); //why? why not? results =299419528631531091rBBaV a unique author-command-id :wink:x	

			if (userCooldown[ceva]) { // member has time restrict
				//msg.reply("you cannot use this command")
				//userCooldown[msg.author.id] = false; 
				currentTime = userTimeRemaining[ceva] - Math.round(new Date() /1000);
				return currentTime;
			} else //member can use the command
			{
				//msg.reply(`you can use this command`); //execute command or something like that
				userCooldown[ceva] = true;
				userTimeRemaining[ceva] = Math.round(new Date() / 1000) + value ;
				setTimeout(() => {
					userCooldown[ceva] = false;
				}, value * 1000)
				return 1;
			}
		};
	}

}; // End of module 