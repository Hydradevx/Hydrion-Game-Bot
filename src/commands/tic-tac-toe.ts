import {
  CommandInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
  User,
} from 'discord.js'
import GameModel from '../models/mongoSchema.js'

export const data = {
  name: 'tic-tac-toe',
  description: 'Challenge another user for a Tic-Tac-Toe bet!',
  options: [
    {
      name: 'opponent',
      type: 6,
      description: 'Select the user you want to challenge',
      required: true,
    },
    {
      name: 'amount',
      type: 4,
      description: 'Bet amount',
      required: true,
    },
  ],
}

const emptyBoard = ['⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜']
const winningCombinations = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export async function execute(interaction: CommandInteraction) {
  const opponent = interaction.options.get('opponent')?.user as User
  const betAmount = interaction.options.get('amount')?.value as number
  const user1 = interaction.user
  const user2 = opponent

  if (!user2 || user2.bot || user1.id === user2.id) {
    return interaction.reply({
      content: 'You must challenge a real user!',
      ephemeral: true,
    })
  }

  const [user1Data, user2Data] = await Promise.all([
    GameModel.findOne({ userId: user1.id }),
    GameModel.findOne({ userId: user2.id }),
  ])

  if (!user1Data || user1Data.balance < betAmount) {
    return interaction.reply({
      content: "You don't have enough coins to bet!",
      ephemeral: true,
    })
  }
  if (!user2Data || user2Data.balance < betAmount) {
    return interaction.reply({
      content: `${user2.username} doesn't have enough coins to accept the bet!`,
      ephemeral: true,
    })
  }

  const acceptButton = new ButtonBuilder()
    .setCustomId('accept')
    .setLabel('✅ Accept')
    .setStyle(ButtonStyle.Success)
  const declineButton = new ButtonBuilder()
    .setCustomId('decline')
    .setLabel('❌ Decline')
    .setStyle(ButtonStyle.Danger)
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    acceptButton,
    declineButton,
  )

  const challengeEmbed = new EmbedBuilder()
    .setTitle('🎮 Tic-Tac-Toe Challenge')
    .setDescription(
      `${user2}, do you accept the challenge for **${betAmount} coins**?`,
    )
    .setColor('#FFD700')

  const message = await interaction.reply({
    content: `${user2}`,
    embeds: [challengeEmbed],
    components: [row],
  })

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 30000,
  })

  collector.on('collect', async (i) => {
    if (i.user.id !== user2.id) {
      return i.reply({
        content: 'You are not the challenged player!',
        ephemeral: true,
      })
    }

    if (i.customId === 'decline') {
      challengeEmbed
        .setDescription(`${user2} **declined** the challenge. ❌`)
        .setColor('#ff0000')
      await interaction.editReply({ embeds: [challengeEmbed], components: [] })
      return collector.stop()
    }

    if (i.customId === 'accept') {
      await startGame(
        interaction,
        user1,
        user2,
        betAmount,
        user1Data,
        user2Data,
      )
      return collector.stop()
    }
  })

  collector.on('end', async (_, reason) => {
    if (reason === 'time') {
      challengeEmbed
        .setDescription(`${user2} did not respond in time. ⏳`)
        .setColor('#808080')
      await interaction.editReply({ embeds: [challengeEmbed], components: [] })
    }
  })
}

async function startGame(
  interaction: CommandInteraction,
  user1: User,
  user2: User,
  betAmount: number,
  user1Data: any,
  user2Data: any,
) {
  user1Data.balance -= betAmount
  user2Data.balance -= betAmount
  await Promise.all([user1Data.save(), user2Data.save()])

  const pot = betAmount * 2
  let board = [...emptyBoard]
  let currentPlayer = user1
  let moves = 0

  const buttons = board.map((_, i) =>
    new ButtonBuilder()
      .setCustomId(i.toString())
      .setLabel('⬜')
      .setStyle(ButtonStyle.Secondary),
  )

  const createRows = () => [
    new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.slice(0, 3)),
    new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.slice(3, 6)),
    new ActionRowBuilder<ButtonBuilder>().addComponents(buttons.slice(6, 9)),
  ]

  const embed = new EmbedBuilder()
    .setTitle('🎮 Tic-Tac-Toe')
    .setDescription(
      `**Bet: ${betAmount} coins each (Pot: ${pot} coins)**\n\nTurn: **${currentPlayer.username}** (❌)`,
    )
    .setColor('#FFD700')

  const message = await interaction.editReply({
    embeds: [embed],
    components: createRows(),
  })

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 60000,
  })

  collector.on('collect', async (i) => {
    if (i.user.id !== currentPlayer.id) {
      return i.reply({ content: "It's not your turn!", ephemeral: true })
    }

    const index = parseInt(i.customId)
    if (board[index] !== '⬜') {
      return i.reply({
        content: 'This spot is already taken!',
        ephemeral: true,
      })
    }

    board[index] = currentPlayer.id === user1.id ? '❌' : '⭕'
    buttons[index]
      .setLabel(board[index])
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true)

    if (checkWinner(board)) {
      const winner = currentPlayer.id === user1.id ? user1 : user2
      const winnerData = currentPlayer.id === user1.id ? user1Data : user2Data
      winnerData.balance += pot
      winnerData.wins += 1
      await winnerData.save()

      embed
        .setDescription(
          `🎉 **${winner.username} wins!**\n🏆 **They won ${pot} coins!**`,
        )
        .setColor('#00ff00')
      await interaction.editReply({ embeds: [embed], components: createRows() })
      return collector.stop()
    }

    moves++
    if (moves === 9) {
      user1Data.balance += betAmount
      user2Data.balance += betAmount
      await Promise.all([user1Data.save(), user2Data.save()])

      embed
        .setDescription(`🤝 **It's a tie!**\n🎲 **Bet refunded**`)
        .setColor('#FFFF00')
      await interaction.editReply({ embeds: [embed], components: createRows() })
      return collector.stop()
    }

    currentPlayer = currentPlayer.id === user1.id ? user2 : user1
    embed.setDescription(
      `**Bet: ${betAmount} coins each (Pot: ${pot} coins)**\n\nTurn: **${currentPlayer.username}** (${currentPlayer.id === user1.id ? '❌' : '⭕'})`,
    )
    await interaction.editReply({ embeds: [embed], components: createRows() })

    i.deferUpdate()
  })

  collector.on('end', async (_, reason) => {
    if (reason === 'time') {
      user1Data.balance += betAmount
      user2Data.balance += betAmount
      await Promise.all([user1Data.save(), user2Data.save()])

      embed
        .setDescription('⌛ Game timed out! Bet refunded.')
        .setColor('#808080')
      await interaction.editReply({ embeds: [embed], components: [] })
    }
  })
}

function checkWinner(board: string[]) {
  return winningCombinations.some(
    (combo) =>
      board[combo[0]] !== '⬜' &&
      board[combo[0]] === board[combo[1]] &&
      board[combo[1]] === board[combo[2]],
  )
}
