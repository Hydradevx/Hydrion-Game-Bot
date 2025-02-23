import { EmbedBuilder } from 'discord.js'
import GameModel from '../models/mongoSchema.js'
export const data = {
  name: 'rank',
  description: "Check your rank or another user's rank on the leaderboard!",
  options: [
    {
      name: 'user',
      type: 6,
      description: 'The user to check (leave empty to check your own)',
      required: false,
    },
  ],
}
export async function execute(interaction) {
  await interaction.deferReply()
  const targetUser = interaction.options.get('user')?.user || interaction.user
  const players = await GameModel.find().sort({ balance: -1 })
  const userIndex = players.findIndex(
    (player) => player.userId === targetUser.id,
  )
  if (userIndex === -1) {
    return interaction.editReply({
      content: `<@${targetUser.id}> has no rank because they have no balance!`,
    })
  }
  const userData = players[userIndex]
  const embed = new EmbedBuilder()
    .setTitle('📊 Player Rank')
    .setDescription(
      `🏅 **<@${targetUser.id}> is ranked #${userIndex + 1}** on the leaderboard!`,
    )
    .addFields({
      name: '💰 Balance',
      value: `**${userData.balance}** coins`,
      inline: true,
    })
    .setColor('#00ff00')
  await interaction.editReply({ embeds: [embed] })
}
