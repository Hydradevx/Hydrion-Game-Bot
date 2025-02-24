import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js'
import GameModel from '../models/mongoSchema.js'
export const data = {
  name: 'plinko',
  description: 'Drop a ball in Plinko and win coins!',
  options: [
    {
      name: 'bet',
      description: 'Amount of coins to bet',
      type: 4,
      required: true,
    },
  ],
}
const plinkoSlots = [
  { emoji: '💀', multiplier: 0 }, // Lose bet
  { emoji: '🔴', multiplier: 0.5 }, // Small loss
  { emoji: '🟡', multiplier: 1 }, // Break even
  { emoji: '🟢', multiplier: 2 }, // Double bet
  { emoji: '💎', multiplier: 5 }, // Huge win
]
export async function execute(interaction) {
  const bet = interaction.options.get('bet')?.value
  const userId = interaction.user.id
  let userData = await GameModel.findOne({ userId })
  if (!userData) {
    userData = new GameModel({
      userId,
      balance: 0,
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
    })
    await userData.save()
  }
  if (bet <= 0 || userData.balance < bet) {
    return interaction.reply({
      content: "❌ You don't have enough coins to bet that amount!",
      ephemeral: true,
    })
  }
  userData.balance -= bet
  await userData.save()
  const plinkoEmbed = new EmbedBuilder()
    .setTitle('🎯 Plinko Game')
    .setDescription('Drop the ball and see where it lands!')
    .setColor('#6f00e6')
  const dropButton = new ButtonBuilder()
    .setCustomId('drop')
    .setLabel('Drop Ball 🎲')
    .setStyle(ButtonStyle.Primary)
  const row = new ActionRowBuilder().addComponents(dropButton)
  const gameMessage = await interaction.reply({
    embeds: [plinkoEmbed],
    components: [row],
    fetchReply: true,
  })
  const collector = gameMessage.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 40000,
  })
  collector.on('collect', async (btnInteraction) => {
    if (btnInteraction.user.id !== interaction.user.id) {
      return btnInteraction.reply({
        content: "This isn't your game!",
        ephemeral: true,
      })
    }
    await btnInteraction.deferUpdate()
    collector.stop()
    const result = plinkoSlots[Math.floor(Math.random() * plinkoSlots.length)]
    const winnings = Math.floor(bet * result.multiplier)
    if (winnings > 0) {
      userData.balance += winnings
      userData.wins += 1
    } else {
      userData.losses += 1
    }
    userData.gamesPlayed += 1
    await userData.save()
    const resultEmbed = new EmbedBuilder()
      .setTitle('🎯 Plinko Result')
      .setDescription(
        `The ball landed on: **${result.emoji}**\n\n💰 **You won: ${winnings} coins!**`,
      )
      .setColor(result.multiplier > 0 ? '#00ff00' : '#ff0000')
    await gameMessage.edit({ embeds: [resultEmbed], components: [] })
  })
}
