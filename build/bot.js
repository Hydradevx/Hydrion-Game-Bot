import dotenv from 'dotenv'
import { Client, GatewayIntentBits, Collection, EmbedBuilder } from 'discord.js'
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
    GatewayIntentBits.GuildMembers,
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
const inviteLink = 'https://discord.gg/6Tufbvnebj'
client.on('guildMemberAdd', async (member) => {
  if (member.user.bot) return
  const embed = new EmbedBuilder()
    .setTitle('🌟 Join Our Community!')
    .setDescription(
      `Hey ${member.user}, I see you just joined a server I'm in! 🎉\n\nJoin **Hydrion Tools** for premium bots, tools, and a great community!\n\n[Click Here to Join](<${inviteLink}>)`,
    )
    .setColor('#6f00e6')
    .setThumbnail(member.user.displayAvatarURL())
    .setImage(
      'https://cdn.discordapp.com/attachments/1342784819549179935/1343135363102674995/c026f3c143c74e47b6eb6e2b46fffa28.jpg?ex=67bc2bc8&is=67bada48&hm=d6728eb9e5bb11d8c649915e6822448e64489f16d85a4bd193bb98ec06e0a815&',
    )
    .setFooter({
      text: 'Hydrion Tools • The best tools await you!',
      iconURL: client.user?.displayAvatarURL(),
    })
  try {
    await member.user.send({ embeds: [embed] })
  } catch (err) {
    console.log(`❌ Could not DM ${member.user.tag}`)
  }
})
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
