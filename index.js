const { Client, Intents, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu, MessageAttachment, MessageComponentCollector } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
const fs = require("node:fs");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const discordVoice = require("@discordjs/voice");
const config = require("./config.json");

const sounds = [];

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min);
}

/**
 *
 * @param {discord.VoiceChannel} voiceChannel
 */
async function runBen(voiceChannel) {
	if (voiceChannel == null || voiceChannel.guild.me.voice.channel) return;
	const connection = discordVoice.joinVoiceChannel({
		channelId: voiceChannel.id,
		guildId: voiceChannel.guild.id,
		adapterCreator: voiceChannel.guild.voiceAdapterCreator,
		selfDeaf: false,
	});
	const player = discordVoice.createAudioPlayer({
		behaviors: {
			noSubscriber: discordVoice.NoSubscriberBehavior.Play,
		},
	});


	connection.subscribe(player);
	if (config.RESPOND_ON_MEMBER_VOICE_STATE) {
		const speakingMap = connection.receiver.speaking;
		speakingMap.on("start", (userId) => {
			player.stop(true);
		});
		speakingMap.on("end", (userId) => {
			player.play(
				discordVoice.createAudioResource(sounds[getRandomInt(0, sounds.length)]),
				voiceChannel.id,
				voiceChannel.guild.id
			);
		});
	} else {
		player.play(
			discordVoice.createAudioResource(sounds[getRandomInt(0, sounds.length)]),
			voiceChannel.id,
			voiceChannel.guild.id
		);

		player.on("stateChange", (oldState, newState) => {
			if (
				newState.status === discordVoice.AudioPlayerStatus.Idle &&
				oldState.status !== discordVoice.AudioPlayerStatus.Idle
			) {
				setTimeout(() => {
					player.play(
						discordVoice.createAudioResource(sounds[getRandomInt(0, sounds.length)]),
						voiceChannel.id,
						voiceChannel.guild.id
					);
				}, getRandomInt(1, 4) * 1000);
			}
		});
	}
}

client.on("voiceStateUpdate", (oldState, newState) => {
	if (newState.member.user.bot) return;
	if (config.JOIN_AUTOMATICALLY && oldState.channel == null && newState.channel != null) {
		runBen(newState.channel);
	if (oldState.channelID !==  oldState.guild.me.voice.channelID || newState.channel)
		return;
	}
});

client.on("ready", (bot) => {
	console.log(`Logged in as ${bot.user.username}`);

	fs.readdir("./sounds", (err, files) => {
		if (err) return console.error(err);
		files.forEach((file) => {
			sounds.push("./sounds/" + file);
		});
	});
});

client.on('voiceStateUpdate', (oldState, newState) => {
    const { getVoiceConnection } = require('@discordjs/voice')
    const connection = getVoiceConnection(oldState.guild.id)

        // if nobody left the channel in question, return.
        if (oldState.channelId !==  oldState.guild.me.voice.channelId || newState.channel)
          return;

        // otherwise, check how many people are in the channel now
        if (oldState.channel == null) return;
        if (!oldState.channel.members.size - 1)
          setTimeout(() => {
            try {
            if (connection) connection.destroy()
            } catch (error) {
              console.log(error);
            }
           }, 1000); // (1 sec in ms)

});

