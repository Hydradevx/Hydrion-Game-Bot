import { EmbedBuilder } from 'discord.js'
import GameModel from '../models/mongoSchema.js'
export const data = {
  name: 'leaderboard',
  description: 'Check the top 10 richest players!',
}
export async function execute(interaction) {
  await interaction.deferReply()
  const topPlayers = await GameModel.find().sort({ balance: -1 }).limit(10)
  if (!topPlayers.length) {
    return interaction.editReply({
      content: 'No leaderboard data available yet!',
    })
  }
  const embed = new EmbedBuilder()
    .setTitle('🏆 Leaderboard')
    .setDescription('Top 10 richest players!')
    .setColor('#FFD700')
  topPlayers.forEach((player, index) => {
    embed.addFields({
      name: `#${index + 1} - <@${player.userId}>`,
      value: `💰 Balance: **${player.balance}** coins`,
      inline: false,
    })
  })
  await interaction.editReply({ embeds: [embed] })
}
