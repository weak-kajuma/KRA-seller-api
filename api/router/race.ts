import express, { Request, Response } from "express"
import { RowDataPacket } from "mysql2"
import mysql_connect from "./../utils/mysqlConnect"
import { Ticket } from "../types/Ticket"

const router = express.Router()
const con = mysql_connect()

router.put("/payout/:race_id", async (req: Request, res: Response<Ticket[]>) => {
    const [tickets] = await con.query<RowDataPacket[]>("SELECT * FROM ticket WHERE race = ?", [req.params.race_id])
    res.status(200).json(tickets.map(ticket => {
        return {
            ticket_id: ticket.ticket_id,
            user_id: ticket.user_id,
            horse: ticket.hourse,
            type: ticket.type,
            option: ticket.option,
            optNum: ticket.optNum,
            bet: ticket.bet,
            race: ticket.race
        }
    }))
})

export default router