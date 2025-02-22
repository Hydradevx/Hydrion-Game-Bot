import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} from 'discord.js'
import GameModel from '../models/mongoSchema.js'
export const data = {
  name: 'reset',
  description: 'Reset your game stats',
}
export async function execute(interaction, data) {
  const embed = new EmbedBuilder()
    .setTitle('⚠️ Confirm Reset')
    .setDescription(
      'Are you sure you want to reset your data? This action **cannot** be undone.',
    )
    .setColor('#ff0000')
  const confirmButton = new ButtonBuilder()
    .setCustomId('confirm')
    .setLabel('Confirm')
    .setStyle(ButtonStyle.Danger)
  const cancelButton = new ButtonBuilder()
    .setCustomId('cancel')
    .setLabel('Cancel')
    .setStyle(ButtonStyle.Secondary)
  const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton)
  const message = await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true,
  })
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 15000,
  })
  collector.on('collect', async (i) => {
    if (i.user.id !== interaction.user.id) {
      return i.reply({
        content: "You can't confirm someone else's reset!",
        ephemeral: true,
      })
    }
    if (i.customId === 'confirm') {
      await GameModel.deleteOne({ userId: interaction.user.id })
      await i.update({
        content: '✅ Your data has been reset!',
        embeds: [],
        components: [],
      })
    } else {
      await i.update({
        content: '❌ Reset cancelled.',
        embeds: [],
        components: [],
      })
    }
    collector.stop()
  })
  collector.on('end', async (_, reason) => {
    if (reason === 'time') {
      await interaction.editReply({
        content: '⌛ Reset timed out.',
        embeds: [],
        components: [],
      })
    }
  })
}
