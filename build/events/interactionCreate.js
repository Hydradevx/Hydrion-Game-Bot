import model from '../models/mongoSchema.js'
export async function interactionCreate(client, interaction) {
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
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    })
  }
}
