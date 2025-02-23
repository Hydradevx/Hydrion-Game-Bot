import { CommandInteraction, EmbedBuilder, Message } from 'discord.js'
import axios from 'axios'
import GameModel from '../models/mongoSchema.js'

export const data = {
  name: 'fasttype',
  description: 'Type as many words as possible in 30 seconds and earn coins!',
}

async function getRandomWords(): Promise<string[]> {
  try {
    const response = await axios.get(
      'https://random-word-api.herokuapp.com/word?number=150',
    )
    return response.data
  } catch (error) {
    console.error('Error fetching words:', error)
    return ['fuck', 'off']
  }
}

export async function execute(interaction: CommandInteraction) {
  const words = await getRandomWords()
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

  let wordIndex = 0
  let wordsTyped = 0
  let timeLeft = 30
  let gameActive = true

  const embed = new EmbedBuilder()
    .setTitle('⌨️ FastType Challenge')
    .setDescription(
      `Type the words as fast as possible! You have **${timeLeft} seconds**!\n\n**Word:** \`${words[wordIndex]}\``,
    )
    .setColor('#6f00e6')

  const message = await interaction.reply({ embeds: [embed], fetchReply: true })

  const filter = (msg: Message) => msg.author.id === interaction.user.id
  const collector = interaction.channel?.createMessageCollector({
    filter,
    time: timeLeft * 1000,
  })

  const timer = setInterval(async () => {
    timeLeft = timeLeft - 5
    if (!gameActive) {
      clearInterval(timer)
      return
    }

    const updatedEmbed = new EmbedBuilder()
      .setTitle('⌨️ FastType Challenge')
      .setDescription(
        `Type as fast as you can!\n\n⏳ **Time Left: ${timeLeft} seconds**\n\n**Word:** \`${words[wordIndex]}\``,
      )
      .setColor('#6f00e6')

    await message.edit({ embeds: [updatedEmbed] })
  }, 5000)

  collector?.on('collect', async (msg) => {
    if (!gameActive) return

    if (msg.content.trim().toLowerCase() === words[wordIndex].toLowerCase()) {
      wordsTyped++
      wordIndex++

      const updatedEmbed = new EmbedBuilder()
        .setTitle('⌨️ FastType Challenge')
        .setDescription(
          `✅ Correct! Next word:\n\n**Word:** \`${words[wordIndex]}\`\n\n⏳ **Time Left: ${timeLeft} seconds**`,
        )
        .setColor('#6f00e6')

      await message.edit({ embeds: [updatedEmbed] })
    }
  })

  collector?.on('end', async () => {
    gameActive = false
    clearInterval(timer)

    userData.balance += wordsTyped
    userData.gamesPlayed += 1
    await userData.save()

    const resultEmbed = new EmbedBuilder()
      .setTitle('⌨️ FastType Results')
      .setDescription(
        `You typed **${wordsTyped}** words correctly!\n\n💰 **You earned ${wordsTyped} coins!**`,
      )
      .setColor(wordsTyped > 0 ? '#00ff00' : '#ff0000')

    await interaction.followUp({ embeds: [resultEmbed] }).catch(() => {
      interaction.user.send({ embeds: [resultEmbed] }).catch(console.error)
    })
  })
}
