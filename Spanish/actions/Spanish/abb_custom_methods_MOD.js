
//---------------------------------------------------------------------
// custommethods - for Discord Bot Maker
// Contains functions for actions using custommethods
// Stolen from Wrex :troll: ~ Lasse
//---------------------------------------------------------------------
// Changelog:
// 1.0.1 - Lasse
//   - Added getReaction()
//
// 1.0.0 - Lasse
//   - Added getWebhook()
//
//---------------------------------------------------------------------

const custommethods= {};

custommethods.API = {};

custommethods.DBM = null;

custommethods.Version = "1.0.1";

// Methods:

custommethods.getWebhook = function(type, varName, cache) {
    const server = cache.server;
    switch(type) {
        case 1:
            return cache.temp[varName];
            break;
        case 2:
            if(server && this.server[server.id]) {
                return this.server[server.id][varName];
            }
            break;
        case 3:
            return this.global[varName];
            break;
        default:
            break;
    }
    return false;
};

custommethods.getReaction = function(type, varName, cache) {
    const server = cache.server;
    switch(type) {
        case 1:
            return cache.temp[varName];
            break;
        case 2:
            if(server && this.server[server.id]) {
                return this.server[server.id][varName];
            }
            break;
        case 3:
            return this.global[varName];
            break;
        default:
            break;
    }
    return false;
};


//---------------------------------------------------------------------



// This function is called by DBM when the bot is started
var customaction = {};
customaction.name = "métodoscustom";
customaction.section = "Other Stuff";
customaction.author = "DBM Mods"; //Init.: Lasse
customaction.version = "1.8.8"; //Added in 1.8.7 - Changelog at the top!
customaction.short_description = "Requerido para algunos mods, no hace nada.";

customaction.html = function() {
	return `
<div id ="wrexdiv" style="width: 550px; height: 350px; overflow-y: scroll;">
     <p>
		<u>Custom Methods:</u><br><br>
		Esto no es una acción, pero es necesario para las acciones de esta categoría. <br><br>
		<b> Crear la acción no hará nada </b>
	</p>
</div>`
};

customaction.getcustommethods = function(){
	return custommethods;
}


customaction.mod = function(DBM) {

	custommethods.DBM = DBM

	DBM.Actions.getcustommethods = function(){
		return custommethods;
	}
};
module.exports = customaction;
