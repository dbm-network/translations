module.exports = {

	//---------------------------------------------------------------------
	// Action Name
	//
	// This is the name of the action displayed in the editor.
	//---------------------------------------------------------------------

	name: "Pogoda",

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
		const info = ['Temperatura', 'Komentarz o pogodzie', 'Data', 'Miasto', 'Kraj', 'Region', 'Prędkość wiatru', 'Odczuwalna prędkość wiatru', 'Kierunek wiatru', 'Wilgotność', 'Ciśnienie atmosferyczne', 'Widoczność', 'Wschód słońca', 'Zachód słońca', 'Temperatura odczuwalna', 'Adres URL obrazu', 'Aktualny dzień'];
		return `${info[parseInt(data.info)]}`;
	},

	//---------------------------------------------------------------------
	// DBM Mods Manager Variables (Optional but nice to have!)
	//
	// These are variables that DBM Mods Manager uses to show information
	// about the mods for people to see in the list.
	//---------------------------------------------------------------------

	// Who made the mod (If not set, defaults to "DBM Mods")
	author: "EGGSY",

	// The version of the mod (Defaults to 1.0.0)
	version: "1.8.7", //Added in 1.8.7

	// A short description to show on the mod line for this mod (Must be on a single line)
	short_description: "Stores weather informations with node module.",

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
		let dataType = 'Nieznany typ pogody';
		switch (info) {
			case 0:
				dataType = "Temperatura";
				break;
			case 1:
				dataType = "Komentarz o pogodzie";
				break;
			case 2:
				dataType = "Data";
				break;
			case 3:
				dataType = "Miasto";
				break;
			case 4:
				dataType = "Kraj";
				break;
			case 5: // Deprecated...
				dataType = "Region";
				break;
			case 6:
				dataType = "Prędkość wiatru";
				break;
			case 7: // Deprecated...
				dataType = "Odczuwalna prędkość wiatru";
				break;
			case 8:
				dataType = "Kierunek wiatru";
				break;
			case 9:
				dataType = "Wilgotność";
				break;
			case 10: // Deprecated...
				dataType = "Ciśnienie atmosferyczne";
				break;
			case 11: // Deprecated...
				dataType = "Widoczność";
				break;
			case 12: // Deprecated...
				dataType = "Wschód słońca";
				break;
			case 13: // Deprecated...
				dataType = "Zachód słońca";
				break;
			case 14:
				dataType = "Temperatura odczuwalna";
				break;
			case 15:
				dataType = "Adres URL obrazu";
				break;
			case 16:
				dataType = "Aktualny dzień";
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

	fields: ["city", "degreeType", "info", "storage", "varName"],

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
				Stworzony przez EGGSY!
			</p>
		</div><br>
	<div style="float: left; width: 55%; padding-top: 8px;">
		Żródło - miasto:<br>
		<input id="city" class="round" type="text">
	 </div>
	 <div style="float: right; width: 45%; padding-top: 8px;">
	 	Jednostka pomiaru:<br>
	 	<select id="degreeType" class="round">
			<option value="F">°F</option>
			<option value="C">°C</option>
		</select>
  	</div><br>
	<div style="float: left; width: 100%; padding-top: 8px;">
		Informacje o źródle:<br>
		<select id="info" class="round">
			<option value="0">Temperatura</option>
			<option value="14">Temperatura odczuwalna</option>
			<option value="1">Komentarz o pogodzie</option>
			<option value="2">Data</option>
			<option value="3">Miasto</option>
			<option value="4">Kraj</option>
			<option value="6">Prędkość wiatru</option>
			<option value="8">Kierunek wiatru</option>
			<option value="9">Wilgotność</option>
			<option value="15">Adres URL obrazu</option>
			<option value="16">Aktualny dzień</option>
		</select>
	</div><br>
	<div>
		<div style="float: left; width: 35%; padding-top: 8px;">
			Przechowuj zmienną jako:<br>
			<select id="storage" class="round" onchange="glob.variableChange(this, 'varNameContainer')">
				${data.variables[0]}
			</select>
		</div>
		<div id="varNameContainer" style="float: right; width: 60%; padding-top: 8px;">
			Nazwa zmiennej:<br>
			<input id="varName" class="round" type="text"><br>
		</div>
	</div><br><br>`
	},

	//---------------------------------------------------------------------
	// Action Editor Init Code
	//
	// When the HTML is first applied to the action editor, this code
	// is also run. This helps add modifications or setup reactionary
	// functions for the DOM elements.
	//---------------------------------------------------------------------

	init: function () {
		const { glob, document } = this;
		glob.variableChange(document.getElementById('storage'), 'varNameContainer');
	},

	//---------------------------------------------------------------------
	// Action Bot Function
	//
	// This is the function for the action within the Bot's Action class.
	// Keep in mind event calls won't have access to the "msg" parameter,
	// so be sure to provide checks for variable existance.
	//---------------------------------------------------------------------

	action: function (cache) {
		const data = cache.actions[cache.index],
			info = parseInt(data.info),
			city = this.evalMessage(data.city, cache),
			degreeType2 = this.evalMessage(data.degreeType, cache),
			_this = this;

		// Check if everything is ok:
		if (!city) return console.log("Określ miasto, aby uzyskać informacje o pogodzie.");

		// Main code:
		const WrexMODS = this.getWrexMods(), // as always.
			weather = WrexMODS.require('weather-js'); // WrexMODS'll automatically try to install the module if you run it with CMD/PowerShell.

		weather.find({ search: `${city}`, degreeType: `${degreeType2}` }, function (err, response) {
			if (err || !response || response.length < 1) {
				const storage = parseInt(data.storage),
					varName2 = _this.evalMessage(data.varName, cache);
				_this.storeValue(undefined, storage, varName2, cache); // Store as "undefined" because the result was empty.
				_this.callNextAction(cache);
			} else {
				switch (info) { // Never use deprecated results. Current API doesn't support any of them. RIP old module...
					case 0:
						result = response[0].current.temperature;
						break;
					case 1:
						result = response[0].current.skytext;
						break;
					case 2:
						result = response[0].current.date;
						break;
					case 3:
						result = response[0].location.name;
						break;
					case 4:
						result = response[0].current.observationpoint;
						break;
					case 5: // Deprecated...
						result = response[0].location.region;
						break;
					case 6:
						result = response[0].current.windspeed;
						break;
					case 7: // Deperecated...
						result = response[0].wind.chill;
						break;
					case 8:
						result = response[0].current.winddisplay;
						break;
					case 9:
						result = response[0].current.humidity;
						break;
					case 10: // Deprecated...
						result = response[0].atmosphere.pressure;
						break;
					case 11: // Deprecated...
						result = response[0].atmosphere.visibility;
						break;
					case 12: // Deprecated...
						result = response[0].astronomy.sunrise;
						break;
					case 13: // Deprecated...
						result = response[0].astronomy.sunset;
						break;
					case 14:
						result = response[0].current.feelslike;
						break;
					case 15:
						result = response[0].current.imageUrl;
						break;
					case 16:
						result = response[0].current.day;
						break;
					default:
						break;
				}
				if (result !== undefined) {
					const storage = parseInt(data.storage),
						varName2 = _this.evalMessage(data.varName, cache);
					_this.storeValue(result, storage, varName2, cache);
				}
				_this.callNextAction(cache);
			}
		});
	},

	//---------------------------------------------------------------------
	// Action Bot Mod
	//
	// Upon initialization of the bot, this code is run. Using the bot's
	// DBM namespace, one can add/modify existing functions if necessary.
	// In order to reduce conflictions between mods, be sure to alias
	// functions you wish to overwrite.
	//---------------------------------------------------------------------

	mod: function (DBM) { }

}; // End of module
