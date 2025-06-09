import persistentTextStreaming from '@convex-dev/persistent-text-streaming/convex.config'
import { defineApp } from 'convex/server'

const app = defineApp()
app.use(persistentTextStreaming)

export default app
