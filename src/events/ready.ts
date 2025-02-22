export function onReady(client): void {
  client.on('ready', () => {
    console.log(`🚀 Logged in as ${client.user?.tag}! 🚀`)
  })
}
