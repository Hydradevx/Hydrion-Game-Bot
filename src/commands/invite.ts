import { CommandInteraction, EmbedBuilder } from 'discord.js'

export const data = {
  name: 'invite',
  description: 'Get the bot invite link',
}

export async function execute(interaction: CommandInteraction) {
  const inviteLink =
    'https://discord.com/oauth2/authorize?client_id=1342103648611729439&permissions=1731720143306560&integration_type=0&scope=applications.commands+bot'

  const embed = new EmbedBuilder()
    .setTitle('Invite Me!')
    .setDescription(`[Click here to invite the bot](${inviteLink})`)
    .setColor('#6f00e6')

  try {
    await interaction.reply({ embeds: [embed], ephemeral: true })
  } catch (error) {
    console.error('Error replying to interaction:', error)
  }
}
