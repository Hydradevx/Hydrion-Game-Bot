import { CommandInteraction, EmbedBuilder } from 'discord.js'

export const data = {
  name: 'roulette',
  description: 'Bet on a roulette spin and try to win!',
  options: [
    {
      name: 'bet',
      type: 3,
      description: 'Choose a color (red, black, green) or a number (0-36)',
      required: true,
    },
    {
      name: 'amount',
      type: 4,
      description: 'Amount to bet',
      required: true,
    },
  ],
}

const rouletteNumbers = [
  { number: 0, color: '🟢 Green' },
  { number: 1, color: '🔴 Red' },
  { number: 2, color: '⚫ Black' },
  { number: 3, color: '🔴 Red' },
  { number: 4, color: '⚫ Black' },
  { number: 5, color: '🔴 Red' },
  { number: 6, color: '⚫ Black' },
  { number: 7, color: '🔴 Red' },
  { number: 8, color: '⚫ Black' },
  { number: 9, color: '🔴 Red' },
  { number: 10, color: '⚫ Black' },
  { number: 11, color: '⚫ Black' },
  { number: 12, color: '🔴 Red' },
  { number: 13, color: '⚫ Black' },
  { number: 14, color: '🔴 Red' },
  { number: 15, color: '⚫ Black' },
  { number: 16, color: '🔴 Red' },
  { number: 17, color: '⚫ Black' },
  { number: 18, color: '🔴 Red' },
  { number: 19, color: '🔴 Red' },
  { number: 20, color: '⚫ Black' },
  { number: 21, color: '🔴 Red' },
  { number: 22, color: '⚫ Black' },
  { number: 23, color: '🔴 Red' },
  { number: 24, color: '⚫ Black' },
  { number: 25, color: '🔴 Red' },
  { number: 26, color: '⚫ Black' },
  { number: 27, color: '🔴 Red' },
  { number: 28, color: '⚫ Black' },
  { number: 29, color: '🔴 Red' },
  { number: 30, color: '⚫ Black' },
  { number: 31, color: '⚫ Black' },
  { number: 32, color: '🔴 Red' },
  { number: 33, color: '⚫ Black' },
  { number: 34, color: '🔴 Red' },
  { number: 35, color: '⚫ Black' },
  { number: 36, color: '🔴 Red' },
]

export async function execute(interaction: CommandInteraction, data) {
  const bet = interaction.options.get('bet')?.value as string
  const betAmount = interaction.options.get('amount')?.value as number

  if (data.balance < betAmount) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Insufficient Funds!')
          .setDescription("You don't have enough coins!")
          .setColor('#FF0000'),
      ],
      ephemeral: true,
    })
  }

  if (
    (!['red', 'black', 'green'].includes(bet.toLowerCase()) &&
      isNaN(Number(bet))) ||
    Number(bet) > 36 ||
    Number(bet) < 0
  ) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Invalid Bet!')
          .setDescription('Choose **red, black, green** or a number (0-36).')
          .setColor('#FF0000'),
      ],
      ephemeral: true,
    })
  }

  await interaction.deferReply()

  const rollingEmbed = new EmbedBuilder()
    .setTitle('🎡 Spinning the Roulette Wheel...')
    .setDescription('🔄 **The wheel is spinning...**')
    .setColor('#FFFF00')

  await interaction.editReply({ embeds: [rollingEmbed] })
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const result =
    rouletteNumbers[Math.floor(Math.random() * rouletteNumbers.length)]
  const resultNumber = result.number
  const resultColor = result.color

  let winMultiplier = 0
  let won = false
  let resultMessage = `**Winning Number:** ${resultColor} **${resultNumber}**\n**Your Bet:** ${bet}`

  if (['red', 'black', 'green'].includes(bet.toLowerCase())) {
    if (
      (bet.toLowerCase() === 'red' && result.color.includes('🔴')) ||
      (bet.toLowerCase() === 'black' && result.color.includes('⚫')) ||
      (bet.toLowerCase() === 'green' && result.color.includes('🟢'))
    ) {
      winMultiplier = bet.toLowerCase() === 'green' ? 14 : 2
      won = true
    }
  } else if (!isNaN(Number(bet)) && Number(bet) === resultNumber) {
    winMultiplier = 35
    won = true
  }

  const winnings = Math.floor(betAmount * winMultiplier)

  if (won) {
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
