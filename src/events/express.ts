import express from 'express'

const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))

export const expressStart = () => {
  app.listen(port, () => console.log(`Render app listening on port ${port}!`))
}
