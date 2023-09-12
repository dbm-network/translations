/******************************************************
 * Discord Bot Maker Bot
 * Version 1.6.10
 * Robert Borghese
 ******************************************************/

const DBM = {};
DBM.version = "1.6.10";

const DiscordJS = DBM.DiscordJS = require("discord.js");

if(DiscordJS.version < "12.0.0") {
	console.log("Cette version de Discord Bot Maker nécessite Discord.JS v12.\nVeuillez utiliser \"Projet > Module Manager\" et \"Projet > Reinstall Node Modules\" pour mettre à jour vers Discord.JS v12.");
	throw new Error("Besoin de Discord.JS v12 pour fonctionner !!!");
}

//---------------------------------------------------------------------
// Bot
// Contains functions for controlling the bot.
//---------------------------------------------------------------------

const Bot = DBM.Bot = {};

Bot.$cmds = {}; // Normal commands
Bot.$icds = []; // Includes word commands
Bot.$regx = []; // Regular Expression commands
Bot.$anym = []; // Any message commands
Bot.$evts = {}; // Events

Bot.bot = null;

Bot.init = function() {
	this.initBot();
	this.setupBot();
	this.reformatData();
	this.initEvents();
	this.login();
};

Bot.initBot = function() {
	this.bot = new DiscordJS.Client({ ws: { intents: this.intents() }});
};

Bot.intents = function() {
	return DiscordJS.Intents.NON_PRIVILEGED;
}

Bot.setupBot = function() {
	this.bot.on("raw", this.onRawData);
};

Bot.onRawData = function(packet) {
	if(packet.t !== "MESSAGE_REACTION_ADD" || packet.t !== "MESSAGE_REACTION_REMOVE") return;

	const client = Bot.bot;
	const channel = client.channels.cache.get(packet.d.channel_id);
	if(channel.messages.cache.has(packet.d.message_id)) return;

	channel.messages.fetch(packet.d.message_id).then(function(message) {
		const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
		const reaction = message.reactions.cache.get(emoji);
		if (packet.t === "MESSAGE_REACTION_ADD") {
			client.emit("messageReactionAdd", reaction, client.users.cache.get(packet.d.user_id));
		}
		if (packet.t === "MESSAGE_REACTION_REMOVE") {
			client.emit("messageReactionRemove", reaction, client.users.cache.get(packet.d.user_id));
		}
	});
};

Bot.reformatData = function() {
	this.reformatCommands();
	this.reformatEvents();
};

Bot.reformatCommands = function() {
	const data = Files.data.commands;
	if(!data) return;
	this._caseSensitive = Files.data.settings.case === "true";
	for(let i = 0; i < data.length; i++) {
		const com = data[i];
		if(com) {
			switch(com.comType) {
				case "1":
					this.$icds.push(com);
					break;
				case "2":
					this.$regx.push(com);
					break;
				case "3":
					this.$anym.push(com);
					break;
				default:
					if(this._caseSensitive) {
						this.$cmds[com.name] = com;
						if(com._aliases) {
							const aliases = com._aliases;
							for(let j = 0; j < aliases.length; j++) {
								this.$cmds[aliases[j]] = com;
							}
						}
					} else {
						this.$cmds[com.name.toLowerCase()] = com;
						if(com._aliases) {
							const aliases = com._aliases;
							for(let j = 0; j < aliases.length; j++) {
								this.$cmds[aliases[j].toLowerCase()] = com;
							}
						}
					}
					break;
			}
		}
	}
};

Bot.reformatEvents = function() {
	const data = Files.data.events;
	if(!data) return;
	for(let i = 0; i < data.length; i++) {
		const com = data[i];
		if(com) {
			const type = com["event-type"];
			if(!this.$evts[type]) this.$evts[type] = [];
			this.$evts[type].push(com);
		}
	}
};

Bot.initEvents = function() {
	this.bot.on("ready", this.onReady.bind(this));
	this.bot.on("message", this.onMessage.bind(this));
	Events.registerEvents(this.bot);
};

Bot.login = function() {
	this.bot.login(Files.data.settings.token);
};

Bot.onReady = function() {
	if(process.send) process.send("BotReady");
	console.log("Bot is ready!"); // Tells editor to start!
	this.restoreVariables();
	this.preformInitialization();
};

Bot.restoreVariables = function() {
	Files.restoreServerVariables();
	Files.restoreGlobalVariables();
};

Bot.preformInitialization = function() {
	const bot = this.bot;
	if(this.$evts["1"]) {
		Events.onInitialization(bot);
	}
	if(this.$evts["3"]) {
		Events.setupIntervals(bot);
	}
};

Bot.onMessage = function(msg) {
	if(!msg.author.bot) {
		try {
			if(!this.checkCommand(msg)) {
				this.onAnyMessage(msg);
			}
		} catch(e) {
			console.error(e);
		}
	}
};

Bot.checkCommand = function(msg) {
	let command = this.checkTag(msg.content);
	if(command) {
		if(!this._caseSensitive) {
			command = command.toLowerCase();
		}
		const cmd = this.$cmds[command];
		if(cmd) {
			Actions.preformActions(msg, cmd);
			return true;
		}
	}
	return false;
};

Bot.checkTag = function(content) {
	const tag = Files.data.settings.tag;
	const separator = Files.data.settings.separator || "\\s+";
	content = content.split(new RegExp(separator))[0];
	if(content.startsWith(tag)) {
		return content.substring(tag.length);
	}
	return null;
};

Bot.onAnyMessage = function(msg) {
	this.checkIncludes(msg);
	this.checkRegExps(msg);
	if(!msg.author.bot) {
		if(this.$evts["2"]) {
			Events.callEvents("2", 1, 0, 2, false, "", msg);
		}
		const anym = this.$anym;
		for(let i = 0; i < anym.length; i++) {
			if(anym[i]) {
				Actions.preformActions(msg, anym[i]);
			}
		}
	}
};

Bot.checkIncludes = function(msg) {
	const text = msg.content;
	if(!text) return;
	const icds = this.$icds;
	const icds_len = icds.length;
	for(let i = 0; i < icds_len; i++) {
		if(icds[i] && icds[i].name) {
			if(text.match(new RegExp("\\b" + icds[i].name + "\\b", "i"))) {
				Actions.preformActions(msg, icds[i]);
			} else if(icds[i]._aliases) {
				const aliases = icds[i]._aliases;
				const aliases_len = aliases.length;
				for(let j = 0; j < aliases_len; j++) {
					if(text.match(new RegExp("\\b" + aliases[j] + "\\b", "i"))) {
						Actions.preformActions(msg, icds[i]);
						break;
					}
				}
			}
		}
	}
};

