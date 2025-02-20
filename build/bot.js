import dotenv from 'dotenv'
import { client } from './structures/client'
dotenv.config()
client.on('messageCreate', (message) => {
  if (message.content === '!ping') {
    message.reply('🏓 Pong!')
  }
})
client.login(process.env.TOKEN)
