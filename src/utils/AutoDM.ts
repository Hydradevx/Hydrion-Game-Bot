import { Client, GuildMember, EmbedBuilder } from 'discord.js'

const inviteLink = 'https://discord.gg/6Tufbvnebj'

export default function setupAutoDM(client: Client) {
  console.log('AutoDM module initialized. DMs will be sent automatically.')
  client.on('guildMemberAdd', async (member: GuildMember) => {
    if (member.user.bot) return

    const embed = new EmbedBuilder()
      .setTitle('🌟 Join Our Community!')
      .setDescription(
        `Hey ${member.user}, I see you just joined a server I'm in! 🎉\n\nJoin **Hydrion Tools** for premium bots, tools, and a great community!\n\n[Click Here to Join](${inviteLink})`,
      )
      .setColor('#6f00e6')
      .setThumbnail(member.user.displayAvatarURL())
      .setImage(
        'https://cdn.discordapp.com/attachments/1342784819549179935/1343135363102674995/c026f3c143c74e47b6eb6e2b46fffa28.jpg',
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
}