Bot.checkRegExps = function(msg) {
	const text = msg.content;
	if(!text) return;
	const regx = this.$regx;
	const regx_len = regx.length;
	for(let i = 0; i < regx_len; i++) {
		if(regx[i] && regx[i].name) {
			if(text.match(new RegExp(regx[i].name, "i"))) {
				Actions.preformActions(msg, regx[i]);
			} else if(regx[i]._aliases) {
				const aliases = regx[i]._aliases;
				const aliases_len = aliases.length;
				for(let j = 0; j < aliases_len; j++) {
					if(text.match(new RegExp("\\b" + aliases[j] + "\\b", "i"))) {
						Actions.preformActions(msg, regx[i]);
						break;
					}
				}
			}
		}
	}
};

//---------------------------------------------------------------------
// Actions
// Contains functions for bot actions.
//---------------------------------------------------------------------

const Actions = DBM.Actions = {};

Actions.actionsLocation = null;
Actions.eventsLocation = null;
Actions.extensionsLocation = null;

Actions.server = {};
Actions.global = {};

Actions.timeStamps = [];

Actions.exists = function(action) {
	if(!action) return false;
	return typeof(this[action]) === "function";
};

Actions.getLocalFile = function(url) {
	return require("path").join(process.cwd(), url);
};

Actions.getDBM = function() {
	return DBM;
};

Actions.callListFunc = function(list, funcName, args) {
	return new Promise(function(resolve) {
		const max = list.length;
		let curr = 0;
		function callItem() {
			if(curr === max) {
				resolve.apply(this, arguments);
				return;
			}
			const item = list[curr++];
			if(typeof(Actions.dest(item, funcName)) === "function") {
				item[funcName].apply(item, args).then(callItem).catch(callItem);
			} else {
				callItem();
			}
		}
		callItem();
	});
};

Actions.getActionVariable = function(name, defaultValue) {
	if(this[name] === undefined && defaultValue !== undefined) {
		this[name] = defaultValue;
	}
	return this[name];
};

Actions.eval = function(content, cache) {
	if(!content) return false;
	const DBM = this.getDBM();
	const tempVars = this.getActionVariable.bind(cache.temp);
	let serverVars = null;
	if(cache.server) {
		serverVars = this.getActionVariable.bind(this.server[cache.server.id]);
	}
	const globalVars = this.getActionVariable.bind(this.global);
	const msg = cache.msg;
	const server = cache.server;
	const client = DBM.Bot.bot;
	const bot = DBM.Bot.bot;
	const me = server ? server.me : null;
	let user = "", member = "", mentionedUser = "", mentionedChannel = "", defaultChannel = "";
	if(msg) {
		user = msg.author;
		member = msg.member;
		if(msg.mentions) {
			mentionedUser = msg.mentions.users.first() || "";
			mentionedChannel = msg.mentions.channels.first() || "";
		}
	}
	if(server) {
		defaultChannel = server.getDefaultChannel();
	}
	try {
		return eval(content);
	} catch(e) {
		console.error(e);
		return false;
	}
};

