import { CommandInteraction, EmbedBuilder, ColorResolvable } from 'discord.js'

export const data = {
  name: 'rps',
  description: 'Play Rock Paper Scissors against the bot!',
  options: [
    {
      name: 'choice',
      type: 3,
      description: 'Choose rock, paper, or scissors',
      required: true,
      choices: [
        { name: 'Rock', value: 'rock' },
        { name: 'Paper', value: 'paper' },
        { name: 'Scissors', value: 'scissors' },
      ],
    },
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
  const userChoice = interaction.options.get('choice')?.value as string
  const choices = ['rock', 'paper', 'scissors']
  const botChoice = choices[Math.floor(Math.random() * choices.length)]

  if (betAmount <= 0) {
    return interaction.reply({
      content: 'You must bet a positive amount!',
      ephemeral: true,
    })
  }

  if (data.balance < betAmount) {
    return interaction.reply({
      content: "You don't have enough coins!",
      ephemeral: true,
    })
  }

  await interaction.deferReply()

  let result = ''
  let color: ColorResolvable = '#FF0000'
  let winnings = 0

  if (userChoice === botChoice) {
    result = "🤝 It's a tie! You keep your coins."
    color = '#FFFF00'
  } else if (
    (userChoice === 'rock' && botChoice === 'scissors') ||
    (userChoice === 'paper' && botChoice === 'rock') ||
    (userChoice === 'scissors' && botChoice === 'paper')
  ) {
    winnings = betAmount
    data.balance += winnings
    data.wins += 1
    result = `✅ You won **${winnings} coins!** 🎉`
    color = '#00ff00'
  } else {
    data.balance -= betAmount
    data.losses += 1
    result = `❌ You lost **${betAmount} coins!**`
    color = '#ff0000'
  }

  data.gamesPlayed += 1
  await data.save()

  const embed = new EmbedBuilder()
    .setTitle('✊🖐️✌️ Rock Paper Scissors')
    .setDescription(
      `**You chose:** ${userChoice}\n**Bot chose:** ${botChoice}\n\n${result}`,
    )
    .setColor(color)

  await interaction.editReply({ embeds: [embed] })
}
