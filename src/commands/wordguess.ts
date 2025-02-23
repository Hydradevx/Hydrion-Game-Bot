import { CommandInteraction, EmbedBuilder, Message } from 'discord.js'
import fetch from 'node-fetch'

export const data = {
  name: 'wordguess',
  description: 'Try to guess the missing letters of a random word with a bet!',
  options: [
    {
      name: 'amount',
      type: 4,
      description: 'Bet amount',
      required: true,
    },
  ],
}

async function getRandomWord() {
  const response = await fetch(
    'https://random-word-api.herokuapp.com/word?number=1',
  )
  const data = await response.json()
  return data[0].toUpperCase()
}

function maskWord(word: string) {
  let maskedWord = word
    .split('')
    .map((char) => (Math.random() < 0.5 ? '_' : char))
    .join('')
  if (!maskedWord.includes('_'))
    maskedWord = word[0] + '_'.repeat(word.length - 1)
  return maskedWord
}

export async function execute(interaction: CommandInteraction, data) {
  const betAmount = interaction.options.get('amount')?.value as number

  if (betAmount <= 0) {
    return interaction.reply({
      content: 'You must bet a positive amount!',
      ephemeral: true,
    })
  }

  if (data.balance < betAmount) {
    return interaction.reply({
      content: "You don't have enough coins to bet!",
      ephemeral: true,
    })
  }

  data.balance -= betAmount
  await data.save()

  const originalWord = await getRandomWord()
  const maskedWord = maskWord(originalWord)
  let attempts = 3
  const pot = betAmount * 2

  const embed = new EmbedBuilder()
    .setTitle('🧩 Word Guess')
    .setDescription(
      `Bet: **${betAmount} coins**\n\nGuess the missing letters: \`${maskedWord}\`\n\n❗ **You have 3 attempts!**\nType your guess in the chat.`,
    )
    .setColor('#FFD700')

  await interaction.reply({ embeds: [embed], fetchReply: true })

  const filter = (m: Message) => m.author.id === interaction.user.id
  const collector = interaction.channel?.createMessageCollector({
    filter,
    time: 30000,
  })

  collector?.on('collect', async (msg) => {
    const guess = msg.content.toUpperCase()

    if (guess === originalWord) {
      data.balance += pot
      data.wins += 1
      await data.save()

      const winEmbed = new EmbedBuilder()
        .setTitle('🎉 Word Guess - Correct!')
        .setDescription(
          `✅ **You guessed it right!** The word was **${originalWord}**.\n🏆 **You won ${pot} coins!**`,
        )
        .setColor('#00ff00')

      await interaction.followUp({ embeds: [winEmbed] })
      return collector?.stop()
    }

    attempts--
    if (attempts === 0) {
      const loseEmbed = new EmbedBuilder()
        .setTitle('❌ Word Guess - Out of Attempts!')
        .setDescription(
          `The correct word was **${originalWord}**.\n💸 **You lost ${betAmount} coins!**`,
        )
        .setColor('#ff0000')

      await interaction.followUp({ embeds: [loseEmbed] })
      return collector?.stop()
    }

    await interaction.followUp({
      content: `❌ Wrong guess! **${attempts} attempts left.** Try again:`,
    })
  })

  collector?.on('end', async (_, reason) => {
    if (reason === 'time') {
      const timeoutEmbed = new EmbedBuilder()
        .setTitle("⌛ Word Guess - Time's Up!")
        .setDescription(
          `You ran out of time! The correct word was **${originalWord}**.\n💸 **You lost ${betAmount} coins!**`,
        )
        .setColor('#808080')

      await interaction.followUp({ embeds: [timeoutEmbed] })
    }
  })
}
