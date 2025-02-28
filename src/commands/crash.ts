import {
  CommandInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} from 'discord.js'

export const data = {
  name: 'crash',
  description: 'Bet on the multiplier and cash out before it crashes!',
  options: [
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

  await interaction.deferReply()

  let multiplier = 1.0
  let crashPoint = (Math.random() * 2.99 + 0.01).toFixed(2) // Crash between 0.01x and 3.00x
  let cashedOut = false

  const cashoutButton = new ButtonBuilder()
    .setCustomId('cashout')
    .setLabel('💰 Cash Out')
    .setStyle(ButtonStyle.Success)
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(cashoutButton)

  let embed = new EmbedBuilder()
    .setTitle('🚀 Crash Game')
    .setDescription(
      `Starting at **0.01x**...\n\n💰 **Click "Cash Out" before the crash!**`,
    )
    .setColor('#FFD700')

  const message = await interaction.editReply({
    embeds: [embed],
    components: [row],
  })

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 120000,
  })

  collector.on('collect', async (i) => {
    if (i.user.id !== interaction.user.id) {
      return i.reply({
        content: "You can't cash out someone else's game!",
        ephemeral: true,
      })
    }

    if (!cashedOut && multiplier < parseFloat(crashPoint)) {
      cashedOut = true
      const winnings = Math.floor(betAmount * multiplier)
      data.balance += winnings
      data.wins += 1
      data.gamesPlayed += 1
      await data.save()

      embed
        .setDescription(
          `✅ **You cashed out at ${multiplier.toFixed(2)}x!**\n💰 **You won ${winnings} coins!** 🎉`,
        )
        .setColor('#00ff00')
      await i.update({ embeds: [embed], components: [] })
      collector.stop()
    }
  })

  while (multiplier < parseFloat(crashPoint) && !cashedOut) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    multiplier += Math.random() * 0.5
    embed.setDescription(
      `🚀 **Multiplier: ${multiplier.toFixed(2)}x**\n\n💰 **Click "Cash Out" before the crash!**`,
    )
    await interaction.editReply({ embeds: [embed], components: [row] })
  }

  if (!cashedOut) {
    data.balance -= betAmount
    data.losses += 1
    data.gamesPlayed += 1
    await data.save()

    embed
      .setDescription(
        `💥 **CRASHED at ${multiplier.toFixed(2)}x!**\n❌ **You lost ${betAmount} coins!**`,
      )
      .setColor('#ff0000')
    await interaction.editReply({ embeds: [embed], components: [] })
  }

  collector.stop()
}
