import dotenv from 'dotenv'
dotenv.config()
import { REST, Routes } from 'discord.js'
import fs from 'fs'
const token = process.env.TOKEN
if (!token) {
  throw new Error('TOKEN is not defined in the environment variables.')
}
const commands = []
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'))
  .filter((file) => fs.existsSync(`./commands/${file}`))
for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  commands.push(command.data.toJSON())
}
const rest = new REST({ version: '10' }).setToken(token)
if (!process.env.CLIENT_ID) {
  throw new Error('CLIENT_ID is not defined in the environment variables.')
}
;(async () => {
  try {
    console.log('Started refreshing application (/) commands.')
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    })
    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
})()
