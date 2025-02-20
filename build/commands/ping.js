import { EmbedBuilder } from 'discord.js'
export const data = {
  name: 'ping',
  description: 'Pings the bot and shows the latency',
}
export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setTitle('Pong!')
    .setDescription(`Latency: ${Date.now() - interaction.createdTimestamp}ms`)
    .setColor('#00ff00')
  await interaction.reply({ embeds: [embed] })
}
