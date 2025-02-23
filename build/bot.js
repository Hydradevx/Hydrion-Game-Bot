import dotenv from 'dotenv'
import { Client, GatewayIntentBits, Collection } from 'discord.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config()
export const client = new Client({
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
    .then((command) => {
      if (command.data.name) {
        client.commands.set(command.data.name, command)
        if (command.data.aliases) {
          command.data.aliases.forEach((alias) => {
            client.commands.set(alias, command)
          })
        }
      }
    })
    .catch((error) =>
      console.error(`Failed to load command at ${filePath}: ${error}`),
    )
}
import { connectDB } from './utils/db.js'
import { onReady } from './events/ready.js'
import { interactionCreate } from './events/interactionCreate.js'
import antiCrash from './utils/AntiCrash.js'
const token = process.env.TOKEN
function start() {
  client.login(token)
  onReady(client)
  connectDB()
  client.on('interactionCreate', async (interaction) => {
    await interactionCreate(client, interaction)
  })
  // setActivity()
  antiCrash()
}
start()
