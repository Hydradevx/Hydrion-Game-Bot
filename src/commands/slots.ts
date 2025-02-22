import { CommandInteraction, EmbedBuilder } from 'discord.js'

export const data = {
  name: 'slots',
  description: 'Spin the slot machine and try your luck!',
  options: [
    {
      name: 'amount',
      type: 4,
      description: 'Amount to bet',
      required: true,
    },
  ],
}

export async function execute(interaction: CommandInteraction, data) {
  const betAmount = interaction.options.get('amount')?.value as number

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

  const symbols = ['🍒', '🍋', '🍉', '⭐', '💎']
  const spinAnimation = [
    ['⬜', '⬜', '⬜'],
    ['🔄', '⬜', '⬜'],
    ['🔄', '🔄', '⬜'],
    ['🔄', '🔄', '🔄'],
  ]

  await interaction.deferReply()

  const getSlotResult = () => [
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ]

  let embed = new EmbedBuilder().setTitle('🎰 Slot Machine').setColor('#FFFF00')

  for (let i = 0; i < spinAnimation.length; i++) {
    embed.setDescription(
      `**${spinAnimation[i].join(' | ')}**\n\n🎲 Spinning...`,
    )
    await interaction.editReply({ embeds: [embed] })
    await new Promise((resolve) => setTimeout(resolve, 700))
  }

  const slots = getSlotResult()
  let winMultiplier = 0

  if (slots[0] === slots[1] && slots[1] === slots[2]) {
    winMultiplier = symbols.indexOf(slots[0]) + 2
  } else if (slots[0] === slots[1] || slots[1] === slots[2]) {
    winMultiplier = 1.5
  }

  const winnings = Math.floor(betAmount * winMultiplier)
  const won = winnings > 0

  if (won) {
    data.balance += winnings
    data.wins += 1
  } else {
    data.balance -= betAmount
    data.losses += 1
  }

  data.gamesPlayed += 1
  await data.save()

  embed.setDescription(
    `**${slots.join(' | ')}**\n\n${won ? `✅ You won **${winnings}** coins!` : `❌ You lost **${betAmount}** coins!`}`,
  )
  embed.setColor(won ? '#00ff00' : '#ff0000')

  await interaction.editReply({ embeds: [embed] })
}
