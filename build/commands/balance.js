import { EmbedBuilder } from 'discord.js'
export const data = {
  name: 'balance',
  description: 'See your balance',
}
export async function execute(interaction, data) {
  const { balance, bank } = data
  const embed = new EmbedBuilder()
    .setTitle(`${interaction.user.username}'s Balance`)
    .setDescription(`💰 Wallet: ${balance}\n🏦 Bank: ${bank}`)
    .setColor('#6f00e6')
  try {
    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    console.error('Error replying to interaction:', error)
  }
}
