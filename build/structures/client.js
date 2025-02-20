import { Client, GatewayIntentBits, Collection } from 'discord.js'
import fs from 'fs'
import path from 'path'
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})
client.commands = new Collection()
const commandsPath = path.join(__dirname, '../commands')
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'))
const commands = []
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = require(filePath)
  if (command.name) {
    client.commands.set(command.name, command)
    if (command.aliases) {
      command.aliases.forEach((alias) => {
        client.commands.set(alias, command)
      })
    }
  }
}
