import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { ranInt, randomOddsList } from "../lib/random"

describe("Benchmarking", async function () {
    async function deployContracts() {
        const TestToken = await ethers.getContractFactory("TestToken")

        const Core = await ethers.getContractFactory("Core")

        const BetNFT = await ethers.getContractFactory("BetNFT")
        const LiquidityPoolERC20 = await ethers.getContractFactory("LiquidityPoolERC20")

        const [owner, oracle, maker1, maker2, better1, better2, better3, better4, better5] = await ethers.getSigners()

        const token = await TestToken.deploy(ethers.utils.parseEther("10000"))
        const core = await Core.deploy(oracle.address)

        const pool = await LiquidityPoolERC20.deploy(core.address, token.address)
        const bet = await BetNFT.deploy(core.address)

        await core.setBet(bet.address)
        await core.setLP(pool.address)

        const ONE_HOUR_IN_SECS = 60 * 60
        const ONE_DAY_IN_SECS = 24 * 60 * 60

        return {
            core,
            bet,
            pool,
            token,
            owner,
            oracle,
            maker1,
            maker2,
            better1,
            better2,
            better3,
            better4,
            better5,
            ONE_HOUR_IN_SECS,
            ONE_DAY_IN_SECS,
        }
    }
    async function makeCondition(core: any, oracle: any, startTime: any, endTime: any, oddsList: number[]) {
        const valueOfLiquidity = ethers.utils.parseEther("100")
        const multiplier = 1e9

        await core.connect(oracle).createCondition(
            oddsList.map((x) => Math.floor(x * multiplier)),
            valueOfLiquidity,
            startTime,
            endTime,
        )

        return await core.lastConditionId()
    }

    describe("Benchmarking", async function () {
        it("Benchmarking", async function () {
            const { core, bet, pool, token, owner, oracle, maker1, maker2, better1, better2, better3, better4, better5, ONE_HOUR_IN_SECS } =
                await loadFixture(deployContracts)

            await token.transfer(maker1.address, ethers.utils.parseEther("1000"))
            await token.transfer(maker2.address, ethers.utils.parseEther("1000"))

            await token.transfer(better1.address, ethers.utils.parseEther("100"))
            await token.transfer(better2.address, ethers.utils.parseEther("100"))
            await token.transfer(better3.address, ethers.utils.parseEther("100"))
            await token.transfer(better4.address, ethers.utils.parseEther("100"))
            await token.transfer(better5.address, ethers.utils.parseEther("100"))

            console.log("before maker1 value:", await token.balanceOf(maker1.address))
            console.log("before maker2 value:", await token.balanceOf(maker2.address))

            await token.connect(maker1).approve(pool.address, ethers.utils.parseEther("1000"))
            await pool.connect(maker1).addLiquidity(ethers.utils.parseEther("1000"))

            await token.connect(maker2).approve(pool.address, ethers.utils.parseEther("1000"))
            await pool.connect(maker2).addLiquidity(ethers.utils.parseEther("1000"))

            // console.log("pool value:", await pool.totalValue())

            const times = 10

            let timestamp = await time.latest()

            const betters = [better1, better2, better3, better4, better5]

            for (let i = 0; i < times; i++) {
                const len = ranInt(2, 10)
                // const len = 5

                const { oddsList, rightIndx } = randomOddsList(len)

                console.log(oddsList)

                const conditionId = await makeCondition(core, oracle, timestamp, timestamp + ONE_HOUR_IN_SECS, oddsList)

                const tokenIds = []

                const rewards = []

                let sumBetAmount = ethers.utils.parseEther("0")

                let i = 0
                for (const better of betters) {
                    const betAmount = ethers.utils.parseEther("1")
                    sumBetAmount = sumBetAmount.add(betAmount)

                    await token.connect(better).approve(core.address, betAmount)

                    // await core.connect(better).bet(conditionId, i, betAmount)
                    // i++
                    await core.connect(better).bet(conditionId, ranInt(0, len), betAmount)

                    const tokenId = await bet.lastTokenId()
                    tokenIds.push(tokenId)

                    rewards.push((await bet.getBet(tokenId)).reward)
                }

                // console.log("oddsList:", oddsList)

                // console.log("rewards:", rewards)
                // console.log(
                //     "rewards:",
                //     rewards.reduce((a, b) => a.add(b)),
                // )

                // console.log("sumBetAmount:", sumBetAmount)

                timestamp += ONE_HOUR_IN_SECS
                await time.increaseTo(timestamp)

                await core.connect(oracle).resolveCondition(conditionId, rightIndx)

                for (const idx in betters) {
                    // 获得奖金
                    await core.connect(betters[idx]).resolveBet(tokenIds[idx])
                    console.log(await token.balanceOf(betters[idx].address))
                }
                await console.log("pool value:", await pool.totalValue())
            }

            console.log("after maker1 value:", await token.balanceOf(maker1.address))
            console.log("after maker2 value:", await token.balanceOf(maker2.address))

            console.log("blance of maker1:", await pool.balanceOf(maker1.address))
            console.log("blance of maker2:", await pool.balanceOf(maker2.address))

            await pool.connect(maker1).removeLiquidity(await pool.balanceOf(maker1.address))
            await pool.connect(maker2).removeLiquidity(await pool.balanceOf(maker2.address))

            console.log("after maker1 value:", await token.balanceOf(maker1.address))
            console.log("after maker2 value:", await token.balanceOf(maker2.address))

            await console.log("pool value:", await pool.totalValue())
        }).timeout(1000000000)
    })
})
