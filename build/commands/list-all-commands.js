import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js'
import { readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
export const data = {
  name: 'list-all-commands',
  description: 'View all available commands!',
}
export async function execute(interaction) {
  const commandFiles = readdirSync(join(__dirname)).filter(
    (file) => file.endsWith('.ts') || file.endsWith('.js'),
  )
  const commands = await Promise.all(
    commandFiles.map(async (file) => {
      const command = await import(join(__dirname, file))
      return command.data
        ? `**/${command.data.name}** - ${command.data.description || 'No description'}`
        : null
    }),
  )
  const filteredCommands = commands.filter(Boolean)
  if (!filteredCommands.length) {
    return interaction.reply({ content: 'No commands found!' })
  }
  const commandsPerPage = 10
  let currentPage = 0
  const totalPages = Math.ceil(filteredCommands.length / commandsPerPage)
  const generateEmbed = (page) => {
    const start = page * commandsPerPage
    const end = start + commandsPerPage
    const pageCommands = filteredCommands.slice(start, end).join('\n')
    return new EmbedBuilder()
      .setTitle('📜 Available Commands')
      .setDescription(pageCommands)
      .setFooter({ text: `Page ${page + 1} of ${totalPages}` })
      .setColor('#6f00e6')
  }
  const prevButton = new ButtonBuilder()
    .setCustomId('prev')
    .setLabel('⬅️')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(currentPage === 0)
  const nextButton = new ButtonBuilder()
    .setCustomId('next')
    .setLabel('➡️')
    .setStyle(ButtonStyle.Primary)
    .setDisabled(currentPage === totalPages - 1)
  const row = new ActionRowBuilder().addComponents(prevButton, nextButton)
  const message = await interaction.reply({
    embeds: [generateEmbed(currentPage)],
    components: [row],
    fetchReply: true,
  })
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 60000,
  })
  collector.on('collect', async (i) => {
    if (i.user.id !== interaction.user.id) {
      return i.reply({
        content: 'You cannot control this menu!',
        ephemeral: true,
      })
    }
    if (i.customId === 'prev' && currentPage > 0) currentPage--
    if (i.customId === 'next' && currentPage < totalPages - 1) currentPage++
    prevButton.setDisabled(currentPage === 0)
    nextButton.setDisabled(currentPage === totalPages - 1)
    await i.update({ embeds: [generateEmbed(currentPage)], components: [row] })
  })
  collector.on('end', async () => {
    await interaction.editReply({ components: [] })
  })
}
