import { CommandInteraction, EmbedBuilder, Message } from 'discord.js'
import axios from 'axios'

export const data = {
  name: 'hangman',
  description: 'Play a game of Hangman and guess the word letter by letter!',
}

async function getRandomWord(): Promise<string> {
  try {
    const response = await axios.get(
      'https://random-word-api.herokuapp.com/word?number=1',
    )
    return response.data[0].toLowerCase()
  } catch (error) {
    console.error('Error fetching word:', error)
    return 'fallback'
  }
}

export async function execute(interaction: CommandInteraction) {
  const word = await getRandomWord()
  let guessedWord = '_ '.repeat(word.length).trim()
  let attempts = 6
  let guessedLetters: string[] = []

  const embed = new EmbedBuilder()
    .setTitle('🎭 Hangman Game')
    .setDescription(
      `**Word:** \`${guessedWord}\`\n\n💀 Attempts left: **${attempts}**\n\n🔤 Guess letters one by one!`,
    )
    .setColor('#ffcc00')

  const message = await interaction.reply({ embeds: [embed], fetchReply: true })

  const filter = (msg: Message) =>
    msg.author.id === interaction.user.id && /^[a-zA-Z]$/.test(msg.content)
  const collector = interaction.channel?.createMessageCollector({
    filter,
    time: 600000,
  })

  collector?.on('collect', async (msg) => {
    const letter = msg.content.toLowerCase()
    if (guessedLetters.includes(letter)) return

    guessedLetters.push(letter)

    if (word.includes(letter)) {
      guessedWord = word
        .split('')
        .map((char) => (guessedLetters.includes(char) ? char : '_'))
        .join(' ')
    } else {
      attempts--
    }

    if (!guessedWord.includes('_')) {
      collector.stop('won')
    } else if (attempts === 0) {
      collector.stop('lost')
    }

    const updatedEmbed = new EmbedBuilder()
      .setTitle('🎭 Hangman Game')
      .setDescription(
        `**Word:** \`${guessedWord}\`\n\n💀 Attempts left: **${attempts}**\n\n🔤 Guessed: ${guessedLetters.join(', ')}`,
      )
      .setColor(attempts > 0 ? '#ffcc00' : '#ff0000')

    await message.edit({ embeds: [updatedEmbed] })
  })

  collector?.on('end', async (_, reason) => {
    if (reason === 'won') {
      const winEmbed = new EmbedBuilder()
        .setTitle('🎉 You Won!')
        .setDescription(`✅ The word was **${word}**!`)
        .setColor('#00ff00')
      await interaction.followUp({ embeds: [winEmbed] })
    } else if (reason === 'lost') {
      const loseEmbed = new EmbedBuilder()
        .setTitle('💀 You Lost!')
        .setDescription(`❌ The correct word was **${word}**.`)
        .setColor('#ff0000')
      await interaction.followUp({ embeds: [loseEmbed] })
    }
  })
}
