import { CommandInteraction, EmbedBuilder } from 'discord.js'

export const data = {
  name: 'help',
  description: 'Get information about the bot and its commands!',
}

export async function execute(interaction: CommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle('🤖 Hydrion Bot Help')
    .setDescription('Welcome to Hydrion Bot! Here’s what I can do:')
    .addFields(
      {
        name: '📜 Commands',
        value: 'Use `/list-all-commands` to see all available commands.',
      },
      {
        name: '💰 Economy System',
        value: 'Earn coins, gamble, and compete on the leaderboard!',
      },
      {
        name: '🎲 Fun & Minigames',
        value: 'Play blackjack, slots, dice, and more!',
      },
      {
        name: '🔗 Useful Links',
        value:
          '[Support Server](https://discord.gg/6Tufbvnebj) | [GitHub](https://github.com/Hydradevx)',
      },
    )
    .setFooter({ text: 'Hydrion Bot • The best tools await you!' })
    .setColor('#6f00e6')

  await interaction.reply({ embeds: [embed] })
}
