import { EmbedBuilder } from 'discord.js'
import GameModel from '../models/mongoSchema.js'
export const data = {
  name: 'stats',
  description: "View your stats or another user's stats!",
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
  let userData = await GameModel.findOne({ userId: targetUser.id })
  if (!userData) {
    return interaction.editReply({
      content: `<@${targetUser.id}> has no recorded stats yet!`,
    })
  }
  const embed = new EmbedBuilder()
    .setTitle(`📊 Stats for ${targetUser.username}`)
    .setDescription(`Here are <@${targetUser.id}>'s game statistics.`)
    .addFields(
      { name: '🏆 Rank', value: `Fetching...`, inline: true },
      {
        name: '💰 Balance',
        value: `**${userData.balance}** coins`,
        inline: true,
      },
      {
        name: '🎮 Games Played',
        value: `**${userData.gamesPlayed}**`,
        inline: true,
      },
      { name: '✅ Wins', value: `**${userData.wins}**`, inline: true },
      { name: '❌ Losses', value: `**${userData.losses}**`, inline: true },
      {
        name: '📊 Win Rate',
        value: `${userData.gamesPlayed > 0 ? ((userData.wins / userData.gamesPlayed) * 100).toFixed(2) : '0'}%`,
        inline: true,
      },
    )
    .setColor('#00ff00')
  const players = await GameModel.find().sort({ balance: -1 })
  const userIndex = players.findIndex(
    (player) => player.userId === targetUser.id,
  )
  if (userIndex !== -1) {
    embed.spliceFields(0, 1, {
      name: '🏆 Rank',
      value: `#${userIndex + 1}`,
      inline: true,
    })
  }
  await interaction.editReply({ embeds: [embed] })
}
