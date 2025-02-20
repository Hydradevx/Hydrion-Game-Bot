import dotenv from 'dotenv'
import { client } from './structures/client'
import { Message } from 'discord.js'

dotenv.config()

client.on('messageCreate', (message: Message) => {
  if (message.content === '!ping') {
    message.reply('🏓 Pong!')
  }
})

client.login(process.env.TOKEN)
