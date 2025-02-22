import { Interaction, ChatInputCommandInteraction } from 'discord.js'
import model from '../models/mongoSchema.js'

export async function interactionCreate(client: any, interaction: Interaction) {
  if (!interaction.isChatInputCommand()) return

  let Data
  try {
    Data = await model.findOne({ userID: interaction.user.id })
  } catch (error) {
    console.error(error)
  }

  const command = client.commands.get(interaction.commandName)
  if (!command) return

  try {
    await command.execute(interaction as ChatInputCommandInteraction)
  } catch (error) {
    console.error(error)
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    })
  }
}
