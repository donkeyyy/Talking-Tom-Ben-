const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [
	new SlashCommandBuilder().setName('help').setDescription('Sends the commands list and some info!'),
	new SlashCommandBuilder().setName('bmix').setDescription('Mix weird liquids with Ben the scientist!'),
	new SlashCommandBuilder().setName('bquestion').setDescription('Asks the all known Ben a question!').addStringOption(option =>
		option.setName('question')
			.setDescription('Your question')
			.setRequired(true)),
    new SlashCommandBuilder().setName('brepeat').setDescription('Makes Ben repeat your message!').addStringOption(option =>
		option.setName('message')
			.setDescription('Your message')
			.setRequired(true)),
    new SlashCommandBuilder().setName('beat').setDescription('Makes Ben eat!'),
    new SlashCommandBuilder().setName('task').setDescription('Asks the all known Tom a question!').addStringOption(option =>
		option.setName('question')
			.setDescription('Your question')
			.setRequired(true)),
    new SlashCommandBuilder().setName('tsay').setDescription('Makes Tom repeat your message!').addStringOption(option =>
		option.setName('message')
			.setDescription('Your message')
			.setRequired(true)),
    new SlashCommandBuilder().setName('ttouch').setDescription('Makes you touch Tom!'),
    new SlashCommandBuilder().setName('tbonk').setDescription('Makes you bonk Tom!'),
    new SlashCommandBuilder().setName('tclothes').setDescription('Makes Tom change his clothes!'),
    new SlashCommandBuilder().setName('tbathroom').setDescription('Makes Tom go to the bathroom!'),
    new SlashCommandBuilder().setName('tsleep').setDescription('Makes Tom sleep!'),
    new SlashCommandBuilder().setName('tbnews').setDescription('Makes Tom or Ben the news presenters say the news!').addStringOption(option =>
		option.setName('news')
			.setDescription('Your message')
			.setRequired(true)),
    new SlashCommandBuilder().setName('tbjoin').setDescription('Makes Tom and Ben join the voice channel you are in! (yeah you can talk with them..)'),

    
]
.map(command => command.toJSON());

const clientId = ("ID_HERE")
const token = ("TOKEN_HERE")
const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
