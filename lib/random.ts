export function ranInt(a: number, b: number) {
    const diff = b - a

    return Math.floor(a + diff * Math.random())
}

export function randomOddsList(len: number) {
    console.assert(len >= 2 && len <= 10, "2 or more and 10 or less")

    const oddsRatio = []

    for (let i = 0; i < len; i++) {
        oddsRatio.push(Math.random())
    }

    const sum = oddsRatio.reduce((a, b) => a + b)

    const oddsList = []
    for (let i = 0; i < len; i++) {
        const odds = Number((sum / oddsRatio[i]).toFixed(2))
        oddsList.push(odds)
    }

    return oddsList
}
