import { EmbedBuilder } from 'discord.js'
export const data = {
  name: 'ping',
  description: 'Pings the bot and shows the latency',
}
export async function execute(exec) {
  const latency = exec.interaction?.createdTimestamp
    ? Date.now() - exec.interaction.createdTimestamp
    : exec.message?.createdTimestamp
      ? Date.now() - exec.message.createdTimestamp
      : 0
  const embed = new EmbedBuilder()
    .setTitle('Pong!')
    .setDescription(`Latency: ${latency}ms`)
    .setColor('#00ff00')
  if (exec.interaction) {
    await exec.interaction.reply({ embeds: [embed] })
    return
  }
  if (exec.message && exec.message.channel) {
    const channel = exec.message.channel // Goofy ahh type err
    if (channel.send) {
      await channel.send({ embeds: [embed] })
    } else {
      console.error('Channel is not a valid text channel.')
    }
    return
  }
}