//SLASH CORE
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'help') {
  const tombutton = new MessageActionRow()
  .addComponents(
    new MessageButton()
    .setURL('https://discord.gg/HVca9FXXNu')
    .setLabel('Join the Support Server')
    .setStyle('LINK'),
  );
  const helpEmbed = new MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Invite me to your server!')
	.setURL('https://discord.com/api/oauth2/authorize?client_id=968495688151363584&permissions=414464732224&redirect_uri=https%3A%2F%2Fdiscord.gg%2FHVca9FXXNu&response_type=code&scope=guilds.join%20bot')
	.setAuthor({ name: 'Talking Tom & Ben', iconURL: 'https://cdn.discordapp.com/attachments/910853085679738922/967827286210531388/Polish_20220424_192700432-modified.png', url: 'https://discord.com/api/oauth2/authorize?client_id=968495688151363584&permissions=414464732224&redirect_uri=https%3A%2F%2Fdiscord.gg%2FHVca9FXXNu&response_type=code&scope=guilds.join%20bot' })
	.setDescription('Increase the fun in your server with two pretty cute pets, Tom the cat and Ben the dog! You can even talk with them! You can see the full commands list below!')
	.setThumbnail('https://cdn.discordapp.com/attachments/910853085679738922/967827286210531388/Polish_20220424_192700432-modified.png')
	.addFields(
		{ name: 'Bens Commands', value: '/bmix - Mix weird liquids with Ben the scientist! \n/bquestion <your question> - Asks the all known Ben a question! \n/brepeat <your message> - Makes Ben repeat your message! \n/beat - Makes Ben eat!' },
		{ name: 'Toms Commands', value: '/task <your question> - Asks the all known Tom a question! \n/tsay <your message> - Makes Tom repeat your message! \n/ttouch - Makes you touch Tom! \n/tbonk - Makes you bonk Tom! \n/tclothes - Makes Tom change his clothes! \n/tbathroom - Makes Tom go to the bathroom! \n/tsleep - Makes Tom sleep!' },
    { name: 'Tom and Ben News', value: '/tbnews <your message> - Makes Tom or Ben the news presenters say the news!' },
    { name: 'Voice Channel Stuff', value: '/tbjoin - Makes Tom and Ben join the voice channel you are in! (yeah you can talk with them..)' },
    { name: 'Help Commands', value: '/help - Opens this menu!' },
	)
	.setTimestamp()
	.setFooter({ text: 'Talking Tom & Ben', iconURL: 'https://cdn.discordapp.com/attachments/910853085679738922/967827286210531388/Polish_20220424_192700432-modified.png' });
    await interaction.reply({ embeds: [helpEmbed], components: [tombutton] }).catch(() => {});
  }
  if (commandName === 'bmix') {
    const row = new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
        .setCustomId('select')
        .setPlaceholder('Select Colours')
        .addOptions([
          {
            label: 'Blue + Pink',
            emoji: '<:5192_Science:967436640261898270>',
            value: 'first_option',
          },
          {
            label: 'Cyan + Blue',
            emoji: '<:5192_Science:967436640261898270>',
            value: 'second_option',
          },
          {
            label: 'Blue + Green',
            emoji: '<:5192_Science:967436640261898270>',
            value: 'third_option',
          },
          {
            label: 'Yellow + Blue',
            emoji: '<:5192_Science:967436640261898270>',
            value: 'fourd_option',
          },
          {
            label: 'Cyan + Pink',
            emoji: '<:5192_Science:967436640261898270>',
            value: 'fiveth_option',
          },
          {
            label: 'Pink + Green',
            emoji: '<:5192_Science:967436640261898270>',
            value: 'sixth_option',
          },
          {
            label: 'Yellow + Pink',
            emoji: '<:5192_Science:967436640261898270>',
            value: 'seventh_option',
          },
          {
            label: 'Cyan + Green',
            emoji: '<:5192_Science:967436640261898270>',
            value: 'eighth_option',
          },
          {
            label: 'Yellow + Cyan',
            emoji: '<:5192_Science:967436640261898270>',
            value: 'nineth_option',
          },
          {
            label: 'Green + Yellow',
            emoji: '<:5192_Science:967436640261898270>',
            value: 'tenth_option',
          },
        ]),
    );

    const embedmixing = new MessageEmbed()
    .setColor(0x00d8ff)
    .setDescription("Pick the liquids you want to mix!")
    .setImage(
      "https://cdn.discordapp.com/attachments/963126328020836362/967430347874787358/android_screenshots_ben_2.jpg"
    )
    .setTimestamp(new Date());
  await interaction.reply({ embeds: [embedmixing], components: [row] }).catch(() => {});
  const filter = (interaction) => {
    return interaction.customId === "select";
  };

  const collector = interaction.channel.createMessageComponentCollector({
    filter,
    time: 60 * 1000,
  });

  collector.on("collect", async (interaction) => {
    if (interaction.customId === "select") {
      const selectedValue = interaction.values[0];
      if (selectedValue === "first_option") {
        const embed = new MessageEmbed()
          .setColor(0x00d8ff)
          .setDescription("Mixing blue with pink!")
          .setImage(
            "https://media.discordapp.net/attachments/954465156761534467/959899683499696249/pink-blue.gif?width=585&height=634"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embed] }).catch(() => {});
      }
      if (selectedValue === "second_option") {
        const embedtwo = new MessageEmbed()
          .setColor(0x00d8ff)
          .setDescription("Mixing cyan with blue!")
          .setImage(
            "https://media.discordapp.net/attachments/954465156761534467/959899592143560744/aqua-blue.gif?width=548&height=634"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedtwo] }).catch(() => {});
      }
      if (selectedValue === "third_option") {
        const embedthree = new MessageEmbed()
          .setColor(0x00d8ff)
          .setDescription("Mixing blue with green!")
          .setImage(
            "https://media.discordapp.net/attachments/954465156761534467/959899656509337600/green-blue.gif?width=580&height=634"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedthree] }).catch(() => {});
      }
      if (selectedValue === "fourd_option") {
        const embedfour = new MessageEmbed()
          .setColor(0x00d8ff)
          .setDescription("Mixing yellow with blue!")
          .setImage(
            "https://media.discordapp.net/attachments/954465156761534467/959899680509145138/yellow-blue.gif"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedfour] }).catch(() => {});
      }
      if (selectedValue === "fiveth_option") {
        const embedfive = new MessageEmbed()
          .setColor(0x00d8ff)
          .setDescription("Mixing cyan with pink!")
          .setImage(
            "https://media.discordapp.net/attachments/954465156761534467/959899506395213864/aqua-pink.gif?width=581&height=634"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedfive] }).catch(() => {});
      }
      if (selectedValue === "sixth_option") {
        const embedsix = new MessageEmbed()
          .setColor(0x00d8ff)
          .setDescription("Mixing pink with green!")
          .setImage(
            "https://media.discordapp.net/attachments/954465156761534467/959899590902034432/green-pink.gif?width=560&height=634"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedsix] }).catch(() => {});
      }
      if (selectedValue === "seventh_option") {
        const embedseven = new MessageEmbed()
          .setColor(0x00d8ff)
          .setDescription("Mixing yellow with pink!")
          .setImage(
            "https://media.discordapp.net/attachments/954465156761534467/959899677237592114/yellow-pink.gif?width=593&height=634"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedseven] }).catch(() => {});
      }
      if (selectedValue === "eighth_option") {
        const embedeight = new MessageEmbed()
          .setColor(0x00d8ff)
          .setDescription("Mixing cyan with green!")
          .setImage(
            "https://media.discordapp.net/attachments/954465156761534467/959899588007968838/green-aqua.gif?width=550&height=634"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedeight] }).catch(() => {});
      }
      if (selectedValue === "nineth_option") {
        const embednine = new MessageEmbed()
          .setColor(0x00d8ff)
          .setDescription("Mixing yellow with cyan!")
          .setImage(
            "https://media.discordapp.net/attachments/954465156761534467/959899499818516480/yellow-aqua.gif"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embednine] }).catch(() => {});
      }
      if (selectedValue === "tenth_option") {
        const embedten = new MessageEmbed()
          .setColor(0x00d8ff)
          .setDescription("Mixing green with yellow!")
          .setImage(
            "https://media.discordapp.net/attachments/954465156761534467/959899548908662884/yellow-green.gif"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedten] }).catch(() => {});
      }
    }
  });
  }
  if (commandName === 'bquestion') {
    const SayMessageben = interaction.options.getString('question');
    const embedrandomone = new MessageEmbed()
            .setColor(0x00d8ff)
            .setDescription("Yes")
            .setImage(
              "https://cdn.discordapp.com/attachments/963121412875358289/963125220930117673/20220411_201505.gif"
            )
            .setFooter({ text: `Question: ${(SayMessageben)}` })
            .setTimestamp(new Date());
            const embedrandomtwo = new MessageEmbed()
            .setColor(0x00d8ff)
            .setDescription("No")
            .setImage(
              "https://cdn.discordapp.com/attachments/963121412875358289/963123699026907206/phone-call.gif"
            )
            .setFooter({ text: `Question: ${(SayMessageben)}` })
            .setTimestamp(new Date());
            const embedrandomthree = new MessageEmbed()
            .setColor(0x00d8ff)
            .setDescription("Hohohoho")
            .setImage(
              "https://cdn.discordapp.com/attachments/963121412875358289/963122269574541442/talking-ben-ben.gif"
            )
            .setFooter({ text: `Question: ${(SayMessageben)}` })
            .setTimestamp(new Date());
            const embedrandomfour = new MessageEmbed()
            .setColor(0x00d8ff)
            .setDescription("Ugh")
            .setImage(
              "https://cdn.discordapp.com/attachments/963121412875358289/963124493071564901/20220411_201211.gif"
            )
            .setFooter({ text: `Question: ${(SayMessageben)}` })
            .setTimestamp(new Date());
   const randoms = [
    ({ embeds: [embedrandomone] }),
    ({ embeds: [embedrandomtwo] }),
    ({ embeds: [embedrandomthree] }),
    ({ embeds: [embedrandomfour] }),
   ];
   const response = randoms[Math.floor(Math.random() * randoms.length)];
    await interaction.reply(response).catch(() => {});
  }
  if (commandName === 'brepeat') {
    const SayMessage = interaction.options.getString('message');
    const embedrandomnew = new MessageEmbed()
          .setColor(0x00d8ff)
          .setDescription(SayMessage)
          .setImage(
            "https://cdn.discordapp.com/attachments/963121412875358289/967725588498501632/th2.jpeg"
          )
          .setTimestamp(new Date());
    const embedrandomnewtwo = new MessageEmbed()
          .setColor(0x00d8ff)
          .setDescription(SayMessage)
          .setImage(
            "https://cdn.discordapp.com/attachments/963121412875358289/967725535264403486/Screenshot_1515.png"
          )
          .setTimestamp(new Date());
          const randomssecond = [
            ({ embeds: [embedrandomnew] }),
            ({ embeds: [embedrandomnewtwo] }),
           ];
           const responsetwo = randomssecond[Math.floor(Math.random() * randomssecond.length)];
  await interaction.reply(responsetwo).catch(() => {});
  }
  if (commandName === 'task') {
  const SayMessagetom = interaction.options.getString('question');
  const embedrandomyes = new MessageEmbed()
          .setColor(0x00d8ff)
          .setDescription("Yes")
          .setImage(
            "https://cdn.discordapp.com/attachments/963337725203873854/967816437374791732/ezgif.com-gif-maker-tom1-yes.gif"
          )
          .setFooter({ text: `Question: ${(SayMessagetom)}` })
          .setTimestamp(new Date());
          const embedrandomno = new MessageEmbed()
          .setColor(0x00d8ff)
          .setDescription("No")
          .setImage(
            "https://cdn.discordapp.com/attachments/963337725203873854/967815097638584410/ezgif.com-gif-maker-tom1-no.gif"
          )
          .setFooter({ text: `Question: ${(SayMessagetom)}` })
          .setTimestamp(new Date());
 const randomsyesno = [
  ({ embeds: [embedrandomyes] }),
  ({ embeds: [embedrandomno] }),
 ];
 const responsethree = randomsyesno[Math.floor(Math.random() * randomsyesno.length)];
  await interaction.reply(responsethree).catch(() => {})
  }
  if (commandName === 'tsay') {
    const SayMessageTwo = interaction.options.getString('message');
    const embedrandomsay = new MessageEmbed()
          .setColor(0x00d8ff)
          .setDescription(SayMessageTwo)
          .setImage(
            "https://cdn.discordapp.com/attachments/957214149090344994/968133834111582238/ezgif.com-gif-makerwoooohooooooo.gif"
          )
          .setTimestamp(new Date());
    const embedrandomsaytwo = new MessageEmbed()
          .setColor(0x00d8ff)
          .setDescription(SayMessageTwo)
          .setImage(
            "https://cdn.discordapp.com/attachments/957214149090344994/968122756996685864/WipeOut13_25_2022_031352.175000.jpg"
          )
          .setTimestamp(new Date());
          const randomssay = [
            ({ embeds: [embedrandomsay] }),
            ({ embeds: [embedrandomsaytwo] }),
           ];
           const responsesay = randomssay[Math.floor(Math.random() * randomssay.length)];
  await interaction.reply(responsesay).catch(() => {});
  }
  if (commandName === 'ttouch') {
    const rowtouch = new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
        .setCustomId('selecttouch')
        .setPlaceholder('Select An Option')
        .addOptions([
          {
            label: 'Tail',
            description: 'Makes you touch Toms tail!',
            emoji: '<:cute_cat_tail:968127634636681236>',
            value: 'first_optiontouch',
          },
          {
            label: 'Belly',
            description: 'Makes you touch Toms belly!',
            emoji: '<:nekocatshrug:968128460763582554>',
            value: 'second_optiontouch',
          },
          {
            label: 'Paw',
            description: 'Makes you touch Toms paws!',
            emoji: '<:pusheenpaw:968129027095289946>',
            value: 'third_optiontouch',
          },
          {
            label: 'Pet',
            description: 'Makes you pet Tom!',
            emoji: '<:nekocathappy:968129795332378634>',
            value: 'fourth_optiontouch',
          },
        ]),
        );
        const embedtouch = new MessageEmbed()
    .setColor(0x00d8ff)
    .setDescription("Select how you want to touch Tom!")
    .setImage(
      "https://cdn.discordapp.com/attachments/957214149090344994/968122756996685864/WipeOut13_25_2022_031352.175000.jpg"
    )
    .setTimestamp(new Date());
  await interaction.reply({ embeds: [embedtouch], components: [rowtouch] }).catch(() => {});
  const filter = (interaction) => {
    return interaction.customId === "selecttouch";
  };

  const collector = interaction.channel.createMessageComponentCollector({
    filter,
    time: 60 * 1000,
  });

  collector.on("collect", async (interaction) => {
    if (interaction.customId === "selecttouch") {
      const selectedValue = interaction.values[0];
      if (selectedValue === "first_optiontouch") {
        const embedtouchone = new MessageEmbed()
          .setColor(0x00d8ff)
          .setImage(
            "https://cdn.discordapp.com/attachments/957214149090344994/967821291950329936/ezgif.com-gif-makertomannoyone.gif"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedtouchone] }).catch(() => {});
      }
      if (selectedValue === "second_optiontouch") {
        const embedtouchtwo = new MessageEmbed()
          .setColor(0x00d8ff)
          .setImage(
            "https://cdn.discordapp.com/attachments/957214149090344994/967821517939425350/ezgif.com-gif-makertomannoytwo.gif"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedtouchtwo] }).catch(() => {});
      }
      if (selectedValue === "third_optiontouch") {
        const embedtouchthree = new MessageEmbed()
          .setColor(0x00d8ff)
          .setImage(
            "https://cdn.discordapp.com/attachments/957214149090344994/967821804267778099/ezgif.com-gif-makertomannoythree.gif"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedtouchthree] }).catch(() => {});
      }
      if (selectedValue === "fourth_optiontouch") {
        const embedtouchfour = new MessageEmbed()
          .setColor(0x00d8ff)
          .setImage(
            "https://cdn.discordapp.com/attachments/957214149090344994/968123818818293790/ezgif.com-gif-makertouching.gif"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedtouchfour] }).catch(() => {});
      }
    }
  });
  }
  if (commandName === 'tbonk') {
  const rowbonking = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('bonkingone')
        .setLabel('Normal Bonk')
        .setStyle('PRIMARY')
    );
  const rowbonkingtwo = new MessageActionRow()
  .addComponents(
    new MessageButton()
    .setCustomId('bonkingtwo')
    .setLabel('HARD BONK')
    .setStyle('DANGER'),
  );
  const embedbonk = new MessageEmbed()
        .setColor(0x00d8ff)
        .setDescription('Select how hard you want the bonk to be!')
        .setImage(
        "https://cdn.discordapp.com/attachments/957214149090344994/968122756996685864/WipeOut13_25_2022_031352.175000.jpg"
        )
        .setTimestamp(new Date());
  await interaction.reply({ embeds: [embedbonk], components: [rowbonking, rowbonkingtwo] }).catch(() => {});
  const embedbonking = new MessageEmbed()
  .setColor(0x00d8ff)
  .setDescription('Ouch')
  .setImage(
  "https://cdn.discordapp.com/attachments/963120306552209418/967817873600946236/ezgif.com-gif-maker.gif"
  )
  .setTimestamp(new Date());
  const embedbonkingtwo = new MessageEmbed()
  .setColor(0x00d8ff)
  .setDescription('OUCH')
  .setImage(
  "https://cdn.discordapp.com/attachments/963120306552209418/967817424315494410/ezgif.com-gif-makertombonk.gif"
  )
  .setTimestamp(new Date());
  const collector = interaction.channel.createMessageComponentCollector();

  collector.on('collect', async i => {
  if (i.customId === 'bonkingone') {

  await i.reply({ embeds: [embedbonking], components: []  }).catch(() => {});
}
if (i.customId === 'bonkingtwo') {

  await i.reply({ embeds: [embedbonkingtwo], components: []  }).catch(() => {}).catch(() => {});
}
  });
  }
  if (commandName === 'tclothes') {
    const rowcloth = new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
        .setCustomId('selectclothes')
        .setPlaceholder('Select Clothes')
        .addOptions([
          {
            label: 'Firefighter',
            description: 'Makes Tom dress up with his Firefighter suit!',
            emoji: '<:14firefighter:967872986566782997>',
            value: 'first_optioncloth',
          },
          {
            label: 'Police Man',
            description: 'Makes Tom dress up with his police suit!',
            emoji: '<:policeman:967873016157581412>',
            value: 'second_optioncloth',
          },
          {
            label: 'Karate Man',
            description: 'Makes Tom dress up with his karate suit!',
            emoji: '<:karate:971739374180007936>',
            value: 'third_optioncloth',
          },
          {
            label: 'Businessman',
            description: 'Makes Tom dress up with his business suit!',
            emoji: '<:a_businessinquiry:971739193560666112>',
            value: 'fourth_optioncloth',
          },
        ]),
        );
        const embedclothes = new MessageEmbed()
    .setColor(0x00d8ff)
    .setDescription("Select the clothes that you want Tom to dress up with!")
    .setImage(
      "https://cdn.discordapp.com/attachments/963119542907846656/967873705919262741/Polish_20220424_224421634.png"
    )
    .setTimestamp(new Date());
    await interaction.reply({ embeds: [embedclothes], components: [rowcloth] }).catch(() => {});

  const filter = (interaction) => {
    return interaction.customId === "selectclothes";
  };

  const collector = interaction.channel.createMessageComponentCollector({
    filter,
    time: 60 * 1000,
  });

  collector.on("collect", async (interaction) => {
    if (interaction.customId === "selectclothes") {
      const selectedValue = interaction.values[0];
      if (selectedValue === "first_optioncloth") {
        const embedcloth = new MessageEmbed()
          .setColor(0x00d8ff)
          .setImage(
            "https://cdn.discordapp.com/attachments/963119227320012800/967821016577474600/ezgif.com-gif-makertomfiresmaller.gif"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedcloth] }).catch(() => {});
      }
      if (selectedValue === "second_optioncloth") {
        const embedclothtwo = new MessageEmbed()
          .setColor(0x00d8ff)
          .setImage(
            "https://cdn.discordapp.com/attachments/963119227320012800/967820053707915304/ezgif.com-gif-makertompolice.gif"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedclothtwo] }).catch(() => {});
      }
      if (selectedValue === "third_optioncloth") {
        const embedcloththree = new MessageEmbed()
          .setColor(0x00d8ff)
          .setImage(
            "https://cdn.discordapp.com/attachments/963119227320012800/971738542730534932/ezgif.com-gif-maker.gif"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedcloththree] }).catch(() => {});
      }
      if (selectedValue === "fourth_optioncloth") {
        const embedclothfour = new MessageEmbed()
          .setColor(0x00d8ff)
          .setImage(
            "https://cdn.discordapp.com/attachments/963119227320012800/971738907135836170/ezgif.com-gif-maker.gif"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedclothfour] }).catch(() => {});
      }
    }
  });
}
  if (commandName === 'tbathroom') {
      const rowbath = new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId('selectbathroom')
            .setPlaceholder('Select An Option')
            .addOptions([
              {
                label: 'Toilet',
                description: 'Makes Tom go to the toilet!',
                emoji: '<:flushedtoilet:967871137436557342>',
                value: 'first_optionbath',
              },
              {
                label: 'Shower',
                description: 'Makes Tom take a shower!',
                emoji: '<:stepha58Coldshower:967871178419089419>',
                value: 'second_optionbath',
              },
            ]),
            );
            const embedbathroom = new MessageEmbed()
        .setColor(0x00d8ff)
        .setDescription("Select what you want Tom to do in the bathroom!")
        .setImage(
          "https://cdn.discordapp.com/attachments/963119542907846656/967870144900636722/Polish_20220424_223011381.png"
        )
        .setTimestamp(new Date());
    interaction.reply({ embeds: [embedbathroom], components: [rowbath] }).catch(() => {});

  const filter = (interaction) => {
    return interaction.customId === "selectbathroom";
  };

  const collector = interaction.channel.createMessageComponentCollector({
    filter,
    time: 60 * 1000,
  });

  collector.on("collect", async (interaction) => {
    if (interaction.customId === "selectbathroom") {
      const selectedValue = interaction.values[0];
      if (selectedValue === "first_optionbath") {
        const embedbath = new MessageEmbed()
          .setColor(0x00d8ff)
          .setImage(
            "https://cdn.discordapp.com/attachments/963119934420959242/967818156775182346/ezgif.com-gif-makertomtoilet.gif"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedbath] }).catch(() => {});
      }
      if (selectedValue === "second_optionbath") {
        const embedbathtwo = new MessageEmbed()
          .setColor(0x00d8ff)
          .setImage(
            "https://cdn.discordapp.com/attachments/963119934420959242/967818426108215417/ezgif.com-gif-makertomwashing.gif"
          )
          .setTimestamp(new Date());

          await interaction.reply({ embeds: [embedbathtwo] }).catch(() => {});
      }
    }
  });
}
if (commandName === 'tsleep') {
  const rowwakingup = new MessageActionRow()
  .addComponents(
    new MessageButton()
      .setCustomId('primarywakingup')
      .setLabel('Turn On Lamp')
      .setStyle('SUCCESS')
      .setDisabled(true),
  );
const rowsleeping = new MessageActionRow()
.addComponents(
  new MessageButton()
  .setCustomId('primarysleeping')
  .setLabel('Turn Off Lamp')
  .setStyle('DANGER'),
);
const rowwakinguptwo = new MessageActionRow()
  .addComponents(
    new MessageButton()
      .setCustomId('primarywakinguptwo')
      .setLabel('Turn On Lamp')
      .setStyle('SUCCESS'),
  );
  const rowwakingupthree = new MessageActionRow()
  .addComponents(
    new MessageButton()
      .setCustomId('primarywakingupthree')
      .setLabel('Turn Off Lamp')
      .setStyle('DANGER')
      .setDisabled(true),
  );
const embedsleeping = new MessageEmbed()
      .setColor(0x00d8ff)
      .setImage(
      "https://cdn.discordapp.com/attachments/963119542907846656/967818757386948628/ezgif.com-gif-makertombed.gif"
      )
    await interaction.reply({ embeds: [embedsleeping], components: [rowsleeping, rowwakingup] }).catch(() => {});
    const embedturningoff = new MessageEmbed()
    .setColor(0x00d8ff)
    .setImage(
    "https://cdn.discordapp.com/attachments/963119542907846656/967819070357504020/ezgif.com-gif-makertomsleep.gif"
    )
    const embedturningon = new MessageEmbed()
    .setColor(0x00d8ff)
    .setImage(
    "https://cdn.discordapp.com/attachments/963119542907846656/967859464210366614/ezgif.com-gif-makertomturningonlamp.gif"
    )
    const collector = interaction.channel.createMessageComponentCollector();

    collector.on('collect', async i => {
    if (i.customId === 'primarysleeping') {

    await i.reply({ embeds: [embedturningoff], components: [rowwakingupthree, rowwakinguptwo]  }).catch(() => {});
  }
  if (i.customId === 'primarywakinguptwo') {

    await i.reply({ embeds: [embedturningon], components: [rowwakingup, rowsleeping]  }).catch(() => {});
  }
  });
}
if (commandName === 'tbnews') {
  const SayMessagenews = interaction.options.getString('news');
  const embednews = new MessageEmbed()
        .setColor(0x00d8ff)
        .setDescription(SayMessagenews)
        .setImage(
          "https://cdn.discordapp.com/attachments/971333482607411230/971340244240719882/ezgif.com-gif-maker-news.gif"
        )
        .setTimestamp(new Date());
  const embednewstwo = new MessageEmbed()
        .setColor(0x00d8ff)
        .setDescription(SayMessagenews)
        .setImage(
          "https://cdn.discordapp.com/attachments/971333482607411230/971340468749209600/ezgif.com-gif-maker-news-two.gif"
        )
        .setTimestamp(new Date());
        const randomnews = [
          ({ embeds: [embednews] }),
          ({ embeds: [embednewstwo] }),
         ];
         const responsenews = randomnews[Math.floor(Math.random() * randomnews.length)];
    await interaction.reply(responsenews).catch(() => {})
}
if (commandName === 'tbjoin') {
  const voiceChannel = interaction?.member?.voice?.channel;
  if (!voiceChannel) return interaction.reply("You are not in a voice channel!");
  const { getVoiceConnection } = require('@discordjs/voice');
  const connection = getVoiceConnection(interaction.guildId);
	if (connection) return interaction.reply("I'm already in a voice channel, please try again later when I'm free!");
	if (!voiceChannel.permissionsFor(interaction.guild.me).has("CONNECT")) return interaction.reply("I don't have permissions to join the selected voice channel!").catch(() => {});
	if (!voiceChannel.permissionsFor(interaction.guild.me).has("SPEAK")) return interaction.reply("I don't have permissions to speak in the selected voice channel!").catch(() => {});
	if (!voiceChannel.permissionsFor(interaction.guild.me).has("VIEW_CHANNEL")) return interaction.reply("I don't have permissions to join the selected voice channel!").catch(() => {});
  runBen(voiceChannel).catch(() => {})
  await interaction.reply(':white_check_mark:').catch(() => {});
}
if (commandName === 'beat') {
  const roweating = new MessageActionRow()
    .addComponents(
      new MessageSelectMenu()
        .setCustomId('selecttwo')
        .setPlaceholder('Select A Category')
        .addOptions([
          {
            label: 'Drank',
            emoji: '<:1716coronabeer:967809075733753888>',
            value: 'first_optiontwo',
          },
          {
            label: 'Beans',
            emoji: '<:Beans:967809092435476520>',
            value: 'second_optiontwo',
          },
        ]),
        );
        const embedeating = new MessageEmbed()
    .setColor(0x00d8ff)
    .setDescription("Select what you want Ben to eat or drink!")
    .setImage(
      "https://cdn.discordapp.com/attachments/963122534973317191/967810514371624980/Screenshot_1517.png"
    )
    .setTimestamp(new Date());
await interaction.reply({ embeds: [embedeating], components: [roweating] }).catch(() => {});
const filter = (interaction) => {
  return interaction.customId === "selecttwo";
};

const collector = interaction.channel.createMessageComponentCollector({
  filter,
  time: 60 * 1000,
});

collector.on("collect", async (interaction) => {
  if (interaction.customId === "selecttwo") {
    const selectedValue = interaction.values[0];
    if (selectedValue === "first_optiontwo") {
      const embedeatingtwo = new MessageEmbed()
        .setColor(0x00d8ff)
        .setImage(
          "https://cdn.discordapp.com/attachments/963122534973317191/963123890429755532/talking-ben-drinking.gif"
        )
        .setTimestamp(new Date());

        await interaction.reply({ embeds: [embedeatingtwo] }).catch(() => {});
    }
    if (selectedValue === "second_optiontwo") {
      const embedeatingthree = new MessageEmbed()
        .setColor(0x00d8ff)
        .setImage(
          "https://cdn.discordapp.com/attachments/963122534973317191/963125492855222292/talking-ben-eating.gif"
        )
        .setTimestamp(new Date());

        await interaction.reply({ embeds: [embedeatingthree] }).catch(() => {});
    }
  }
});
}
});

client.login("TOKEN_HERE");

client.on('ready', () => {
  client.user.setActivity(`/help ( / is a slash command )`, { type: 'WATCHING' });
  });
  client.on("warn", console.warn);
  client.on("error", console.error);
