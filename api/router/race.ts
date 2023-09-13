import express, { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import mysql_connect from "./../utils/mysqlConnect";
import { KRATicket, RacingResult } from "../kra/KRAClient";
import { Races } from "../utils/constant";
import loginAndGetToken from "../utils/loginAndgetToken";
import axios from "axios";

const router = express.Router();
const con = mysql_connect();

router.put(
    "/payout/:race_id",
    async (req: Request, res: Response<KRATicket[]>) => {
        const [tickets] = await con.query<RowDataPacket[]>(
            "SELECT * FROM ticket WHERE race = ?",
            [req.params.race_id]
        );
        const idToken = await loginAndGetToken()
        if (!idToken) throw new Error('Cannot Login');
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
        await Promise.all(kraTickets.map((kraTicket) => {
            const payout: number = race.totalPayout(kraTicket); //払い戻し
            if (payout > 0) {
                return axios.post(`${process.env.ENDPOINT}/transactions`, {
                    headers: {Authorization: `Bearer ${idToken}`},
                    body: {
                        user_id: kraTicket.user,
                        dealer_id: process.env.DEALERID,
                        amount: payout,
                        type: "payout",
                        detail: kraTicket.type.toString(),
                        hide_detail: ""
                    }
                }).catch(e => console.log(e))
            }
        }));
        return res.status(200).json(kraTickets);
    }
);

export default router;
