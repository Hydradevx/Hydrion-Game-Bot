import { EmbedBuilder } from 'discord.js'
export const data = {
  name: 'dice',
  description: 'Roll a dice and try to win!',
  options: [
    {
      name: 'amount',
      type: 4,
      description: 'Amount to bet',
      required: true,
    },
    {
      name: 'guess',
      type: 4,
      description: 'Guess a number (1-6)',
      required: true,
      choices: [
        { name: '1', value: 1 },
        { name: '2', value: 2 },
        { name: '3', value: 3 },
        { name: '4', value: 4 },
        { name: '5', value: 5 },
        { name: '6', value: 6 },
      ],
    },
  ],
}
export async function execute(interaction, data) {
  const betAmount = interaction.options.get('amount')?.value
  const guess = interaction.options.get('guess')?.value
  if (betAmount <= 0) {
    return interaction.reply({
      content: 'You must bet a positive amount!',
      ephemeral: true,
    })
  }
  if (data.balance < betAmount) {
    return interaction.reply({
      content: "You don't have enough coins!",
      ephemeral: true,
    })
  }
  await interaction.deferReply()
  const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
  let rollingEmbed = new EmbedBuilder()
    .setTitle('🎲 Rolling the Dice...')
    .setDescription('🔄 **Rolling...**')
    .setColor('#FFFF00')
  await interaction.editReply({ embeds: [rollingEmbed] })
  await new Promise((resolve) => setTimeout(resolve, 1500))
  const rolledNumber = Math.floor(Math.random() * 6) + 1
  const rolledFace = diceFaces[rolledNumber - 1]
  let resultMessage = `**You guessed:** ${guess}\n**Dice rolled:** ${rolledFace} (${rolledNumber})`
  if (guess === rolledNumber) {
    const winnings = betAmount * 5
    data.balance += winnings
    data.wins += 1
    resultMessage += `\n\n✅ **You won ${winnings} coins!** 🎉`
    rollingEmbed.setColor('#00ff00')
  } else {
    data.balance -= betAmount
    data.losses += 1
    resultMessage += `\n\n❌ **You lost ${betAmount} coins!** Better luck next time.`
    rollingEmbed.setColor('#ff0000')
  }
  data.gamesPlayed += 1
  await data.save()
  rollingEmbed.setDescription(resultMessage)
  await interaction.editReply({ embeds: [rollingEmbed] })
}
