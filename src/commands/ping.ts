import { CommandInteraction, EmbedBuilder } from 'discord.js'

export const data = {
  name: 'ping',
  description: 'Pings the bot and shows the latency',
}

export async function execute(interaction: CommandInteraction) {
  const latency = Date.now() - interaction.createdTimestamp

  const embed = new EmbedBuilder()
    .setTitle('Pong!')
    .setDescription(`Latency: ${latency}ms`)
    .setColor('#00ff00')

  try {
    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    console.error('Error replying to interaction:', error)
  }
}
