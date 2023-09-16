import { combination, noDupeRange, permutation, range } from "./utils";

/**
 * @param type {TicketType} 馬券の種類
 * @param opt {TicketOption} 馬券のオプション
 * @param bet {number} 購入する金額
 * @param horse {number[]} 購入する買い目
 * @param optNum {number} オプションの数 (任意)
 */
export class KRATicket {
    type: TicketType;
    option: TicketOption;
    bet: number;
    horse: number[];
    optNum: number;
    user: string;
    constructor(
        type: TicketType,
        bet: number,
        horse: number[],
        opt: TicketOption,
        optNum: number = 12,
        user: string
    ) {
        this.type = type;
        this.option = opt;
        this.bet = Math.floor(bet);
        this.horse = horse.map((e) => Math.floor(e));
        this.optNum = optNum;
        this.user = user;
    }
    build(): KRABuying[] {
        let tickets: KRABuying[];
        if (this.option == TicketOption.NO) {
            return [new KRABuying(this.type, this.bet, this.horse, this.user)];
        } else if (this.option == TicketOption.BOX) {
            //ボックス
            if (this.type == TicketType.QUINELLA) {
                //馬連
                return combination(this.horse, 2).map(
                    (h) =>
                        new KRABuying(
                            TicketType.QUINELLA,
                            this.bet,
                            h,
                            this.user
                        )
                );
            } else if (this.type == TicketType.EXACTA) {
                //馬単
                return permutation(this.horse, 2).map(
                    (h) =>
                        new KRABuying(TicketType.EXACTA, this.bet, h, this.user)
                );
            } else if (this.type == TicketType.WIDE) {
                //ワイド
                return combination(this.horse, 2).map(
                    (h) =>
                        new KRABuying(TicketType.WIDE, this.bet, h, this.user)
                );
            } else if (this.type == TicketType.TRIO) {
                //三連複
                return combination(this.horse, 3).map(
                    (h) =>
                        new KRABuying(TicketType.TRIO, this.bet, h, this.user)
                );
            } else if (this.type == TicketType.TRIFECTA) {
                //三連単
                return permutation(this.horse, 3).map(
                    (h) =>
                        new KRABuying(
                            TicketType.TRIFECTA,
                            this.bet,
                            h,
                            this.user
                        )
                );
            } else {
                throw `You can't use BOX option with TicketType: ${this.type}`;
            }
        } else if (this.option == TicketOption.WHEEL) {
            //総流し
            if (this.type == TicketType.QUINELLA) {
                //馬連
                return noDupeRange(1, this.optNum, [this.horse[0]]).map(
                    (h) =>
                        new KRABuying(
                            TicketType.QUINELLA,
                            this.bet,
                            [this.horse[0], h],
                            this.user
                        )
                );
            } else if (this.type == TicketType.WIDE) {
                return noDupeRange(1, this.optNum, [this.horse[0]]).map(
                    (h) =>
                        new KRABuying(
                            TicketType.WIDE,
                            this.bet,
                            [this.horse[0], h],
                            this.user
                        )
                );
            } else {
                throw `You can't use WHEEL option with TicketType: ${this.type}`;
            }
        } else if (this.option == TicketOption.WHEEL_FIRST) {
            //一着軸固定
            if (this.type == TicketType.EXACTA) {
                //馬単
                return noDupeRange(1, this.optNum, [this.horse[0]]).map(
                    (h) =>
                        new KRABuying(
                            TicketType.EXACTA,
                            this.bet,
                            [this.horse[0], h],
                            this.user
                        )
                );
            } else if (this.type == TicketType.TRIFECTA) {
                //三連単
                return permutation(
                    noDupeRange(1, this.optNum, [this.horse[0]]),
                    2
                ).map(
                    (h) =>
                        new KRABuying(
                            TicketType.TRIFECTA,
                            this.bet,
                            [this.horse[0], ...h],
                            this.user
                        )
                );
            } else {
                throw `You can't use WHEEL_FIRST option with TicketType: ${this.type}`;
            }
        } else if (this.option == TicketOption.WHEEL_SECOND) {
            //二着軸固定
            if (this.type == TicketType.EXACTA) {
                //馬単
                return noDupeRange(1, this.optNum, [this.horse[0]]).map(
                    (h) =>
                        new KRABuying(
                            TicketType.EXACTA,
                            this.bet,
                            [h, this.horse[0]],
                            this.user
                        )
                );
            } else if (this.type == TicketType.TRIFECTA) {
                //三連単
                return permutation(
                    noDupeRange(1, this.optNum, [this.horse[0]]),
                    2
                ).map(
                    (h) =>
                        new KRABuying(
                            TicketType.TRIFECTA,
                            this.bet,
                            [h[0], this.horse[0], h[1]],
                            this.user
                        )
                );
            }
        } else if (this.option == TicketOption.WHEEL_TO_SECOND) {
            //二頭軸固定
            if (this.type == TicketType.TRIFECTA) {
                //三連単
                return noDupeRange(1, this.optNum, [
                    this.horse[0],
                    this.horse[1],
                ]).map(
                    (h) =>
                        new KRABuying(
                            TicketType.TRIFECTA,
                            this.bet,
                            [this.horse[0], this.horse[1], h],
                            this.user
                        )
                );
            }
        }
        return [new KRABuying(this.type, this.bet, this.horse, this.user)];
    }
}

export class KRABuying {
    horse: number[];
    type: TicketType;
    bet: number;
    user: string;
    constructor(type: TicketType, bet: number, horse: number[], user: string) {
        this.type = type;
        this.bet = bet;
        this.horse = horse.map((e) => Math.floor(e));
        this.user = user;
    }
}

