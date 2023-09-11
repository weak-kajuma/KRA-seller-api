import express, { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import mysql_connect from "./../utils/mysqlConnect";
import { Ticket } from "../types/Ticket";
import axios from "axios";
import loginAndGetToken from "../utils/loginAndgetToken";

const router = express.Router();
const con = mysql_connect();

router.get("/", async (req: Request, res: Response<Ticket[]>) => {
    const [tickets] = await con.query<RowDataPacket[]>("SELECT * FROM ticket");
    res.status(200).json(
        tickets.map((ticket) => {
            return {
                ticket_id: ticket.ticket_id,
                user_id: ticket.user_id,
                horse: ticket.hourse,
                type: ticket.type,
                option: ticket.option,
                optNum: ticket.optNum,
                bet: ticket.bet,
                race: ticket.race,
            };
        })
    );
});

router.get("/get/:ticket_id", async (req: Request, res: Response<Ticket>) => {
    const [[ticket]] = await con.query<RowDataPacket[]>(
        "SELECT * FROM ticket WHERE ticket_id = ?",
        [req.params.ticket_id]
    );
    res.status(200).json({
        ticket_id: ticket.ticket_id,
        user_id: ticket.user_id,
        horse: ticket.hourse,
        type: ticket.type,
        option: ticket.option,
        optNum: ticket.optNum,
        bet: ticket.bet,
        race: ticket.race,
    });
});

router.post("/add", async (req: Request<Ticket>, res: Response<Ticket>) => {
    const idToken = await loginAndGetToken()
    if (!idToken) throw new Error('Cannot Login');
    const body = req.body;
    const [rows] = await con.query<ResultSetHeader>(
        "INSERT INTO ticket (user_id, horse, type, option, optNum, bet, race) VALUES (?, JSON_ARRAY(?), ?, ?, ?, ?, ?)",
        [
            body.id,
            body.horse,
            body.type,
            body.option,
            body.optNum,
            body.bet,
            body.race,
        ]
    );
    const [[ticket]] = await con.query<RowDataPacket[]>(
        "SELECT * FROM ticket WHERE ticket_id = ?",
        [rows.insertId]
    );
    //Transaction作成 user_id={ticket.user_id} dealer_id="1c34" hide_detail="none" detail={ticket.type} amount={ticket.bet}
    await axios.post(`${process.env.ENDPOINT}/transactions`, {
        headers: {Authorization: `Bearer ${idToken}`},
        body: {
            user_id: ticket.user,
            dealer_id: process.env.DEALERID,
            amount: ticket.bet,
            type: "bet",
            detail: ticket.type.toString(),
            hide_detail: ""
        }
    })
    res.status(200).json({
        ticket_id: ticket.ticket_id,
        user_id: ticket.user_id,
        horse: ticket.hourse,
        type: ticket.type,
        option: ticket.option,
        optNum: ticket.optNum,
        bet: ticket.bet,
        race: ticket.race,
    });
});

export default router;
