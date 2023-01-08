/// Get a random integer
export function ranInt(a: number, b: number) {
    const diff = b - a

    return Math.floor(a + diff * Math.random())
}

/// Get a random odds list and the right index of outcomes in future
export function randomOddsList(len: number) {
    console.assert(len >= 2 && len <= 10, "2 or more and 10 or less")

    const ratios = []

    for (let i = 0; i < len; i++) {
        ratios.push(ranInt(1, 10))
    }

    const sum = ratios.reduce((a, b) => a + b)

    const oddsList = []
    for (let i = 0; i < len; i++) {
        const odds = Math.floor((sum / ratios[i]) * 95) / 100
        oddsList.push(odds)
    }

    let begin = 0
    const target = ranInt(0, sum)

    let rightIndex = -1
    /// The higher the ratio, the greater the probability
    for (let i = 0; i < ratios.length; i++) {
        if (begin <= target && target < begin + ratios[i]) {
            rightIndex = i
            break
        }

        begin += ratios[i]
    }

    return { oddsList, rightIndex }
}
