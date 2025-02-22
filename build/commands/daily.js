import { EmbedBuilder } from 'discord.js'
export const data = {
  name: 'daily',
  description: 'Claim your daily reward',
}
export async function execute(interaction, data) {
  const cooldown = 24 * 60 * 60 * 1000
  const lastClaim = data.lastDaily ? new Date(data.lastDaily).getTime() : 0
  const now = Date.now()
  if (now - lastClaim < cooldown) {
    const remainingTime = cooldown - (now - lastClaim)
    const hours = Math.floor(remainingTime / (1000 * 60 * 60))
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60))
    const cooldownEmbed = new EmbedBuilder()
      .setTitle('⏳ Daily Cooldown')
      .setDescription(
        `You can claim your next daily reward in **${hours}h ${minutes}m**.`,
      )
      .setColor('#ff0000')
    return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true })
  }
  const reward = 500 + Math.floor(Math.random() * 500)
  data.balance += reward
  data.lastDaily = now
  data.dailyStreak += 1
  await data.save()
  const embed = new EmbedBuilder()
    .setTitle('🎁 Daily Reward Claimed')
    .setDescription(
      `You received **${reward}** coins!\n💰 New Balance: **${data.balance}**`,
    )
    .setColor('#6f00e6')
  try {
    await interaction.reply({ embeds: [embed] })
  } catch (error) {
    console.error('Error replying to interaction:', error)
  }
}
