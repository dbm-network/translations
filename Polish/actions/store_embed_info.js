module.exports = {

	//---------------------------------------------------------------------
	// Action Name
	//
	// This is the name of the action displayed in the editor.
	//---------------------------------------------------------------------

	name: "Informacje o wiadomości Embed",

	//---------------------------------------------------------------------
	// Action Section
	//
	// This is the section the action will fall into.
	//---------------------------------------------------------------------

	section: "Wiadomości",

	//---------------------------------------------------------------------
	// Action Subtitle
	//
	// This function generates the subtitle displayed next to the name.
	//---------------------------------------------------------------------

	subtitle: function (data) {
		const message = ['Zmienna tymczasowa', 'Zmienna serwerowa', 'Zmienna globalna'];
		const info = ['Pola embed', 'Stopka embed', 'Opis embed', 'Adres URL obraz embed', 'Adres URL miniatury embed', 'Kolor embed', 'Nazwa autora embed', 'Adres URL ikony autora', 'Tytuł embed', 'Adres URL embed', 'Wszystko'];
		return `${message[parseInt(data.message - 1)]} - ${info[parseInt(data.info - 1)]}`;
	},

	//---------------------------------------------------------------------
	// DBM Mods Manager Variables (Optional but nice to have!)
	//
	// These are variables that DBM Mods Manager uses to show information
	// about the mods for people to see in the list.
	//---------------------------------------------------------------------

	// Who made the mod (If not set, defaults to "DBM Mods")
	author: "Two", //used lasse's mod as template

	// The version of the mod (Defaults to 1.0.0)
	version: "1.9.4",

	// A short description to show on the mod line for this mod (Must be on a single line)
	short_description: "Gets Embed info.",

	// If it depends on any other mods by name, ex: WrexMODS if the mod uses something from WrexMods


	//---------------------------------------------------------------------

	//---------------------------------------------------------------------
	// Action Storage Function
	//
	// Stores the relevant variable info for the editor.
	//---------------------------------------------------------------------

	variableStorage: function (data, varType) {
		const type = parseInt(data.storage);
		if (type !== varType) return;
		const info = parseInt(data.info);
		let dataType = 'Unknown Type';
		switch (info) {
			case 1:
				dataType = "JSON";
				break;
			case 2:
				dataType = "String";
				break;
			case 3:
				dataType = "String";
				break;
			case 4:
				dataType = "String";
				break;
			case 5:
				dataType = "String";
				break;
			case 6:
				dataType = "String";
				break;
			case 7:
				dataType = "String";
				break;
			case 8:
				dataType = "String";
				break;
			case 9:
				dataType = "String";
				break;
			case 10:
				dataType = "String";
				break;
			case 11:
				dataType = "JSON";
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

	fields: ["message", "varName", "info", "storage", "varName2"],

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
		<p>
			<u>Informacje o modzie:</u><br>
			Stworzony przez Two.
		</p>
	</div><br>
<div>
	<div style="float: left; width: 35%;">
		Źródło - wiadomość:<br>
		<select id="message" class="round" onchange="glob.messageChange(this, 'varNameContainer')">
			${data.messages[1]}
		</select>
	</div>
	<div id="varNameContainer" style="display: none; float: right; width: 60%;">
		Nazwa zmiennej:<br>
		<input id="varName" class="round" type="text" list="variableList"><br>
	</div>
</div><br><br><br>
<div>
	<div style="padding-top: 8px; width: 70%;">
		Źródło - informacje:<br>
		<select id="info" class="round">
			<option value="1">Pola embed</option>
			<option value="2">Stopka embed</option>
			<option value="3">Opis embed</option>
			<option value="4">Adres URL obraz embed</option>
			<option value="5">Adres URL miniatury embed</option>
			<option value="6">Kolor embed</option>
			<option value="7">Nazwa autora embed</option>
			<option value="8">Adres URL ikony autora</option>
			<option value="9">Tytuł embed</option>
			<option value="10">Adres URL embed</option>
			<option value="11">Wszystko</option>
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
		const {
			glob,
			document
		} = this;

		glob.messageChange(document.getElementById('message'), 'varNameContainer')
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
		const message = parseInt(data.message);
		const varName = this.evalMessage(data.varName, cache);
		const info = parseInt(data.info);
		const msg = this.getMessage(message, varName, cache);
		if (!msg) {
			this.callNextAction(cache);
			return;
		}
		let result;
		switch (info) {
			case 1:
				fields = []
				var e = msg;
				fieldlength = e.embeds[0].fields.length
				if (e.embeds[0].fields.length) {
					for (var i = 0; i < fieldlength; i++) {
						fields.push("Field " + i + " " + "Title: " + e.embeds[0].fields[i].name + " Value: " + e.embeds[0].fields[i].value)
					}
				} else {
					var fields = false
				}
				result = fields
				break;
			case 2:
				result = msg.embeds[0].footer.text
				break;
			case 3:
				result = msg.embeds[0].description
				break;
			case 4:
				result = msg.embeds[0].image.url
				break;
			case 5:
				result = msg.embeds[0].thumbnail.url
				break;
			case 6:
				result = msg.embeds[0].color.toString(16)
				break;
			case 7:
				result = msg.embeds[0].author.name
				break;
			case 8:
				result = msg.embeds[0].author.iconURL
				break;
			case 9:
				result = msg.embeds[0].title
				break;
			case 10:
				result = msg.embeds[0].url
				break;
			case 11:
				var e = msg
				fields = []
				fieldlength = e.embeds[0].fields.length
				if (e.embeds[0].fields.length) {
					for (var i = 0; i < fieldlength; i++) {
						fields.push("Field " + i + " " + "title: " + e.embeds[0].fields[i].name + " value: " + e.embeds[0].fields[i].value)
					}
				} else {
					var fields = "none"
				}

				var description = !e.embeds[0].description ? 'none' : e.embeds[0].description
				var image = !e.embeds[0].image.url ? 'none' : e.embeds[0].image.url
				var footer = !e.embeds[0].footer.text ? 'none' : e.embeds[0].footer.text
				var title = !e.embeds[0].title ? 'none' : e.embeds[0].title
				var thumbnail = !e.embeds[0].thumbnail.url ? 'none' : e.embeds[0].thumbnail.url
				var authorName = !e.embeds[0].author.name ? 'none' : e.embeds[0].author.name
				var authorIcon = !e.embeds[0].author.iconURL ? 'none' : e.embeds[0].author.iconURL
				var color = !e.embeds[0].color ? 'none' : e.embeds[0].color
				var url = !e.embeds[0].url ? 'none' : e.embeds[0].url
				color = color.toString(16)
				var res = {
					'title': title,
					'url': "``" + url + "``",
					'description': description,
					'color': color,
					'footer': footer,
					'image': "``" + image + "``",
					'thumbnail': "``" + thumbnail + "``",
					'author': authorName,
					'authorIcon': "``" + authorIcon + "``",
					'fields': fields
				}
				result = JSON.stringify(res).replace(/'/g, "\\'").replace(/"/g, '\\"');
				break;
			default:
				break;
		}
		if (result !== undefined) {
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

	mod: function (DBM) {}

}; // End of module