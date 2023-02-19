import axios from "axios"

type League = {
    league: {
        id: number
        name: string
        type: string
        logo: string
    }
    country: {
        name: string
        code: string
        flag: string
    }
}

type Fixture = {
    fixture: {
        id: number
        timestamp: number
        status: {
            short: string
        }
    }
    teams: {
        home: {
            id: number
            name: string
            logo: string
        }
        away: {
            id: number
            name: string
            logo: string
        }
    }
}

type Odds = {
    name: string
    values: {
        value: string
        odd: string
    }[]
}

type Bet = {
    id: number
    name: string
}

const http = axios.create({
    baseURL: "https://api-football-v1.p.rapidapi.com/v3",
    headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com",
    },
    timeout: 30000,
})

async function getLeagueById(leagueApiId: number): Promise<League> {
    // 获取联赛
    const response = await http.get("/leagues", {
        params: {
            id: leagueApiId,
        },
    })

    return response.data.response[0]
}

async function getFixtures(leagueApiId: number, season: string, date: string): Promise<Fixture[]> {
    // 获取联赛的比赛
    // doc: https://www.api-football.com/documentation-v3#tag/Fixtures/operation/get-fixtures
    const response = await http.get("/fixtures", {
        params: {
            league: leagueApiId,
            status: "NS",
            season,
            date,
        },
    })

    return response.data.response
}

async function getFixtureById(fixtureApiId: number): Promise<Fixture> {
    // 获取联赛的比赛
    const response = await http.get("/fixtures", {
        params: {
            id: fixtureApiId,
        },
    })

    return response.data.response[0]
}

async function getBetById(betApiId: number): Promise<Bet> {
    // 获取联赛的比赛
    const response = await http.get("/odds/bets", {
        params: {
            id: betApiId,
        },
    })

    return response.data.response[0]
}

async function getOdds(fixtureApiId: number): Promise<Odds[]> {
    // 获取赔率
    const response = await http.get("/odds", {
        params: {
            fixture: fixtureApiId,
            bookmaker: 8, // bet365
            bet: 1, // winner
        },
    })
    // bookmakers:
    //     id:1
    //     name:"10Bet"
    //     bets:
    //         id:1
    //         name:"Match Winner"
    //         values:
    //             value:"Home"
    //             odd:"3.90"
    //             value:"Draw"
    //             odd:"3.45"
    //             value:"Away"
    //             odd:"2.00"

    return response.data.response[0].bookmakers[0].bets
}

export { getLeagueById, getFixtures, getFixtureById, getOdds, getBetById }