Actions.evalMessage = function(content, cache) {
	if(!content) return "";
	if(!content.match(/\$\{.*\}/im)) return content;
	return this.eval("`" + content.replace(/`/g, "\\`") + "`", cache);
};

Actions.initMods = function() {
	const fs  = require("fs");
	this.modDirectories().forEach(function(dir) {
		fs.readdirSync(dir).forEach(function(file) {
			if(file.match(/\.js/i)) {
				const action = require(require("path").join(dir, file));
				if(action.action) {
					this[action.name] = action.action;
				}
				if(action.mod) {
					try {
						action.mod(DBM);
					} catch(e) {
						console.error(e);
					}
				}
			}
		}.bind(this));
	}.bind(this));
};

Actions.modDirectories = function() {
	const result = [this.actionsLocation];
	if(Files.verifyDirectory(Actions.eventsLocation)) {
		result.push(this.eventsLocation);
	}
	if(Files.verifyDirectory(Actions.extensionsLocation)) {
		result.push(this.extensionsLocation);
	}
	return result;
};

Actions.preformActions = function(msg, cmd) {
	if(this.checkConditions(msg, cmd) && this.checkTimeRestriction(msg, cmd)) {
		this.invokeActions(msg, cmd.actions);
	}
};

Actions.checkConditions = function(msg, cmd) {
	const isServer = Boolean(msg.guild && msg.member);
	const restriction = parseInt(cmd.restriction);
	const permissions = cmd.permissions;
	switch(restriction) {
		case 0:
			if(isServer) {
				return this.checkPermissions(msg, permissions);
			} else {
				return true;
			}
		case 1:
			return isServer && this.checkPermissions(msg, permissions);
		case 2:
			return isServer && msg.guild.ownerID === msg.member.id;
		case 3:
			return !isServer;
		case 4:
			return Files.data.settings.ownerId && msg.author.id === Files.data.settings.ownerId;
		default:
			return true;
	}
};

Actions.checkTimeRestriction = function(msg, cmd) {
	if(!cmd._timeRestriction) return true;
	if(!msg.member) return false;
	const mid = msg.member.id;
	const cid = cmd._id;
	if(!this.timeStamps[cid]) {
		this.timeStamps[cid] = [];
		this.timeStamps[cid][mid] = Date.now();
		return true;
	} else if(!this.timeStamps[cid][mid]) {
		this.timeStamps[cid][mid] = Date.now();
		return true;
	} else {
		const time = Date.now();
		const diff = time - this.timeStamps[cid][mid];
		if(cmd._timeRestriction <= Math.floor(diff / 1000)) {
			this.timeStamps[cid][mid] = time;
			return true;
		} else {
			const remaining = cmd._timeRestriction - Math.floor(diff / 1000);
			Events.callEvents("38", 1, 3, 2, false, "", msg.member, this.generateTimeString(remaining));
		}
	}
};

Actions.generateTimeString = function(miliSeconds) {
	let remaining = miliSeconds;
	const times = [];

	const days = Math.floor(remaining / 60 / 60 / 24);
	if(days > 0) {
		remaining -= (days * 60 * 60 * 24);
		times.push(days + (days === 1 ? " jour" : " jours"));
	}
	const hours = Math.floor(remaining / 60 / 60);
	if(hours > 0) {
		remaining -= (hours * 60 * 60);
		times.push(hours + (hours === 1 ? " heure" : " heures"));
	}
	const minutes = Math.floor(remaining / 60);
	if(minutes > 0) {
		remaining -= (minutes * 60);
		times.push(minutes + (minutes === 1 ? " minute" : " minutes"));
	}
	const seconds = Math.floor(remaining);
	if(seconds > 0) {
		remaining -= (seconds);
		times.push(seconds + (seconds === 1 ? " seconde" : " secondes"));
	}

	let result = "";
	if(times.length === 1) {
		result = times[0];
	} else if(times.length === 2) {
		result = times[0] + " et " + times[1];
	} else if(times.length === 3) {
		result = times[0] + ", " + times[1] + ", et " + times[2];
	} else if(times.length === 4) {
		result = times[0] + ", " + times[1] + ", " + times[2] + ", et " + times[3];
	}
	return result;
};

Actions.checkPermissions = function(msg, permissions) {
	const author = msg.member;
	if(!author) return false;
	if(permissions === "NONE") return true;
	if(msg.guild.ownerID === author.id) return true;
	return author.permissions.has([permissions]);
};

Actions.invokeActions = function(msg, actions) {
	const act = actions[0];
	if(!act) return;
	const cache = {
		actions: actions,
		index: 0,
		temp: {},
		server: msg.guild,
		msg: msg
	};
	if(this.exists(act.name)) {
		try {
			this[act.name](cache);
		} catch(e) {
			this.displayError(act, cache, e);
		}
	} else {
		console.error(act.name + " n'existe pas !");
		this.callNextAction(cache);
	}
};

Actions.invokeEvent = function(event, server, temp) {
	const actions = event.actions;
	const act = actions[0];
	if(!act) return;
	const cache = {
		actions: actions,
		index: 0,
		temp: temp,
		server: server
	};
	if(this.exists(act.name)) {
		try {
			this[act.name](cache);
		} catch(e) {
			this.displayError(act, cache, e);
		}
	} else {
		console.error(act.name + " n'existe pas !");
		this.callNextAction(cache);
	}
};

Actions.callNextAction = function(cache) {
	cache.index++;
	const index = cache.index;
	const actions = cache.actions;
	const act = actions[index];
	if(!act) {
		if(cache.callback) {
			cache.callback();
		}
		return;
	}
	if(this.exists(act.name)) {
		try {
			this[act.name](cache);
		} catch(e) {
			this.displayError(act, cache, e);
		}
	} else {
		console.error(act.name + " n'existe pas !");
		this.callNextAction(cache);
	}
};

Actions.getErrorString = function(data, cache) {
	const type = (data.permissions || data.restriction || !data["event-type"]) ? "la commande" : "l\'événement";
	return `Erreur avec le ${type} "${data.name}", Action #${cache.index + 1}`;
};

Actions.displayError = function(data, cache, err) {
	const dbm = this.getErrorString(data, cache);
	console.error(dbm + ":\n" + err);
	Events.onError(dbm, err.stack ? err.stack : err, cache);
};

Actions.getSendTarget = function(type, varName, cache) {
	const msg = cache.msg;
	const server = cache.server;
	switch(type) {
		case 0:
			if(msg) {
				return msg.channel;
			}
			break;
		case 1:
			if(msg) {
				return msg.author;
			}
			break;
		case 2:
			if(msg && msg.mentions) {
				return msg.mentions.users.first();
			}
			break;
		case 3:
			if(msg && msg.mentions) {
				return msg.mentions.channels.first();
			}
			break;
		case 4:
			if(server) {
				return server.getDefaultChannel();
			}
			break;
		case 5:
			return cache.temp[varName];
		case 6:
			if(server && this.server[server.id]) {
				return this.server[server.id][varName];
			}
			break;
		case 7:
			return this.global[varName];
		default:
			break;
	}
	return false;
};

Actions.getMember = function(type, varName, cache) {
	const msg = cache.msg;
	const server = cache.server;
	switch(type) {
		case 0:
			if(msg && msg.mentions && msg.mentions.members) {
				return msg.mentions.members.first();
			}
			break;
		case 1:
			if(msg) {
				return msg.member || msg.author;
			}
			break;
		case 2:
			return cache.temp[varName];
		case 3:
			if(server && this.server[server.id]) {
				return this.server[server.id][varName];
			}
			break;
		case 4:
			return this.global[varName];
		default:
			break;
	}
	return false;
};

Actions.getMessage = function(type, varName, cache) {
	const msg = cache.msg;
	const server = cache.server;
	switch(type) {
		case 0:
			if(msg) {
				return msg;
			}
			break;
		case 1:
			return cache.temp[varName];
		case 2:
			if(server && this.server[server.id]) {
				return this.server[server.id][varName];
			}
			break;
		case 3:
			return this.global[varName];
		default:
			break;
	}
	return false;
};

Actions.getServer = function(type, varName, cache) {
	const server = cache.server;
	switch(type) {
		case 0:
			if(server) {
				return server;
			}
			break;
		case 1:
			return cache.temp[varName];
		case 2:
			if(server && this.server[server.id]) {
				return this.server[server.id][varName];
			}
			break;
		case 3:
			return this.global[varName];
		default:
			break;
	}
	return false;
};

Actions.getRole = function(type, varName, cache) {
	const msg = cache.msg;
	const server = cache.server;
	switch(type) {
		case 0:
			if(msg && msg.mentions && msg.mentions.roles) {
				return msg.mentions.roles.first();
			}
			break;
		case 1:
			if(msg && msg.member && msg.member.roles) {
				return msg.member.roles.cache.first();
			}
			break;
		case 2:
			if(server && server.roles) {
				return server.roles.cache.first();
			}
			break;
		case 3:
			return cache.temp[varName];
		case 4:
			if(server && this.server[server.id]) {
				return this.server[server.id][varName];
			}
			break;
		case 5:
			return this.global[varName];
		default:
			break;
	}
	return false;
};

Actions.getChannel = function(type, varName, cache) {
	const msg = cache.msg;
	const server = cache.server;
	switch(type) {
		case 0:
			if(msg) {
				return msg.channel;
			}
			break;
		case 1:
			if(msg && msg.mentions) {
				return msg.mentions.channels.first();
			}
			break;
		case 2:
			if(server) {
				return server.getDefaultChannel();
			}
			break;
		case 3:
			return cache.temp[varName];
		case 4:
			if(server && this.server[server.id]) {
				return this.server[server.id][varName];
			}
			break;
		case 5:
			return this.global[varName];
		default:
			break;
	}
	return false;
};

Actions.getVoiceChannel = function(type, varName, cache) {
	const msg = cache.msg;
	const server = cache.server;

	switch(type) {
		case 0:
			if(msg && msg.member) {
				return msg.member.voice && msg.member.voice.channel;
			}
			break;
		case 1:
			if(msg && msg.mentions) {
				const member = msg.mentions.members.first();
				if(member) {
					return msg.member.voice && msg.member.voice.channel;
				}
			}
			break;
		case 2:
			if(server) {
				return server.getDefaultVoiceChannel();
			}
			break;
		case 3:
			return cache.temp[varName];
		case 4:
			if(server && this.server[server.id]) {
				return this.server[server.id][varName];
			}
			break;
		case 5:
			return this.global[varName];
		default:
			break;
	}
	return false;
};

Actions.getList = function(type, varName, cache) {
	const msg = cache.msg;
	const server = cache.server;
	switch(type) {
		case 0:
			if(server) {
				return server.members.cache.array();
			}
			break;
		case 1:
			if(server) {
				return server.channels.cache.array();
			}
			break;
		case 2:
			if(server) {
				return server.roles.cache.array();
			}
			break;
		case 3:
			if(server) {
				return server.emojis.cache.array();
			}
			break;
		case 4:
			return Bot.bot.guilds.cache.array();
		case 5:
			if(msg && msg.mentions && msg.mentions.members) {
				return msg.mentions.members.first().roles.cache.array();
			}
			break;
		case 6:
			if(msg && msg.member) {
				return msg.member.roles.cache.array();
			}
			break;
		case 7:
			return cache.temp[varName];
		case 8:
			if(server && this.server[server.id]) {
				return this.server[server.id][varName];
			}
			break;
		case 9:
			return this.global[varName];
		default:
			break;
	}
	return false;
};

Actions.getVariable = function(type, varName, cache) {
	const server = cache.server;
	switch(type) {
		case 1:
			return cache.temp[varName];
		case 2:
			if(server && this.server[server.id]) {
				return this.server[server.id][varName];
			}
			break;
		case 3:
			return this.global[varName];
		default:
			break;
	}
	return false;
};

Actions.storeValue = function(value, type, varName, cache) {
	const server = cache.server;
	switch(type) {
		case 1:
			cache.temp[varName] = value;
			break;
		case 2:
			if(server) {
				if(!this.server[server.id]) this.server[server.id] = {};
				this.server[server.id][varName] = value;
			}
			break;
		case 3:
			this.global[varName] = value;
			break;
		default:
			break;
	}
};

Actions.executeResults = function(result, data, cache) {
	if(result) {
		const type = parseInt(data.iftrue);
		switch(type) {
			case 0:
				this.callNextAction(cache);
				break;
			case 2:
				const val = parseInt(this.evalMessage(data.iftrueVal, cache));
				const index = Math.max(val - 1, 0);
				if(cache.actions[index]) {
					cache.index = index - 1;
					this.callNextAction(cache);
				}
				break;
			case 3:
				const amnt = parseInt(this.evalMessage(data.iftrueVal, cache));
				const index2 = cache.index + amnt + 1;
				if(cache.actions[index2]) {
					cache.index = index2 - 1;
					this.callNextAction(cache);
				}
				break;
			default:
				break;
		}
	} else {
		const type = parseInt(data.iffalse);
		switch(type) {
			case 0:
				this.callNextAction(cache);
				break;
			case 2:
				const val = parseInt(this.evalMessage(data.iffalseVal, cache));
				const index = Math.max(val - 1, 0);
				if(cache.actions[index]) {
					cache.index = index - 1;
					this.callNextAction(cache);
				}
				break;
			case 3:
				const amnt = parseInt(this.evalMessage(data.iffalseVal, cache));
				const index2 = cache.index + amnt + 1;
				if(cache.actions[index2]) {
					cache.index = index2 - 1;
					this.callNextAction(cache);
				}
				break;
			default:
				break;
		}
	}
};

Actions.dest = function(obj, ...props) {
	if (typeof obj !== "object") return obj;

	let main = obj;
	for (const prop of props) {
		if (!main || !prop) return main;
		main = main[prop];
	}

	return main;
};

//---------------------------------------------------------------------
// Events
// Handles the various events that occur.
//---------------------------------------------------------------------

const Events = DBM.Events = {};

let $evts = null;

Events.data = [
	[], [], [], [], ["guildCreate", 0, 0, 1], ["guildDelete", 0, 0, 1], ["guildMemberAdd", 1, 0, 2], ["guildMemberRemove", 1, 0, 2], ["channelCreate", 1, 0, 2, true, "arg1.type !== 'text'"], ["channelDelete", 1, 0, 2, true, "arg1.type !== 'text'"], ["roleCreate", 1, 0, 2], ["roleDelete", 1, 0, 2], ["guildBanAdd", 3, 0, 1], ["guildBanRemove", 3, 0, 1], ["channelCreate", 1, 0, 2, true, "arg1.type !== 'voice'"], ["channelDelete", 1, 0, 2, true, "arg1.type !== 'voice'"], ["emojiCreate", 1, 0, 2], ["emojiDelete", 1, 0, 2], ["messageDelete", 1, 0, 2, true], ["guildUpdate", 1, 3, 3], ["guildMemberUpdate", 1, 3, 4], ["presenceUpdate", 1, 3, 4], ["voiceStateUpdate", 1, 3, 4], ["channelUpdate", 1, 3, 4, true], ["channelPinsUpdate", 1, 0, 2, true], ["roleUpdate", 1, 3, 4], ["messageUpdate", 1, 3, 4, true, "arg2.content.length === 0"], ["emojiUpdate", 1, 3, 4], [], [], ["messageReactionRemoveAll", 1, 0, 2, true], ["guildMemberAvailable", 1, 0, 2], ["guildMembersChunk", 1, 0, 3], ["guildMemberSpeaking", 1, 3, 2], [], [], ["guildUnavailable", 1, 0, 1], ["inviteCreate", 1, 0, 2], ["inviteDelete", 1, 0, 2], ["webhookUpdate", 1, 0, 1]
];

Events.registerEvents = function(bot) {
	$evts = Bot.$evts;
	for(let i = 0; i < this.data.length; i++) {
		const d = this.data[i];
		if(d.length > 0 && $evts[String(i)]) {
			bot.on(d[0], this.callEvents.bind(this, String(i), d[1], d[2], d[3], !!d[4], d[5]));
		}
	}
	if($evts["28"]) bot.on("messageReactionAdd", this.onReaction.bind(this, "28"));
	if($evts["29"]) bot.on("messageReactionRemove", this.onReaction.bind(this, "29"));
	if($evts["34"]) bot.on("typingStart", this.onTyping.bind(this, "34"));
	if($evts["35"]) bot.on("typingStop", this.onTyping.bind(this, "35"));
};

Events.callEvents = function(id, temp1, temp2, server, mustServe, condition, arg1, arg2) {
	if(mustServe) {
		if(temp1 > 0 && !arg1.guild) return;
		if(temp2 > 0 && !arg2.guild) return;
	}
	if(condition && eval(condition)) return;
	const events = $evts[id];
	if(!events) return;
	for(let i = 0; i < events.length; i++) {
		const event = events[i];
		const temp = {};
		if(event.temp) temp[event.temp] = this.getObject(temp1, arg1, arg2);
		if(event.temp2) temp[event.temp2] = this.getObject(temp2, arg1, arg2);
		Actions.invokeEvent(event, this.getObject(server, arg1, arg2), temp);
	}
};

Events.getObject = function(id, arg1, arg2) {
	switch(id) {
		case 1: return arg1;
		case 2: return arg1.guild;
		case 3: return arg2;
		case 4: return arg2.guild;
	}
	return undefined;
};

Events.onInitialization = function(bot) {
	const events = $evts["1"];
	for(let i = 0; i < events.length; i++) {
		const event = events[i];
		const temp = {};
		const servers = bot.guilds.cache.array();
		for(let i = 0; i < servers.length; i++) {
			const server = servers[i];
			if(server) {
				Actions.invokeEvent(event, server, temp);
			}
		}
	}
};

Events.setupIntervals = function(bot) {
	const events = $evts["3"];
	for(let i = 0; i < events.length; i++) {
		const event = events[i];
		const temp = {};
		const time = event.temp ? parseFloat(event.temp) : 60;
		bot.setInterval(function() {
			const servers = bot.guilds.cache.array();
			for(let i = 0; i < servers.length; i++) {
				const server = servers[i];
				if(server) {
					Actions.invokeEvent(event, server, temp);
				}
			}
		}.bind(this), time * 1000);
	}
};

Events.onReaction = function(id, reaction, user) {
	const events = $evts[id];
	if(!events) return;
	if(!reaction.message || !reaction.message.guild) return;
	const server = reaction.message.guild;
	const member = server.member(user);
	if(!member) return;
	for(let i = 0; i < events.length; i++) {
		const event = events[i];
		const temp = {};
		if(event.temp) temp[event.temp] = reaction;
		if(event.temp2) temp[event.temp2] = member;
		Actions.invokeEvent(event, server, temp);
	}
};

Events.onTyping = function(id, channel, user) {
	const events = $evts[id];
	if(!events) return;
	if(!channel.guild) return;
	const server = channel.guild;
	const member = server.member(user);
	if(!member) return;
	for(let i = 0; i < events.length; i++) {
		const event = events[i];
		const temp = {};
		if(event.temp) temp[event.temp] = channel;
		if(event.temp2) temp[event.temp2] = member;
		Actions.invokeEvent(event, server, temp);
	}
};

Events.onError = function(text, text2, cache) {
	const events = $evts["37"];
	if(!events) return;
	for(let i = 0; i < events.length; i++) {
		const event = events[i];
		const temp = {};
		if(event.temp) temp[event.temp] = text;
		if(event.temp2) temp[event.temp2] = text2;
		Actions.invokeEvent(event, cache.server, temp);
	}
};

//---------------------------------------------------------------------
// Images
// Contains functions for image management.
//---------------------------------------------------------------------

const JIMP = require("jimp");

const Images = DBM.Images = {};

Images.getImage = function(url) {
	if(!url.startsWith("http")) url = Actions.getLocalFile(url);
	return JIMP.read(url);
};

Images.getFont = function(url) {
	return JIMP.loadFont(Actions.getLocalFile(url));
};

Images.createBuffer = function(image) {
	return new Promise(function(resolve, reject) {
		image.getBuffer(JIMP.MIME_PNG, function(err, buffer) {
			if(err) {
				reject(err);
			} else {
				resolve(buffer);
			}
		});
	});
};

Images.drawImageOnImage = function(img1, img2, x, y) {
	for(let i = 0; i < img2.bitmap.width; i++) {
		for(let j = 0; j < img2.bitmap.height; j++) {
			const pos = (i * (img2.bitmap.width * 4)) + (j * 4);
			const pos2 = ((i + y) * (img1.bitmap.width * 4)) + ((j + x) * 4);
			const target = img1.bitmap.data;
			const source = img2.bitmap.data;
			for(let k = 0; k < 4; k++) {
				target[pos2 + k] = source[pos + k];
			}
		}
	}
};

//---------------------------------------------------------------------
// Files
// Contains functions for file management.
//---------------------------------------------------------------------

const Files = DBM.Files = {};

Files.data = {};
Files.writers = {};
Files.crypto = require("crypto");
Files.dataFiles = [
	"commands.json",
	"events.json",
	"settings.json",
	"players.json",
	"servers.json",
	"serverVars.json",
	"globalVars.json"
];

Files.startBot = function() {
	const path = require("path");
	Actions.actionsLocation = path.join(__dirname, "actions");
	Actions.eventsLocation = path.join(__dirname, "events");
	Actions.extensionsLocation = path.join(__dirname, "extensions");
	if(this.verifyDirectory(Actions.actionsLocation)) {
		Actions.initMods();
		this.readData(Bot.init.bind(Bot));
	} else {
		console.error("Veuillez copier le dossier \"Actions\" de DBM vers le dossier du bot: \n" + Actions.actionsLocation);
	}
};

Files.verifyDirectory = function(dir) {
	return typeof dir === "string" && require("fs").existsSync(dir);
};

Files.readData = function(callback) {
	const fs = require("fs");
	const path = require("path");
	let max = this.dataFiles.length;
	let cur = 0;
	for(let i = 0; i < max; i++) {
		const filePath = path.join(process.cwd(), "data", this.dataFiles[i]);
		if(!fs.existsSync(filePath)) continue;
		fs.readFile(filePath, function(error, content) {
			const filename = this.dataFiles[i].slice(0, -5);
			let data;
			try {
				if(typeof content !== "string" && content.toString) content = content.toString();
				data = JSON.parse(this.decrypt(content));
			} catch(e) {
				console.error(`Il y a eu un problème en analysant ${this.dataFiles[i]}!`);
				return;
			}
			this.data[filename] = data;
			if(++cur === max) {
				callback();
			}
		}.bind(this));
	}
};

Files.saveData = function(file, callback) {
	const path = require("path");
	const data = this.data[file];
	if(!this.writers[file]) {
		const fstorm = require("fstorm");
		this.writers[file] = fstorm(path.join(process.cwd(), "data", file + ".json"));
	}
	this.writers[file].write(this.encrypt(JSON.stringify(data)), function() {
		if(callback) {
			callback();
		}
	}.bind(this));
};

Files.initEncryption = function() {
	try {
		this.password = require("discord-bot-maker");
	} catch(e) {
		this.password = "";
	}
};

Files.encrypt = function(text) {
	if(this.password.length === 0) return text;
	const cipher = this.crypto.createCipher("aes-128-ofb", this.password);
	let crypted = cipher.update(text, "utf8", "hex");
	crypted += cipher.final("hex");
	return crypted;
};

Files.decrypt = function(text) {
	if(this.password.length === 0) return text;
	const decipher = this.crypto.createDecipher("aes-128-ofb", this.password);
	let dec = decipher.update(text, "hex", "utf8");
	dec += decipher.final("utf8");
	return dec;
};

Files.convertItem = function(item) {
	if(Array.isArray(item)) {
		const result = [];
		const length = item.length;
		for(let i = 0; i < length; i++) {
			result[i] = this.convertItem(item[i]);
		}
		return result;
	} else if(typeof item !== "object") {
		let result = "";
		try {
			result = JSON.stringify(item);
		} catch {}
		if(result !== "{}") {
			return item;
		}
	} else if(item.convertToString) {
		return item.convertToString();
	}
	return null;
};

Files.saveServerVariable = function(serverID, varName, item) {
	if(!this.data.serverVars[serverID]) {
		this.data.serverVars[serverID] = {};
	}
	const strItem = this.convertItem(item);
	if(strItem !== null) {
		this.data.serverVars[serverID][varName] = strItem;
	}
	this.saveData("serverVars");
};

Files.restoreServerVariables = function() {
	const keys = Object.keys(this.data.serverVars);
	for(let i = 0; i < keys.length; i++) {
		const varNames = Object.keys(this.data.serverVars[keys[i]]);
		for(let j = 0; j < varNames.length; j++) {
			this.restoreVariable(this.data.serverVars[keys[i]][varNames[j]], 2, varNames[j], keys[i]);
		}
	}
};

Files.saveGlobalVariable = function(varName, item) {
	const strItem = this.convertItem(item);
	if(strItem !== null) {
		this.data.globalVars[varName] = strItem;
	}
	this.saveData("globalVars");
};

Files.restoreGlobalVariables = function() {
	const keys = Object.keys(this.data.globalVars);
	for(let i = 0; i < keys.length; i++) {
		this.restoreVariable(this.data.globalVars[keys[i]], 3, keys[i]);
	}
};

Files.restoreVariable = function(value, type, varName, serverId) {
	const bot = Bot.bot;
	let cache = {};
	if(serverId) {
		cache.server = { id: serverId };
	}
	if(typeof value === "string" || Array.isArray(value)) {
		this.restoreValue(value, bot).then(function(finalValue) {
			if(finalValue) {
				Actions.storeValue(finalValue, type, varName, cache);
			}
		}.bind(this)).catch(() => {});
	} else {
		Actions.storeValue(value, type, varName, cache);
	}
};

Files.restoreValue = function(value, bot) {
	return new Promise(function(resolve, reject) {
		if(typeof value === "string") {
			if(value.startsWith("mem-")) {
				return resolve(this.restoreMember(value, bot));
			} else if(value.startsWith("msg-")) {
				return this.restoreMessage(value, bot).then(resolve).catch(reject);
			} else if(value.startsWith("tc-")) {
				return resolve(this.restoreTextChannel(value, bot));
			} else if(value.startsWith("vc-")) {
				return resolve(this.restoreVoiceChannel(value, bot));
			} else if(value.startsWith("r-")) {
				return resolve(this.restoreRole(value, bot));
			} else if(value.startsWith("s-")) {
				return resolve(this.restoreServer(value, bot));
			} else if(value.startsWith("e-")) {
				return resolve(this.restoreEmoji(value, bot));
			} else if(value.startsWith("usr-")) {
				return resolve(this.restoreUser(value, bot));
			}
			resolve(value);
		} else if(Array.isArray(value)) {
			const result = [];
			const length = value.length;
			let curr = 0;
			for(let i = 0; i < length; i++) {
				this.restoreValue(value[i], bot).then(function(item) {
					result[i] = item;
					if(++curr >= length) {
						resolve(result);
					}
				}).catch(function() {
					if(++curr >= length) {
						resolve(result);
					}
				});
			}
		} else {
			resolve(value);
		}
	}.bind(this));
};

Files.restoreMember = function(value, bot) {
	const split = value.split("_");
	const memId = split[0].slice(4);
	const serverId = split[1].slice(2);
	const server = bot.guilds.get(serverId);
	if(server && server.members && server.members.cache) {
		const member = server.members.cache.get(memId);
		return member;
	}
};

Files.restoreMessage = function(value, bot) {
	const split = value.split("_");
	const msgId = split[0].slice(4);
	const channelId = split[1].slice(2);
	const channel = bot.channels.cache.get(channelId);
	if(channel && channel.messages && channel.messages.fetch) {
		return channel.messages.fetch(msgId);
	}
};

Files.restoreTextChannel = function(value, bot) {
	const channelId = value.slice(3);
	return bot.channels.cache.get(channelId);
};

Files.restoreVoiceChannel = function(value, bot) {
	const channelId = value.slice(3);
	return bot.channels.cache.get(channelId);
};

Files.restoreRole = function(value, bot) {
	const split = value.split("_");
	const roleId = split[0].slice(2);
	const serverId = split[1].slice(2);
	const server = bot.guilds.cache.get(serverId);
	if(server && server.roles && server.roles.cache) {
		return server.roles.cache.get(roleId);
	}
};

Files.restoreServer = function(value, bot) {
	const serverId = value.slice(2);
	return bot.guilds.cache.get(serverId);
};

Files.restoreEmoji = function(value, bot) {
	const emojiId = value.slice(2);
	return bot.emojis.cache.get(emojiId);
};

Files.restoreUser = function(value, bot) {
	const userId = value.slice(4);
	return bot.users.cache.get(userId);
};

Files.initEncryption();

//---------------------------------------------------------------------
// Audio
// Contains functions for voice channel stuff.
//---------------------------------------------------------------------

const Audio = DBM.Audio = {};

Audio.ytdl = null;
try {
	Audio.ytdl = require("ytdl-core");
} catch {}

Audio.queue = [];
Audio.volumes = [];
Audio.connections = [];
Audio.dispatchers = [];

Audio.isConnected = function(cache) {
	if(!cache.server) return false;
	const id = cache.server.id;
	return this.connections[id];
};

Audio.isPlaying = function(cache) {
	if(!cache.server) return false;
	const id = cache.server.id;
	return this.dispatchers[id];
};

Audio.setVolume = function(volume, cache) {
	if(!cache.server) return;
	const id = cache.server.id;
	if(this.dispatchers[id]) {
		this.volumes[id] = volume;
		this.dispatchers[id].setVolumeLogarithmic(volume);
	}
};

Audio.connectToVoice = function(voiceChannel) {
	const promise = voiceChannel.join();
	promise.then(function(connection) {
		this.connections[voiceChannel.guild.id] = connection;
		connection.on("disconnect", function() {
			this.connections[voiceChannel.guild.id] = null;
			this.volumes[voiceChannel.guild.id] = null;
		}.bind(this));
	}.bind(this)).catch(console.error);
	return promise;
};

Audio.addToQueue = function(item, cache) {
	if(!cache.server) return;
	const id = cache.server.id;
	if(!this.queue[id]) this.queue[id] = [];
	this.queue[id].push(item);
	this.playNext(id);
};

Audio.clearQueue = function(cache) {
	if(!cache.server) return;
	const id = cache.server.id;
	this.queue[id] = [];
};

Audio.playNext = function(id, forceSkip) {
	if(!this.connections[id]) return;
	if(!this.dispatchers[id] || !!forceSkip) {
		if(!this.queue[id]) this.queue[id] = [];
		if(this.queue[id] && this.queue[id].length > 0) {
			const item = this.queue[id].shift();
			this.playItem(item, id);
		} else {
			this.connections[id].disconnect();
		}
	}
};

Audio.playItem = function(item, id) {
	if(!this.connections[id]) return;
	if(this.dispatchers[id]) {
		this.dispatchers[id]._forceEnd = true;
		this.dispatchers[id].destroy();
	}

	const type = item[0];
	let setupDispatcher = false;
	switch(type) {
		case "file":
			setupDispatcher = this.playFile(item[2], item[1], id);
			break;
		case "url":
			setupDispatcher = this.playUrl(item[2], item[1], id);
			break;
		case "yt":
			setupDispatcher = this.playYt(item[2], item[1], id);
			break;
	}

	if(setupDispatcher && !this.dispatchers[id]._eventSetup) {
		this.dispatchers[id].on("finish", function() {
			const isForced = this.dispatchers[id]._forceEnd;
			this.dispatchers[id] = null;
			if(!isForced) {
				this.playNext(id);
			}
		}.bind(this));
		this.dispatchers[id]._eventSetup = true;
	}
};

Audio.playFile = function(url, options, id) {
	this.dispatchers[id] = this.connections[id].play(Actions.getLocalFile(url), options);
	return true;
};

Audio.playUrl = function(url, options, id) {
	this.dispatchers[id] = this.connections[id].play(url, options);
	return true;
};

Audio.playYt = function(url, options, id) {
	if(!this.ytdl) return false;
	const stream = this.ytdl(url, {
		quality: "highestaudio",
		filter: "audioonly",
		highWaterMark: 26214400 // 25mb
	});
	options.highWaterMark = 1;
	this.dispatchers[id] = this.connections[id].play(stream, options);
	return true;
};

//---------------------------------------------------------------------
// GuildMember
//---------------------------------------------------------------------

const { Structures } = DiscordJS;

Structures.extend("GuildMember", (GuildMember) => class extends GuildMember {
	constructor(client, data, guild) {
		super(client, data, guild);
	}

	unban(server, reason) {
		return server.members.unban(this.author, reason);
	}

	data(name, defaultValue) {
		const id = this.id;
		const data = Files.data.players;
		if(data[id] === undefined) {
			if(defaultValue === undefined) {
				return null;
			} else {
				data[id] = {};
			}
		}
		if(data[id][name] === undefined && defaultValue !== undefined) {
			data[id][name] = defaultValue;
		}
		return data[id][name];
	}

	setData(name, value) {
		const id = this.id;
		const data = Files.data.players;
		if(data[id] === undefined) {
			data[id] = {};
		}
		data[id][name] = value;
		Files.saveData("players");
	}

	addData(name, value) {
		const id = this.id;
		const data = Files.data.players;
		if(data[id] === undefined) {
			data[id] = {};
		}
		if(data[id][name] === undefined) {
			this.setData(name, value);
		} else {
			this.setData(name, this.data(name) + value);
		}
	}

	convertToString() {
		return `mem-${this.id}_s-${this.guild.id}`;
	}
});

//---------------------------------------------------------------------
// User
//---------------------------------------------------------------------

Structures.extend("User", (User) => class extends User {
	constructor(client, data) {
		super(client, data);
	}

	data(name, defaultValue) {
		const id = this.id;
		const data = Files.data.players;
		if(data[id] === undefined) {
			if(defaultValue === undefined) {
				return null;
			} else {
				data[id] = {};
			}
		}
		if(data[id][name] === undefined && defaultValue !== undefined) {
			data[id][name] = defaultValue;
		}
		return data[id][name];
	}

	setData(name, value) {
		const id = this.id;
		const data = Files.data.players;
		if(data[id] === undefined) {
			data[id] = {};
		}
		data[id][name] = value;
		Files.saveData("players");
	}

	addData(name, value) {
		const id = this.id;
		const data = Files.data.players;
		if(data[id] === undefined) {
			data[id] = {};
		}
		if(data[id][name] === undefined) {
			this.setData(name, value);
		} else {
			this.setData(name, this.data(name) + value);
		}
	}

	convertToString() {
		return `usr-${this.id}`;
	}
});

//---------------------------------------------------------------------
// Guild
//---------------------------------------------------------------------

Structures.extend("Guild", (Guild) => class extends Guild {
	constructor(client, data) {
		super(client, data);
	}

	getDefaultChannel() {
		let channel = this.channels.cache.get(this.id);
		if(!channel) {
			this.channels.cache.array().forEach(function(c) {
				if(c.permissionsFor(DBM.Bot.bot.user).has("SEND_MESSAGES") && c.type !== "voice" && c.type !== "category") {
					if(!channel) {
						channel = c;
					} else if(channel.position > c.position) {
						channel = c;
					}
				}
			});
		}
		return channel;
	}

	data(name, defaultValue) {
		const id = this.id;
		const data = Files.data.servers;
		if(data[id] === undefined) {
			if(defaultValue === undefined) {
				return null;
			} else {
				data[id] = {};
			}
		}
		if(data[id][name] === undefined && defaultValue !== undefined) {
			data[id][name] = defaultValue;
		}
		return data[id][name];
	}

	setData(name, value) {
		const id = this.id;
		const data = Files.data.servers;
		if(data[id] === undefined) {
			data[id] = {};
		}
		data[id][name] = value;
		Files.saveData("servers");
	}

	addData(name, value) {
		const id = this.id;
		const data = Files.data.servers;
		if(data[id] === undefined) {
			data[id] = {};
		}
		if(data[id][name] === undefined) {
			this.setData(name, value);
		} else {
			this.setData(name, this.data(name) + value);
		}
	}

	convertToString() {
		return `s-${this.id}`;
	}
});

//---------------------------------------------------------------------
// Message
//---------------------------------------------------------------------

Structures.extend("Message", (Message) => class extends Message {
	constructor(client, data, channel) {
		super(client, data, channel);
	}

	convertToString() {
		return `msg-${this.id}_c-${this.channel.id}`;
	}
});

//---------------------------------------------------------------------
// TextChannel
//---------------------------------------------------------------------

Structures.extend("TextChannel", (TextChannel) => class extends TextChannel {
	constructor(guild, data) {
		super(guild, data);
	}

	overwritePerms(memberOrRole, permissions, reason) {
		const overwrites = this.permissionOverwrites.get(memberOrRole.id);
		if (overwrites) return overwrites.update(permissions, reason);
		return this.createOverwrite(memberOrRole, permissions, reason);
	}

	convertToString() {
		return `tc-${this.id}`;
	}
});

//---------------------------------------------------------------------
// VoiceChannel
//---------------------------------------------------------------------

Structures.extend("VoiceChannel", (VoiceChannel) => class extends VoiceChannel {
	constructor(guild, data) {
		super(guild, data);
	}

	overwritePerms(memberOrRole, permissions, reason) {
		const overwrites = this.permissionOverwrites.get(memberOrRole.id);
		if (overwrites) return overwrites.update(permissions, reason);
		return this.createOverwrite(memberOrRole, permissions, reason);
	}

	convertToString() {
		return `vc-${this.id}`;
	}
});

//---------------------------------------------------------------------
// CategoryChannel
//---------------------------------------------------------------------

Structures.extend("CategoryChannel", (CategoryChannel) => class extends CategoryChannel {
	constructor(guild, data) {
		super(guild, data);
	}

	overwritePerms(memberOrRole, permissions, reason) {
		const overwrites = this.permissionOverwrites.get(memberOrRole.id);
		if (overwrites) return overwrites.update(permissions, reason);
		return this.createOverwrite(memberOrRole, permissions, reason);
	}
});

//---------------------------------------------------------------------
// NewsChannel
//---------------------------------------------------------------------

Structures.extend("NewsChannel", (NewsChannel) => class extends NewsChannel {
	constructor(guild, data) {
		super(guild, data);
	}

	overwritePerms(memberOrRole, permissions, reason) {
		const overwrites = this.permissionOverwrites.get(memberOrRole.id);
		if (overwrites) return overwrites.update(permissions, reason);
		return this.createOverwrite(memberOrRole, permissions, reason);
	}
});

//---------------------------------------------------------------------
// StoreChannel
//---------------------------------------------------------------------

Structures.extend("StoreChannel", (StoreChannel) => class extends StoreChannel {
	constructor(guild, data) {
		super(guild, data);
	}

	overwritePerms(memberOrRole, permissions, reason) {
		const overwrites = this.permissionOverwrites.get(memberOrRole.id);
		if (overwrites) return overwrites.update(permissions, reason);
		return this.createOverwrite(memberOrRole, permissions, reason);
	}
});

//---------------------------------------------------------------------
// Role
//---------------------------------------------------------------------

Structures.extend("Role", (Role) => class extends Role {
	constructor(client, data, guild) {
		super(client, data, guild);
	}

	convertToString() {
		return `r-${this.id}_s-${this.guild.id}`;
	}
});

//---------------------------------------------------------------------
// Emoji
//---------------------------------------------------------------------

Structures.extend("GuildEmoji", (GuildEmoji) => class extends GuildEmoji {
	constructor(client, data, guild) {
		super(client, data, guild);
	}

	convertToString() {
		return `e-${this.id}`;
	}
});

//---------------------------------------------------------------------
// Start Bot
//---------------------------------------------------------------------

Files.startBot();
