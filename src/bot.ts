import dotenv from 'dotenv'
import { Client, GatewayIntentBits, Collection, Interaction } from 'discord.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config()

export const client: any = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

client.commands = new Collection()

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  import(filePath)
    .then((command: any) => {
      if (command.data.name) {
        client.commands.set(command.data.name, command)
        if (command.data.aliases) {
          command.data.aliases.forEach((alias: string) => {
            client.commands.set(alias, command)
          })
        }
      }
    })
    .catch((error) =>
      console.error(`Failed to load command at ${filePath}: ${error}`),
    )
}

client.on('ready', () => {
  console.log(`🚀 Logged in as ${client.user?.tag}! 🚀`)
})

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.isCommand()) return

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
})

const token = process.env.TOKEN

client.login(token)
