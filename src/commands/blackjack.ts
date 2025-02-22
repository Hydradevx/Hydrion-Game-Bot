import {
  CommandInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} from 'discord.js'

export const data = {
  name: 'blackjack',
  description: 'Play a game of blackjack and try to win!',
  options: [
    {
      name: 'amount',
      type: 4,
      description: 'Amount to bet',
      required: true,
    },
  ],
}

const deck = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const suits = ['♠', '♥', '♦', '♣']

function getCardValue(card: string): number {
  if (['J', 'Q', 'K'].includes(card)) return 10
  if (card.startsWith('A')) return 11
  return parseInt(card)
}

function drawCard() {
  return (
    deck[Math.floor(Math.random() * deck.length)] +
    suits[Math.floor(Math.random() * suits.length)]
  )
}

function calculateHandValue(hand: string[]): number {
  let value = hand.reduce(
    (sum, card) => sum + getCardValue(card.slice(0, -1)),
    0,
  )
  let aceCount = hand.filter((card) => card.startsWith('A')).length
  while (value > 21 && aceCount > 0) {
    value -= 10
    aceCount--
  }
  return value
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

  let playerHand = [drawCard(), drawCard()]
  let dealerHand = [drawCard(), drawCard()]

  let playerValue = calculateHandValue(playerHand)
  let dealerValue = calculateHandValue(dealerHand)

  await interaction.deferReply()

  const embed = new EmbedBuilder()
    .setTitle('🃏 Blackjack')
    .setDescription('🔄 **Shuffling deck...**')
    .setColor('#FFD700')

  await interaction.editReply({ embeds: [embed] })
  await new Promise((resolve) => setTimeout(resolve, 1000))

  embed.setDescription(
    `🃏 **Dealing cards...**\n\nYou get **${playerHand[0]}**, then **${playerHand[1]}**`,
  )
  await interaction.editReply({ embeds: [embed] })
  await new Promise((resolve) => setTimeout(resolve, 1000))

  embed.setDescription(
    `🃏 **Dealing cards...**\n\nYou get **${playerHand[0]}**, **${playerHand[1]}** (**${playerValue}**)\nDealer shows **${dealerHand[0]} ❓**`,
  )
  await interaction.editReply({ embeds: [embed] })

  const hitButton = new ButtonBuilder()
    .setCustomId('hit')
    .setLabel('Hit')
    .setStyle(ButtonStyle.Primary)
  const standButton = new ButtonBuilder()
    .setCustomId('stand')
    .setLabel('Stand')
    .setStyle(ButtonStyle.Danger)
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    hitButton,
    standButton,
  )

  const message = await interaction.editReply({
    embeds: [embed],
    components: [row],
  })

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 60000,
  })

  collector.on('collect', async (i) => {
    if (i.user.id !== interaction.user.id) {
      return i.reply({
        content: "You can't play in someone else's game!",
        ephemeral: true,
      })
    }

    if (i.customId === 'hit') {
      playerHand.push(drawCard())
      playerValue = calculateHandValue(playerHand)

      embed.setDescription(
        `**Your Hand:** ${playerHand.join(' ')} (**${playerValue}**)\nDealer shows **${dealerHand[0]} ❓**`,
      )
      await i.update({ embeds: [embed] })

      if (playerValue > 21) {
        data.balance -= betAmount
        data.losses += 1
        data.gamesPlayed += 1
        await data.save()
        collector.stop()
        embed.setDescription(
          `❌ You busted with **${playerValue}**! You lost **${betAmount}** coins.`,
        )
        embed.setColor('#ff0000')
        await interaction.editReply({ embeds: [embed], components: [] })
      }
    } else if (i.customId === 'stand') {
      collector.stop()

      await new Promise((resolve) => setTimeout(resolve, 1000))
      embed.setDescription(
        `🃏 **Dealer's Turn...**\n\nDealer reveals **${dealerHand.join(' ')}** (**${dealerValue}**)`,
      )
      await interaction.editReply({ embeds: [embed], components: [] })

      while (dealerValue < 17) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        dealerHand.push(drawCard())
        dealerValue = calculateHandValue(dealerHand)
        embed.setDescription(
          `🃏 **Dealer Hits...**\n\nDealer now has **${dealerHand.join(' ')}** (**${dealerValue}**)`,
        )
        await interaction.editReply({ embeds: [embed] })
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))
      let resultMessage = `**Your Hand:** ${playerHand.join(' ')} (**${playerValue}**)\n**Dealer's Hand:** ${dealerHand.join(' ')} (**${dealerValue}**)`

      if (dealerValue > 21 || playerValue > dealerValue) {
        data.balance += betAmount
        data.wins += 1
        resultMessage += `\n\n✅ You won **${betAmount}** coins!`
        embed.setColor('#00ff00')
      } else if (playerValue < dealerValue) {
        data.balance -= betAmount
        data.losses += 1
        resultMessage += `\n\n❌ You lost **${betAmount}** coins!`
        embed.setColor('#ff0000')
      } else {
        resultMessage += `\n\n🤝 It's a tie! You keep your coins.`
        embed.setColor('#FFFF00')
      }

      data.gamesPlayed += 1
      await data.save()

      embed.setDescription(resultMessage)
      await interaction.editReply({ embeds: [embed] })
    }
  })

  collector.on('end', async (_, reason) => {
    if (reason === 'time') {
      embed.setDescription('⌛ Game timed out.')
      embed.setColor('#808080')
      await interaction.editReply({ embeds: [embed], components: [] })
    }
  })
}
