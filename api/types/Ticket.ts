export interface Ticket {
    ticket_id?: number
    user_id: string
    horse: number[]
    type: string
    option: string
    optNum: number
    bet: number
    race: number
}

export interface FormationTicket {
    ticket_id?: number
    user_id: string
    f: number[]
    s: number[]
    t: number[]
    type: string
    option: string //常に"NO"
    optNum: number
    bet: number
    race: number
}