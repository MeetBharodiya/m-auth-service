import app from './app'
import { Config } from './config'
import logger from './config/logger'

const startSerevr = () => {
  const PORT = Config.PORT

  try {
    app.listen(PORT, () => {
      logger.info('Server lifffste  ning on port', { port: PORT })
    })
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

startSerevr()
