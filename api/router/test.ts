import express, { Request, Response } from "express"
import { getUserInfo } from "../utils/moneyManagerAPI"

const router = express.Router()

router.get("/", async (req: Request, res: Response) => {
    res.status(200).json({
        message: "Hello World"
    })
})

router.get("/users/:user_id", async (req: Request, res: Response) => {
    res.status(200).json({
        message: await getUserInfo(req.params.user_id)
    })
})

export default router