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

        const [owner, oracle, maker1, maker2, better1, better2, better3, better4, better5] =
            await ethers.getSigners()

        const token = await TestToken.deploy(ethers.utils.parseEther("10000"))
        const core = await Core.deploy(oracle.address)

        await core.createLp(token.address)

        const multiplier = 1e9

        return {
            core,
            betNFT: BetNFT.attach(await core.betNFT()),
            pool: LiquidityPoolERC20.attach(await core.pools(token.address)),
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
            multiplier,
        }
    }

    describe("Benchmarking", async function () {
        it("Benchmarking", async function () {
            const {
                core,
                betNFT,
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
                multiplier,
            } = await loadFixture(deployContracts)

            await token.transfer(maker1.address, ethers.utils.parseEther("2000"))
            await token.transfer(maker2.address, ethers.utils.parseEther("2000"))

            await token.transfer(better1.address, ethers.utils.parseEther("1000"))
            await token.transfer(better2.address, ethers.utils.parseEther("1000"))
            await token.transfer(better3.address, ethers.utils.parseEther("1000"))
            await token.transfer(better4.address, ethers.utils.parseEther("1000"))
            await token.transfer(better5.address, ethers.utils.parseEther("1000"))

            // console.log("before maker1 value:", await token.balanceOf(maker1.address))
            // console.log("before maker2 value:", await token.balanceOf(maker2.address))

            await token.connect(maker1).approve(pool.address, ethers.utils.parseEther("1000"))
            await pool.connect(maker1).addLiquidity(ethers.utils.parseEther("1000"))

            await token.connect(maker2).approve(pool.address, ethers.utils.parseEther("1000"))
            await pool.connect(maker2).addLiquidity(ethers.utils.parseEther("1000"))

            const beforePoolValue = await pool.totalValue()
            console.log("before pool value:", beforePoolValue)

            const betters = [better1, better2, better3, better4, better5]

            const betAmount = ethers.utils.parseEther("1")

            const times = 100
            for (let i = 0; i < times; i++) {
                const timestamp = await time.latest()

                const len = ranInt(2, 10)

                const { oddsList, winner } = randomOddsList(len)

                await core.connect(oracle).createGame(ethers.utils.formatBytes32String(""))

                const gameId = await core.lastGameId()

                await core.connect(oracle).createGamble(
                    token.address,
                    gameId,
                    "Guess Winner",
                    Array(oddsList.length).fill(""),
                    oddsList.map((x) => Math.floor(x * multiplier)),
                    ethers.utils.parseEther("100"),
                )

                const gambleId = await core.lastGambleId()

                const tokenIds = []

                for (const better of betters) {
                    await token.connect(better).approve(core.address, betAmount)

                    await core.connect(better).bet(gameId, ranInt(0, len), betAmount)

                    const tokenId = await betNFT.lastTokenId()
                    tokenIds.push(tokenId)
                }

                await core.connect(oracle).resolveGame(gameId)

                await core.connect(oracle).resolveGamble(gambleId, winner)

                for (const idx in betters) {
                    // 获得奖金
                    await core.connect(betters[idx]).withdraw(tokenIds[idx])
                }
            }

            const afterPoolValue = await pool.totalValue()

            await pool.connect(maker1).removeLiquidity(await pool.balanceOf(maker1.address))
            await pool.connect(maker2).removeLiquidity(await pool.balanceOf(maker2.address))

            // console.log("after maker1 value:", await token.balanceOf(maker1.address))
            // console.log("after maker2 value:", await token.balanceOf(maker2.address))
            console.log(`-------- after ${times} times game --------`)

            await console.log("after pool value:", afterPoolValue)

            const totalBetValue = betAmount.mul(times).mul(betters.length)
            console.log("total bet value:", totalBetValue)

            const netProfit = afterPoolValue.sub(beforePoolValue)
            console.log("net profit:", netProfit)
            console.log(
                `Liquidity Fee: netProfit / totalBetValue = ${netProfit
                    .mul(100)
                    .div(totalBetValue)}%`,
            )
        }).timeout(1000000000)
    })
})
