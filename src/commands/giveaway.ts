import {
  CommandInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  TextChannel,
} from 'discord.js'
import GameModel from '../models/mongoSchema.js'

export const data = {
  name: 'giveaway',
  description: 'Host a giveaway (Only for Hydra)',
  options: [
    {
      name: 'channel',
      type: 7,
      description: 'Select the channel to host the giveaway',
      required: true,
    },
    {
      name: 'amount',
      type: 4,
      description: 'Prize amount',
      required: true,
    },
  ],
}

const giveaways = new Map()

export async function execute(interaction: CommandInteraction) {
  if (interaction.user.id !== '1251647487081709682') {
    return interaction.reply({
      content: '❌ You are not authorized to start a giveaway!',
      ephemeral: true,
    })
  }

  const channel = interaction.options.get('channel')?.channel as TextChannel
  const amount = interaction.options.get('amount')?.value as number

  if (!channel.isTextBased()) {
    return interaction.reply({
      content: '❌ Please select a valid text channel!',
      ephemeral: true,
    })
  }

  const enterButton = new ButtonBuilder()
    .setCustomId('enter')
    .setLabel('🎉 Enter')
    .setStyle(ButtonStyle.Primary)
  const endButton = new ButtonBuilder()
    .setCustomId('end')
    .setLabel('❌ End Giveaway')
    .setStyle(ButtonStyle.Danger)
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    enterButton,
    endButton,
  )

  const embed = new EmbedBuilder()
    .setTitle('🎁 Giveaway Started!')
    .setDescription(
      `💰 **Prize:** ${amount} coins\n📢 **Hosted by:** ${interaction.user}\n\nClick **Enter** to participate!`,
    )
    .setColor('#FFD700')

  const message = await channel.send({ embeds: [embed], components: [row] })

  giveaways.set(message.id, {
    participants: [],
    host: interaction.user.id,
    amount,
  })

  await interaction.reply({
    content: `✅ Giveaway started in ${channel}!`,
    ephemeral: true,
  })

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 86400000,
  })

  collector.on('collect', async (i) => {
    if (i.customId === 'enter') {
      if (!giveaways.get(message.id)?.participants.includes(i.user.id)) {
        giveaways.get(message.id)?.participants.push(i.user.id)
        await i.reply({
          content: '✅ You entered the giveaway!',
          ephemeral: true,
        })
      } else {
        await i.reply({
          content: '⚠️ You are already entered!',
          ephemeral: true,
        })
      }
    }

    if (i.customId === 'end' && i.user.id === '1251647487081709682') {
      collector.stop()
    }
  })

  collector.on('end', async () => {
    const giveaway = giveaways.get(message.id)
    if (!giveaway) return

    const winnerId = giveaway.participants.length
      ? giveaway.participants[
          Math.floor(Math.random() * giveaway.participants.length)
        ]
      : null

    if (winnerId) {
      const winnerData =
        (await GameModel.findOne({ userId: winnerId })) ||
        new GameModel({ userId: winnerId })
      winnerData.balance += amount
      await winnerData.save()
    }

    const resultEmbed = new EmbedBuilder()
      .setTitle('🎊 Giveaway Ended!')
      .setDescription(
        winnerId
          ? `🏆 **Winner:** <@${winnerId}>\n💰 **Prize:** ${amount} coins`
          : '⚠️ No participants joined the giveaway.',
      )
      .setColor(winnerId ? '#00ff00' : '#ff0000')

    await message.edit({ embeds: [resultEmbed], components: [] })

    giveaways.delete(message.id)
  })
}
