module.exports = {
  //---------------------------------------------------------------------
  // Action Name
  //
  // This is the name of the action displayed in the editor.
  //---------------------------------------------------------------------

  name: "Lancer Script",

  //---------------------------------------------------------------------
  // Action Section
  //
  // This is the section the action will fall into.
  //---------------------------------------------------------------------

  section: "D'autres choses",

  //---------------------------------------------------------------------
  // Action Subtitle
  //
  // This function generates the subtitle displayed next to the name.
  //---------------------------------------------------------------------

  subtitle(data, presets) {
    return `${data.code}`;
  },

  //---------------------------------------------------------------------
  // Action Storage Function
  //
  // Stores the relevant variable info for the editor.
  //---------------------------------------------------------------------

  variableStorage(data, varType) {
    const type = parseInt(data.storage, 10);
    if (type !== varType) return;
    return [data.varName, "Unknown Type"];
  },

  //---------------------------------------------------------------------
  // Action Meta Data
  //
  // Helps check for updates and provides info if a custom mod.
  // If this is a third-party mod, please set "author" and "authorUrl".
  //
  // It's highly recommended "preciseCheck" is set to false for third-party mods.
  // This will make it so the patch version (0.0.X) is not checked.
  //---------------------------------------------------------------------

  meta: { version: "2.1.7", preciseCheck: true, author: null, authorUrl: null, downloadUrl: null },

  //---------------------------------------------------------------------
  // Action Fields
  //
  // These are the fields for the action. These fields are customized
  // by creating elements with corresponding IDs in the HTML. These
  // are also the names of the fields stored in the action's JSON data.
  //---------------------------------------------------------------------

  fields: ["behavior", "interpretation", "code", "storage", "varName"],

  //---------------------------------------------------------------------
  // Command HTML
  //
  // This function returns a string containing the HTML used for
  // editing actions.
  //
  // The "isEvent" parameter will be true if this action is being used
  // for an event. Due to their nature, events lack certain information,
  // so edit the HTML to reflect this.
  //---------------------------------------------------------------------

  html(isEvent, data) {
    return `
<div>
	<div style="float: left; width: 45%;">
		<span class="dbminputlabel">End Behavior</span><br>
		<select id="behavior" class="round">
			<option value="0" selected>Call Next Action Automatically</option>
			<option value="1">Do Not Call Next Action</option>
		</select>
	</div>
	<div style="padding-left: 5%; float: left; width: 55%;">
		<span class="dbminputlabel">Interpretation Style</span><br>
		<select id="interpretation" class="round">
			<option value="0" selected>Evaluate Text First</option>
			<option value="1">Evaluate Text Directly</option>
		</select>
	</div>
</div>

<br><br><br>

<div style="padding-top: 8px;">
	<span class="dbminputlabel">Custom Code</span><br>
	<textarea id="code" rows="9" name="is-eval" style="white-space: nowrap; resize: none;"></textarea>
</div>

<br>

<store-in-variable allowNone selectId="storage" variableInputId="varName" variableContainerId="varNameContainer"></store-in-variable>`;
  },

  //---------------------------------------------------------------------
  // Action Editor Init Code
  //
  // When the HTML is first applied to the action editor, this code
  // is also run. This helps add modifications or setup reactionary
  // functions for the DOM elements.
  //---------------------------------------------------------------------

  init() {},

  //---------------------------------------------------------------------
  // Action Bot Function
  //
  // This is the function for the action within the Bot's Action class.
  // Keep in mind event calls won't have access to the "msg" parameter,
  // so be sure to provide checks for variable existence.
  //---------------------------------------------------------------------

  action(cache) {
    const data = cache.actions[cache.index];
    let code;
    if (data.interpretation === "0") {
      code = this.evalMessage(data.code, cache);
    } else {
      code = data.code;
    }
    const result = this.eval(code, cache);
    const varName = this.evalMessage(data.varName, cache);
    const storage = parseInt(data.storage, 10);
    this.storeValue(result, storage, varName, cache);
    if (data.behavior === "0") {
      this.callNextAction(cache);
    }
  },

  //---------------------------------------------------------------------
  // Action Bot Mod
  //
  // Upon initialization of the bot, this code is run. Using the bot's
  // DBM namespace, one can add/modify existing functions if necessary.
  // In order to reduce conflicts between mods, be sure to alias
  // functions you wish to overwrite.
  //---------------------------------------------------------------------

  mod() {},
};
