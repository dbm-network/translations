module.exports = {

    //---------------------------------------------------------------------
    // Action Name
    //
    // This is the name of the action displayed in the editor.
    //---------------------------------------------------------------------
    
    name: "DBM German Info",
    
    //---------------------------------------------------------------------
    // Action Section
    //
    // This is the section the action will fall into.
    //---------------------------------------------------------------------
    
    section: "#Mod Information",
    
    //---------------------------------------------------------------------
    // Action Subtitle
    //
    // This function generates the subtitle displayed next to the name.
    //---------------------------------------------------------------------
    
    subtitle: function(data) {
    return `Über dieses Modpack`;
    },
    
    //---------------------------------------------------------------------
    // DBM Mods Manager Variables (Optional but nice to have!)
    //
    // These are variables that DBM Mods Manager uses to show information
    // about the mods for people to see in the list.
    //---------------------------------------------------------------------
    
    // Who made the mod (If not set, defaults to "DBM Mods")
    author: "ZockerNico",
    
    // The version of the mod (Defaults to 1.0.0)
    version: "1.0.0",
    
    // A short description to show on the mod line for this mod.
    short_description: "Informationen über das DBM German Modpack",
    
    // If it depends on any other mods by name, ex: WrexMODS if the mod uses something from WrexMods
    
    //---------------------------------------------------------------------
    
    //---------------------------------------------------------------------
    // Action Storage Function
    //
    // Stores the relevant variable info for the editor.
    //---------------------------------------------------------------------
    
    variableStorage: function(data, varType) {},
    
    //---------------------------------------------------------------------
    // Action Fields
    //
    // These are the fields for the action. These fields are customized
    // by creating elements with corresponding IDs in the HTML. These
    // are also the names of the fields stored in the action's JSON data.
    //---------------------------------------------------------------------
    
    fields: ["mods"],
    
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
    return `<div>
    <h1 style="color: #fff">Willkommen!</h1>
    <h3 style="color: #fff">Modpack Version: ${this.version}</h3>
    <p>
        Danke für die Nutzung des DBM German Modpack von <b>ZockerNico</b>!<br>
        In diesem Modpack stecken ca. 15 Stunden Arbeit, also bitte gebe es nicht als dein aus.<br>
        Solltest du einen Fehler finden, oder Probleme bei der Nutzung haben, melde dich gerne auf dem <a href="https://discord.gg/3RfuZUT">DBM German Server</a>!
    </p>
    <h3 style="color: #fff">Warnung:</h3>
    <p>
        Da alle Aktionen welche Discord Bot Maker unterstützt auf Deutsch übersetzt wurden, gehen leider alle englischen Aktionen verloren! Entscheide dich also besser jetzt, ob du das Modpack nutzen willst oder nicht. Es gibt leider keine andere Möglichkeit den Titel einer Aktion auf Deutsch zu übersetzen, als kompletten Aktions Namen zu überschreiben.<br>
        Das DBM German Team wünscht dir trotzdem noch viel Spaß!
    </p>
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
    },
    
    //---------------------------------------------------------------------
    // Action Bot Function
    //
    // This is the function for the action within the Bot's Action class.
    // Keep in mind event calls won't have access to the "msg" parameter,
    // so be sure to provide checks for variable existance.
    //---------------------------------------------------------------------
    
    action: function(cache) {
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
    },
    
    }; // End of module
    