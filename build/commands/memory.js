import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js'
import GameModel from '../models/mongoSchema.js'
export const data = {
  name: 'memory',
  description:
    'Bet coins and test your memory by clicking the correct sequence of emojis!',
  options: [
    {
      name: 'amount',
      description: 'Amount of coins to bet',
      type: 4,
      required: true,
    },
  ],
}
const emojis = ['🍎', '🍌', '🍉', '🍇', '🍓', '🍒', '🥭', '🥝', '🍍', '🍑']
function getRandomSequence(length) {
  return Array.from(
    { length },
    () => emojis[Math.floor(Math.random() * emojis.length)],
  )
}
export async function execute(interaction) {
  const bet = interaction.options.get('amount').value
  const userId = interaction.user.id
  let userData = await GameModel.findOne({ userId })
  if (bet <= 0 || userData.balance < bet) {
    return interaction.reply({
      content: "❌ You don't have enough coins to bet that amount!",
      ephemeral: true,
    })
  }
  userData.balance -= bet
  await userData.save()
  const sequenceLength = 5
  const correctSequence = getRandomSequence(sequenceLength)
  let userSequence = []
  let gameActive = true
  const embed = new EmbedBuilder()
    .setTitle('🧠 Memory Game')
    .setDescription(
      `You bet **${bet} coins**!\n\nMemorize this sequence:\n\n**${correctSequence.join(' ')}**\n\nYou have **10 seconds**!`,
    )
    .setColor('#6f00e6')
  const memoryMessage = await interaction.reply({
    embeds: [embed],
    fetchReply: true,
  })
  setTimeout(async () => {
    const gameEmbed = new EmbedBuilder()
      .setTitle('🧠 Memory Game')
      .setDescription('Click the emojis in the correct order!')
      .setColor('#6f00e6')
    const emojiButtons = emojis.map((emoji) =>
      new ButtonBuilder()
        .setCustomId(emoji)
        .setLabel(emoji)
        .setStyle(ButtonStyle.Secondary),
    )
    const buttonRows = [
      new ActionRowBuilder().addComponents(...emojiButtons.slice(0, 5)),
      new ActionRowBuilder().addComponents(...emojiButtons.slice(5, 10)),
    ]
    await memoryMessage.edit({ embeds: [gameEmbed], components: buttonRows })
    const collector = memoryMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 15000,
    })
    collector.on('collect', async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) {
        return btnInteraction.reply({
          content: "This isn't your game!",
          ephemeral: true,
        })
      }
      userSequence.push(btnInteraction.customId)
      await btnInteraction.deferUpdate()
      if (userSequence.length === sequenceLength) {
        gameActive = false
        collector.stop()
      }
    })
    collector.on('end', async () => {
      gameActive = false
      const isCorrect = userSequence.join(' ') === correctSequence.join(' ')
      if (isCorrect) {
        userData.balance += bet * 2
        userData.wins += 1
      } else {
        userData.losses += 1
      }
      userData.gamesPlayed += 1
      await userData.save()
      const resultEmbed = new EmbedBuilder()
        .setTitle(isCorrect ? '✅ You Won!' : '❌ You Lost!')
        .setDescription(
          isCorrect
            ? `You correctly remembered the sequence!\n\n💰 **You won ${bet * 2} coins!**`
            : `You got it wrong!\n\n❌ Your Sequence: **${userSequence.join(' ') || 'None'}**\n✅ Correct Sequence: **${correctSequence.join(' ')}**`,
        )
        .setColor(isCorrect ? '#00ff00' : '#ff0000')
      await memoryMessage.edit({ embeds: [resultEmbed], components: [] })
    })
  }, 10000)
}
