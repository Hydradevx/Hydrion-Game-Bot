import { EmbedBuilder } from 'discord.js'
export const data = {
  name: 'coinflip',
  description: 'Bet on heads or tails',
  options: [
    {
      name: 'side',
      type: 3,
      description: 'Choose heads or tails',
      required: true,
      choices: [
        { name: 'Heads', value: 'heads' },
        { name: 'Tails', value: 'tails' },
      ],
    },
    {
      name: 'amount',
      type: 4,
      description: 'Amount to bet',
      required: true,
    },
  ],
}
export async function execute(interaction, data) {
  const betSide = interaction.options.get('side')?.value
  const betAmount = interaction.options.get('amount')?.value
  if (betAmount <= 0) {
    const embed = new EmbedBuilder()
      .setTitle('❌ Invalid Bet Amount')
      .setDescription('You must bet a positive amount!')
      .setColor('#ff0000')
    return interaction.reply({ embeds: [embed], ephemeral: true })
  }
  if (data.balance < betAmount) {
    const embed = new EmbedBuilder()
      .setTitle('❌ Insufficient Coins')
      .setDescription("You don't have enough coins to bet that amount!")
      .setColor('#ff0000')
    return interaction.reply({ embeds: [embed], ephemeral: true })
  }
  const result = Math.random() < 0.5 ? 'heads' : 'tails'
  const won = result === betSide
  if (won) {
    data.balance += betAmount
    data.wins += 1
  } else {
    data.balance -= betAmount
    data.losses += 1
  }
  data.gamesPlayed += 1
  await data.save()
  const embed = new EmbedBuilder()
    .setTitle('🪙 Coinflip Result')
    .setDescription(
      `You chose **${betSide}**\nThe coin landed on **${result}**\n${won ? `✅ You won **${betAmount}** coins!` : `❌ You lost **${betAmount}** coins!`}`,
    )
    .setColor(won ? '#00ff00' : '#ff0000')
  await interaction.reply({ embeds: [embed] })
}
