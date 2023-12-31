import express, { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import mysql_connect from "./../utils/mysqlConnect";
import { FormationTicket, Ticket } from "../types/Ticket";
import { KRAFormation, KRATicket, TicketType } from "../kra/KRAClient";

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
    const [checkMoneyRows] = await con.query<RowDataPacket[]>(
        "SELECT having_money FROM users WHERE user_id = ?",
        [req.body.user_id]
    );
    if (checkMoneyRows.length === 0) throw new Error("The User is not found.");
    const oisiiyammuy: KRATicket = new KRATicket(
        req.body.type,
        req.body.bet,
        req.body.horse,
        req.body.option,
        req.body.optNum,
        req.body.user_id
    );
    const size = oisiiyammuy.build().length;
    const setMoney =
        checkMoneyRows[0].having_money - parseInt(req.body.bet) * size;
    if (setMoney < 0)
        throw new Error("You do not have enough money to complete the bet.");
    const [addTicketRows] = await con.query<ResultSetHeader>(
        "INSERT INTO ticket (user_id, horse, type, option, optNum, bet, race) VALUES (?, JSON_ARRAY(?), ?, ?, ?, ?, ?)",
        [
            req.body.user_id,
            req.body.horse,
            req.body.type,
            req.body.option,
            req.body.optNum,
            req.body.bet,
            req.body.race,
        ]
    );
    await con.query(
        "INSERT INTO transactions (transaction_id, user_id, dealer_id, amount, type, detail, hide_detail) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
            Math.floor(Math.random() * 65535)
                .toString(16)
                .padStart(4, "0"), // Transaction id
            req.body.user_id,
            process.env.DEALERID,
            parseInt(req.body.bet) * size,
            "bet",
            req.body.type.toString(),
            "",
        ]
    );
    await con.query(
        `UPDATE users SET having_money = ? WHERE user_id = "${req.body.user_id}"`,
        [setMoney]
    );
    const [[ticket]] = await con.query<RowDataPacket[]>(
        "SELECT * FROM ticket WHERE ticket_id = ?",
        [addTicketRows.insertId]
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

router.post(
    "/add/formation",
    async (req: Request<FormationTicket>, res: Response<FormationTicket>) => {
        if (
            req.body.type !== TicketType.EXACTA &&
            req.body.type !== TicketType.TRIFECTA
        )
            throw new Error("cannot buy this type of ticket");
        const [checkMoneyRows] = await con.query<RowDataPacket[]>(
            "SELECT having_money FROM users WHERE user_id = ?",
            [req.body.user_id]
        );
        if (checkMoneyRows.length === 0)
            throw new Error("The User is not found.");
        const ticket = KRAFormation(
            req.body.type,
            req.body.bet,
            req.body.f,
            req.body.s,
            req.body.t,
            req.body.user_id
        );
        const setMoney =
            checkMoneyRows[0].having_money -
            parseInt(req.body.bet) * ticket.length;
        if (setMoney < 0)
            throw new Error(
                "You do not have enough money to complete the bet."
            );
        ticket.map(async (t) => {
            await con.query(
                "INSERT INTO ticket (user_id, horse, type, option, optNum, bet, race) VALUES (?, JSON_ARRAY(?), ?, ?, ?, ?, ?)",
                [
                    req.body.user_id,
                    t.horse,
                    t.type,
                    req.body.option,
                    req.body.optNum,
                    req.body.bet,
                    req.body.race,
                ]
            );
        });
        await con.query(
            "INSERT INTO transactions (transaction_id, user_id, dealer_id, amount, type, detail, hide_detail) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                Math.floor(Math.random() * 65535)
                    .toString(16)
                    .padStart(4, "0"), // Transaction id
                req.body.user_id,
                process.env.DEALERID,
                parseInt(req.body.bet) * ticket.length,
                "bet",
                req.body.type.toString(),
                "",
            ]
        );
        await con.query(
            `UPDATE users SET having_money = ? WHERE user_id = "${req.body.user_id}"`,
            [setMoney]
        );
        res.status(200).json(req.body);
    }
);

export default router;