export class RacingResult {
    horse: number[];
    constructor(horse: number[]) {
        this.horse = horse.map((e) => Math.floor(e));
    }
    match(tk: KRABuying): boolean {
        const wins = this.horse;
        switch (tk.type) {
            case TicketType.WIN:
                return wins[0] == tk.horse[0];
            case TicketType.PLACE:
                return wins.some((h) => h == tk.horse[0]);
            case TicketType.QUINELLA:
                return (
                    wins.slice(0, 2).some((h) => h == tk.horse[0]) &&
                    wins.slice(0, 2).some((h) => h == tk.horse[1])
                );
            case TicketType.EXACTA:
                return wins[0] == tk.horse[0] && wins[1] == tk.horse[1];
            case TicketType.WIDE:
                return (
                    wins.some((h) => h == tk.horse[0]) &&
                    wins.some((h) => h == tk.horse[1])
                );
            case TicketType.TRIO:
                return (
                    wins.some((h) => h == tk.horse[0]) &&
                    wins.some((h) => h == tk.horse[1]) &&
                    wins.some((h) => h == tk.horse[2])
                );
            case TicketType.TRIFECTA:
                return (
                    wins[0] == tk.horse[0] &&
                    wins[1] == tk.horse[1] &&
                    wins[2] == tk.horse[2]
                );
        }
    }
}

export class RacingData {
    private size: number;
    private odds_1: number[];
    private odds_2: number[];
    private odds_3: number[];
    private two: number[];
    private place: number[];
    private status: RacingStatus;
    private result: RacingResult = new RacingResult([]);
    constructor(
        size: number,
        o1: number[], //0-11
        o2: number[],
        o3: number[],
        two: number[],
        place: number[]
    ) {
        this.size = size;
        this.odds_1 = o1;
        this.odds_2 = o2;
        this.odds_3 = o3;
        this.two = two;
        this.place = place;
        this.status = RacingStatus.READY;
    }
    setResult(res: RacingResult): RacingData {
        this.result = res;
        this.status = RacingStatus.FINISH;
        return this;
    }
    payout(buying: KRABuying): number {
        if (this.getStatus() != RacingStatus.FINISH) return 0;
        const res = this.result;
        if (!res.match(buying)) return 0;
        if (buying.type == TicketType.WIN) {
            //単勝
            return buying.bet * this.odds_1[res.horse[0] - 1];
        } else if (buying.type == TicketType.PLACE) {
            //複勝
            return buying.bet * this.place[res.horse[0] - 1];
        } else if (buying.type == TicketType.QUINELLA) {
            //馬連
            return (
                buying.bet *
                getOdds(this.two[res.horse[0] - 1] * this.two[res.horse[1] - 1])
            );
        } else if (buying.type == TicketType.EXACTA) {
            //馬単
            return (
                buying.bet *
                getOdds(
                    this.odds_1[res.horse[0] - 1] *
                        this.odds_2[res.horse[1] - 1]
                )
            );
        } else if (buying.type == TicketType.WIDE) {
            //ワイド
            return (
                buying.bet *
                getOdds(
                    this.place[buying.horse[0] - 1] *
                        this.place[buying.horse[1] - 1]
                )
            );
        } else if (buying.type == TicketType.TRIO) {
            //三連複
            return (
                buying.bet *
                getOdds(
                    this.place[res.horse[0] - 1] *
                        this.place[res.horse[1] - 1] *
                        this.place[res.horse[2] - 1] *
                        3
                )
            );
        } else if (buying.type == TicketType.TRIFECTA) {
            //三連単
            return (
                buying.bet *
                getOdds(
                    this.odds_1[res.horse[0] - 1] *
                        this.odds_2[res.horse[1] - 1] *
                        this.odds_3[res.horse[2] - 1]
                )
            );
        }
        return 0;
    }
    totalPayout(ticket: KRATicket): number {
        let earned = 0;
        ticket.build().forEach((t) => {
            earned += this.payout(t);
        });
        return earned;
    }
    getSize(): number {
        return this.size;
    }
    getStatus(): RacingStatus {
        return this.status;
    }
}

export const KRAFormation = (
    type: TicketType.EXACTA | TicketType.TRIFECTA,
    bet: number,
    f: number[],
    s: number[],
    t: number[] = [0],
    user: string
): KRABuying[] => {
    let buys: KRABuying[] = [];
    for (const first of f) {
        for (const second of s) {
            for (const third of t) {
                if (!(first == second || second == third || first == third)) {
                    switch (type) {
                        case TicketType.EXACTA:
                            buys.push(
                                new KRABuying(
                                    TicketType.EXACTA,
                                    bet,
                                    [first, second],
                                    user
                                )
                            );
                        case TicketType.TRIFECTA:
                            buys.push(
                                new KRABuying(
                                    TicketType.TRIFECTA,
                                    bet,
                                    [first, second, third],
                                    user
                                )
                            );
                    }
                }
            }
        }
    }
    return buys;
};
export enum TicketType {
    WIN = "単勝", //単勝
    PLACE = "複勝", //複勝
    QUINELLA = "馬連", //馬連
    EXACTA = "馬単", //馬単
    WIDE = "ワイド", //ワイド
    TRIO = "三連複", //3連複
    TRIFECTA = "三連単", //3連単
}

export enum TicketOption {
    BOX = "BOX",
    WHEEL = "WHEEL",
    WHEEL_FIRST = "WHEEL_FIRST", //[0]確定
    WHEEL_SECOND = "WHEEL_SECOND", //[1]確定
    WHEEL_TO_SECOND = "WHEEL_TO_SECOND", //[0,1]確定
    FORMATION = "FORMATION",
    NO = "NO",
}

export enum RacingStatus {
    READY,
    FINISH,
}

const getOdds = (n: number): number => {
    return Math.floor(n * 10) / 10;
};
