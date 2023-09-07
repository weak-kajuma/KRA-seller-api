import express from 'express'
import testRouter from './router/test'
import dotenv from 'dotenv'

dotenv.config()

const app: express.Express = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('trust proxy', true)

// CROS対応（というか完全無防備：本番環境ではだめ絶対）
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*")
    res.header("Access-Control-Allow-Headers", "*");
    next();
})

// ここにrouterを追加していく
app.use("/test", testRouter)

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Start on port ${PORT}.`)
})