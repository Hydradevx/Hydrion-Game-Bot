import { Interaction, ChatInputCommandInteraction } from 'discord.js'
import model from '../models/mongoSchema.js'

export async function interactionCreate(client: any, interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return

  let data
  try {
    data = await model.findOne({ userId: interaction.user.id })
    if (!data) {
      data = model.create({ userId: interaction.user.id })
      await data.save()
    }
  } catch (error) {
    console.error(error)
    return
  }

  const command = client.commands.get(interaction.commandName)
  if (!command) return

  try {
    await command.execute(interaction as ChatInputCommandInteraction, data)
  } catch (error) {
    console.error(error)
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    })
  }
}
