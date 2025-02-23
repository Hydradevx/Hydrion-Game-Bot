import { EmbedBuilder } from 'discord.js'
import os from 'os'
import GameModel from '../models/mongoSchema.js'
export const data = {
  name: 'info',
  description:
    'View detailed information about the bot, developer, and uptime.',
}
export async function execute(interaction) {
  const botUptime = process.uptime()
  const totalSeconds = Math.floor(botUptime)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const formattedUptime = `${days}d ${hours}h ${minutes}m ${seconds}s`
  const embed = new EmbedBuilder()
    .setTitle('📊 Bot Information')
    .setDescription('Detailed statistics about the bot and its developer.')
    .addFields(
      {
        name: '👑 Developer',
        value: 'Hydra | [GitHub](https://github.com/Hydradevx)',
        inline: true,
      },
      {
        name: '🖥️ Server Count',
        value: `${interaction.client.guilds.cache.size}`,
        inline: true,
      },
      {
        name: '👥 User Count',
        value: `${await GameModel.countDocuments({})}`,
        inline: true,
      },
      { name: '⏳ Uptime', value: formattedUptime, inline: true },
      {
        name: '💾 RAM Usage',
        value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
        inline: true,
      },
      {
        name: '🌐 Platform',
        value: `${os.platform()} (${os.arch()})`,
        inline: true,
      },
      { name: '⚡ Node.js Version', value: process.version, inline: true },
      {
        name: '🔗 Useful Links',
        value:
          '[Support Server](https://discord.gg/6Tufbvnebj) | [GitHub](https://github.com/Hydrion-Tools)',
        inline: false,
      },
    )
    .setFooter({ text: 'Hydrion Bot • The best tools await you!' })
    .setColor('#6f00e6')
  await interaction.reply({ embeds: [embed] })
}
