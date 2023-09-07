import { createPool } from "mysql2/promise"

const mysql_connect = () => {
    if (!process.env.DATABASE_URL) throw Error("DATABASE_URL is not defined")
    return createPool(process.env.DATABASE_URL)
}

export default mysql_connect