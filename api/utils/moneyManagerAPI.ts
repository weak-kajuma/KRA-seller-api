import { RowDataPacket } from "mysql2/promise"
import mysql_connect from "./mysqlConnect"

export const getUserInfo = async (user_id: string) => {
    const con = mysql_connect()
    const [rows, fiedls] = await con.query<RowDataPacket[]>("SELECT * FROM users WHERE user_id = ?",[user_id])
    return rows[0]
}