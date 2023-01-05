export function ranInt(a: number, b: number) {
    const diff = b - a

    return Math.floor(a + diff * Math.random())
}

export function randomOddsList(len: number) {
    console.assert(len >= 2 && len <= 10, "2 or more and 10 or less")

    const shares = []

    for (let i = 0; i < len; i++) {
        shares.push(ranInt(1, 10))
    }

    const sum = shares.reduce((a, b) => a + b)

    const oddsList = []
    for (let i = 0; i < len; i++) {
        const odds = Math.floor((sum / shares[i]) * 95) / 100
        oddsList.push(odds)
    }

    let begin = 0
    const target = ranInt(0, sum)

    for (let i = 0; i < shares.length; i++) {
        if (begin <= target && target < begin + shares[i]) {
            return { oddsList, rightIndx: i }
        }

        begin += shares[i]
    }

    throw Error("xx")
}
