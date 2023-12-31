import express, { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import mysql_connect from "./../utils/mysqlConnect";
import { KRATicket, RacingResult } from "../kra/KRAClient";
import { Races } from "../utils/constant";

const router = express.Router();
const con = mysql_connect();

router.put(
    "/payout/:race_id",
    async (req: Request, res: Response<KRATicket[]>) => {
        const [tickets] = await con.query<RowDataPacket[]>(
            "SELECT * FROM ticket WHERE race = ?",
            [req.params.race_id]
        );
        const kraTickets: KRATicket[] = tickets.map(
            (t) =>
                new KRATicket(
                    t.type,
                    t.bet,
                    t.horse,
                    t.option,
                    t.optNum,
                    t.user_id
                )
        );
        const id = parseInt(req.params.race_id) - 1;
        const f = parseInt(req.body.f);
        const s = parseInt(req.body.s);
        const t = parseInt(req.body.t);
        const race = Races[id].setResult(new RacingResult([f, s, t]));
        //Transaction作成 user_id={kraTicket.user} dealer_id="1c34" hide_detail="none" detail={kraTicket.type} amount={payout}
        //Money-Manager APIで
        await Promise.all(kraTickets.map(async (kraTicket) => {
            const payout: number = race.totalPayout(kraTicket); //払い戻し
            if (payout > 0) {
                Promise.all([
                    con.query("INSERT INTO transactions (transaction_id, user_id, dealer_id, amount, type, detail, hide_detail) VALUES (?, ?, ?, ?, ?, ?, ?)", [
                        Math.floor(Math.random() * 65535).toString(16).padStart(4, '0'), // Transaction id
                        kraTicket.user,
                        process.env.DEALERID,
                        payout,
                        "payout",
                        kraTicket.type.toString(),
                        ""
                    ]),
                    await con.query(`UPDATE users SET having_money = having_money + ? WHERE user_id = "${kraTicket.user}"`, [
                        payout
                    ])
                ])
            }
        }));
        return res.status(200).json(kraTickets);
    }
);

export default router;
