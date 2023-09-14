module.exports = {
  //---------------------------------------------------------------------
  // Action Name
  //
  // This is the name of the action displayed in the editor.
  //---------------------------------------------------------------------

  name: "Supprimer les boutons et les sélections",

  //---------------------------------------------------------------------
  // Action Section
  //
  // This is the section the action will fall into.
  //---------------------------------------------------------------------

  section: "Messages",

  //---------------------------------------------------------------------
  // Action Subtitle
  //
  // This function generates the subtitle displayed next to the name.
  //---------------------------------------------------------------------

  subtitle(data, presets) {
    return `${presets.getMessageText(data.storage, data.varName)}`;
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

  fields: ["storage", "varName", "type", "searchValue"],

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
<message-input dropdownLabel="Source Message" selectId="storage" variableContainerId="varNameContainer" variableInputId="varName"></message-input>

<br><br><br><br>

<div style="float: left; width: calc(50% - 12px);">
  <span class="dbminputlabel">Components to Remove</span><br>
  <select id="type" class="round" onchange="glob.onButtonSelectTypeChange(this)">
    <option value="all" selected>All Buttons and Select Menus</option>
    <option value="allButtons">All Buttons</option>
    <option value="allSelects">All Select Menus</option>
    <option value="sourceButton">Source Button</option>
    <option value="sourceSelect">Source Select Menu</option>
    <option value="findButton">Specific Button</option>
    <option value="findSelect">Specific Select Menu</option>
  </select>
</div>

<div id="nameContainer" style="float: right; width: calc(50% - 12px);">
  <span class="dbminputlabel">Component Label/ID</span><br>
  <input id="searchValue" class="round" type="text">
</div>`;
  },

  //---------------------------------------------------------------------
  // Action Editor Init Code
  //
  // When the HTML is first applied to the action editor, this code
  // is also run. This helps add modifications or setup reactionary
  // functions for the DOM elements.
  //---------------------------------------------------------------------

  init() {
    const { glob } = this;

    glob.onButtonSelectTypeChange = function (event) {
      const input = document.getElementById("nameContainer");
      input.style.display = event.value === "findButton" || event.value === "findSelect" ? null : "none";
    };

    glob.onButtonSelectTypeChange(document.getElementById("type"));
  },

  //---------------------------------------------------------------------
  // Action Bot Function
  //
  // This is the function for the action within the Bot's Action class.
  // Keep in mind event calls won't have access to the "msg" parameter,
  // so be sure to provide checks for variable existence.
  //---------------------------------------------------------------------

  async action(cache) {
    const data = cache.actions[cache.index];
    const message = await this.getMessageFromData(data.storage, data.varName, cache);

    const type = data.type;

    let sourceButton = null;
    if (cache.interaction.isButton()) {
      sourceButton = cache.interaction.customId;
    }

    let sourceSelect = null;
    if (cache.interaction.isSelectMenu()) {
      sourceSelect = cache.interaction.customId;
    }

    let components = null;

    let searchValue = null;

    const messageId = message.id;
    if (type === "all") {

      components = [];
      this.clearAllTemporaryInteractions(messageId);

    } else if (message?.components) {

      const { MessageActionRow } = this.getDBM().DiscordJS;
      const oldComponents = message.components;
      const newComponents = [];

      for (let i = 0; i < oldComponents.length; i++) {

        const compData = oldComponents[i];
        const comps = (compData instanceof MessageActionRow) ? compData.toJSON() : compData;
        const newComps = [];

        for (let j = 0; j < comps.components.length; j++) {

          const comp = comps.components[j];
          let deleted = false;
          const id = comp.custom_id ?? comp.customId;

          switch (type) {
            case "allButtons": {
              if (comp.type !== 2 || comp.type === "BUTTON") newComps.push(comp);
              else deleted = true;
              break;
            }
            case "allSelects": {
              if (comp.type !== 3 || comp.type === "SELECT_MENU") newComps.push(comp);
              else deleted = true;
              break;
            }
            case "sourceButton": {
              if (id !== sourceButton) newComps.push(comp);
              else deleted = true;
              break;
            }
            case "sourceSelect": {
              if (id !== sourceSelect) newComps.push(comp);
              else deleted = true;
              break;
            }
            case "findButton":
            case "findSelect": {
              if (searchValue === null) searchValue = this.evalMessage(data.searchValue, cache);
              if (id !== searchValue && comp.label !== searchValue) newComps.push(comp);
              else deleted = true;
              break;
            }
          }

          if (deleted) {
            this.clearTemporaryInteraction(messageId, id);
          }
        }

        comps.components = newComps;
        if (newComps.length > 0) newComponents.push(comps);

      }
      components = newComponents;
    }

    if (components) {
      if (Array.isArray(message)) {
        this.callListFunc(message, "edit", [{ components }]).then(() => this.callNextAction(cache));
      } else if (cache.interaction?.message?.id === message?.id && cache.interaction?.update && !cache.interaction?.replied) {
        cache.interaction
          .update({ components })
          .then(() => this.callNextAction(cache))
          .catch((err) => this.displayError(data, cache, err));
      } else if (message?.edit) {
        message
          .edit({ components })
          .then(() => this.callNextAction(cache))
          .catch((err) => this.displayError(data, cache, err));
      } else {
        if (message.components) {
          message.components = components;
        }
        this.callNextAction(cache);
      }
    } else {
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
