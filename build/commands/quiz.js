import {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} from 'discord.js'
import fetch from 'node-fetch'
export const data = {
  name: 'quiz',
  description: 'Answer a trivia question and win coins!',
  options: [
    {
      name: 'amount',
      type: 4,
      description: 'Amount to bet',
      required: true,
    },
  ],
}
async function getTriviaQuestion() {
  const response = await fetch(
    'https://opentdb.com/api.php?amount=1&type=multiple',
  )
  const questionUrl = await response.json()
  const questionData = questionUrl.results[0]
  const question = questionData.question
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
  const correctAnswer = questionData.correct_answer
  const options = [...questionData.incorrect_answers, correctAnswer].sort(
    () => Math.random() - 0.5,
  )
  return { question, options, correctAnswer }
}
export async function execute(interaction, data) {
  const { question, options, correctAnswer } = await getTriviaQuestion()
  const bet = interaction.options.get('amount')?.value
  const buttons = options.map((option) =>
    new ButtonBuilder()
      .setCustomId(option)
      .setLabel(option)
      .setStyle(ButtonStyle.Secondary),
  )
  const row = new ActionRowBuilder().addComponents(buttons)
  const embed = new EmbedBuilder()
    .setTitle('🧠 Quiz Time!')
    .setDescription(`**${question}**`)
    .setColor('#FFD700')
  const message = await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral: true,
  })
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 30000,
  })
  collector.on('collect', async (i) => {
    if (i.user.id !== interaction.user.id) {
      return i.reply({
        content: "You can't answer someone else's quiz!",
        ephemeral: true,
      })
    }
    if (i.customId === correctAnswer) {
      data.balance += bet
      data.wins += 1
      await data.save()
      embed
        .setDescription(`✅ Correct! You won **${bet} coins!** 🎉`)
        .setColor('#00ff00')
    } else {
      data.losses += 1
      await data.save()
      embed
        .setDescription(
          `❌ Wrong! The correct answer was **${correctAnswer}**.`,
        )
        .setColor('#ff0000')
      data.balance -= bet
    }
    await i.update({ embeds: [embed], components: [] })
    collector.stop()
  })
  collector.on('end', async (_, reason) => {
    if (reason === 'time') {
      embed
        .setDescription("⌛ Time's up! You didn't answer in time.")
        .setColor('#808080')
      await interaction.editReply({ embeds: [embed], components: [] })
    }
  })
}
