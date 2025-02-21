import dotenv from 'dotenv'
dotenv.config()

import { REST, Routes } from 'discord.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const token = process.env.TOKEN as string
if (!token) {
  throw new Error('TOKEN is not defined in the environment variables.')
}

let commands = []

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = await import(filePath)
  commands.push(command.data)
}

const rest = new REST({ version: '10' }).setToken(token)

if (!process.env.CLIENT_ID) {
  throw new Error('CLIENT_ID is not defined in the environment variables.')
}

;(async () => {
  try {
    console.log('Started refreshing application (/) commands.')

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID as string),
      {
        body: commands,
      },
    )

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
})()
