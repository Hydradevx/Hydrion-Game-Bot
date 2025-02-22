import RPC from 'discord-rpc'
export const clientId = process.env.CLIENT_ID
export const rpc = new RPC.Client({ transport: 'ipc' })
export async function setActivity() {
  if (!rpc) return
  rpc.setActivity({
    details: 'Playing with Hydrion Tools',
    state: 'Developing a Game Bot',
    startTimestamp: Date.now(),
    largeImageKey: 'logo',
    largeImageText: 'Hydrion Tools',
    smallImageKey: 'code',
    smallImageText: 'Coding in TypeScript',
    buttons: [
      { label: 'Join Discord', url: 'https://discord.gg/6Tufbvnebj' },
      { label: 'GitHub', url: 'https://github.com/Hydradevx' },
    ],
  })
}
rpc.on('ready', () => {
  console.log('✅ Rich Presence is active!')
  setActivity()
  setInterval(setActivity, 15000)
})
rpc.login({ clientId }).catch(console.error)
