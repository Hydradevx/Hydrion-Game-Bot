import { client } from '../structures/client'
import fs from 'fs'
import path from 'path'
const configPath = path.join(__dirname, '../../config.json')
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
const prefix = config.prefix
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(prefix)) return
  const args = message.content.slice(prefix.length).trim().split(/ +/g)
  const commandName = args.shift()?.toLowerCase()
  const command = client.prefixCommands.get(commandName)
  if (!command) return
  try {
    await command.execute(message, args)
  } catch (error) {
    console.error(error)
    message.reply('There was an error while executing this command!')
  }
})
