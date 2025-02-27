import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js'
import GameModel from '../models/mongoSchema.js'
export const data = {
  name: 'mines',
  description:
    'Bet coins and try to uncover safe tiles without hitting a mine!',
  options: [
    {
      name: 'bet',
      description: 'Amount of coins to bet',
      type: 4,
      required: true,
    },
    {
      name: 'mines',
      description: 'Number of mines (1-5)',
      type: 4,
      required: true,
    },
  ],
}
const tiles = ['💎', '💰', '⭐', '🔥', '💣']
export async function execute(interaction) {
  const bet = interaction.options.get('bet')?.value
  const mineCount = interaction.options.get('mines')?.value
  const userId = interaction.user.id
  let userData = await GameModel.findOne({ userId })
  if (bet <= 0 || userData.balance < bet || mineCount < 1 || mineCount > 5) {
    const embed = new EmbedBuilder()
      .setTitle('Invalid Input')
      .setColor('#FF0000')
      .setDescription('❌ Invalid bet amount or mine count! Mines must be 1-5.')
    return interaction.reply({
      embeds: [embed],
      ephemeral: true,
    })
  }
  userData.balance -= bet
  await userData.save()
  let revealedTiles = new Set()
  let board = Array(9).fill('❓')
  let minePositions = new Set()
  while (minePositions.size < mineCount) {
    minePositions.add(Math.floor(Math.random() * 9))
  }
  const generateButtons = () => {
    return new ActionRowBuilder().addComponents(
      board.map((tile, index) =>
        new ButtonBuilder()
          .setCustomId(index.toString())
          .setLabel(tile)
          .setStyle(ButtonStyle.Secondary),
      ),
    )
  }
  const embed = new EmbedBuilder()
    .setTitle('💣 Mines Game')
    .setDescription(
      "Click a tile to reveal what's underneath! Avoid the mines!",
    )
    .setColor('#6f00e6')
  const gameMessage = await interaction.reply({
    embeds: [embed],
    components: [generateButtons()],
  })
  const collector = gameMessage.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 60000,
  })
  let winnings = 0
  let gameActive = true
  collector.on('collect', async (btnInteraction) => {
    if (btnInteraction.user.id !== interaction.user.id) {
      return btnInteraction.reply({
        content: "This isn't your game!",
        ephemeral: true,
      })
    }
    const index = parseInt(btnInteraction.customId)
    if (revealedTiles.has(index)) return
    revealedTiles.add(index)
    if (minePositions.has(index)) {
      board[index] = '💣'
      gameActive = false
      collector.stop('lost')
    } else {
      const prize = tiles[Math.floor(Math.random() * (tiles.length - 1))] // Exclude 💣
      board[index] = prize
      winnings += Math.floor(bet * 0.5)
    }
    await btnInteraction.update({
      embeds: [embed],
      components: [generateButtons()],
    })
    if (revealedTiles.size === 9 - mineCount) {
      gameActive = false
      collector.stop('won')
    }
  })
  collector.on('end', async (_, reason) => {
    if (reason === 'lost') {
      const loseEmbed = new EmbedBuilder()
        .setTitle('💥 You Hit a Mine!')
        .setDescription(`❌ You lost your bet!`)
        .setColor('#ff0000')
      await interaction.followUp({ embeds: [loseEmbed] })
    } else if (reason === 'won') {
      userData.balance += bet + winnings
      userData.wins += 1
      await userData.save()
      const winEmbed = new EmbedBuilder()
        .setTitle('🎉 You Won!')
        .setDescription(
          `✅ You cleared the board and won **${bet + winnings} coins!**`,
        )
        .setColor('#00ff00')
      await interaction.followUp({ embeds: [winEmbed] })
    }
  })
}
