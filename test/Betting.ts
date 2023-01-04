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

        const pool = await LiquidityPoolERC20.deploy(core.address, token.address)
        const bet = await BetNFT.deploy(core.address)

        await core.setBet(bet.address)
        await core.setLP(pool.address)

        await token.transfer(maker1.address, ethers.utils.parseEther("1000"))
        await token.transfer(maker2.address, ethers.utils.parseEther("1000"))

        await token.transfer(better1.address, ethers.utils.parseEther("100"))
        await token.transfer(better2.address, ethers.utils.parseEther("100"))
        await token.transfer(better3.address, ethers.utils.parseEther("100"))
        await token.transfer(better4.address, ethers.utils.parseEther("100"))
        await token.transfer(better5.address, ethers.utils.parseEther("100"))

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
    async function makeCondition(
        core: any,
        oracle: any,
        startTime: any,
        endTime: any,
        oddsList: number[],
    ) {
        const valueOfLiquidity = ethers.utils.parseEther("100")
        const multiplier = 1e9

        const response = await core.connect(oracle).createCondition(
            oddsList.map((x) => Math.floor(x * multiplier)),
            valueOfLiquidity,
            startTime,
            endTime,
        )

        // await response.wait()

        return await core.lastConditionId()
    }

    describe("Benchmarking", async function () {
        it("Benchmarking", async function () {
            const {
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
            } = await loadFixture(deployContracts)

            const valueOfLiquidity = ethers.utils.parseEther("1000")

            await token.connect(maker1).approve(pool.address, valueOfLiquidity)
            await pool.connect(maker1).addLiquidity(valueOfLiquidity)

            await token.connect(maker2).approve(pool.address, valueOfLiquidity)
            await pool.connect(maker2).addLiquidity(valueOfLiquidity)

            const times = 1

            let timestamp = await time.latest()

            const betters = [better1, better2, better3, better4, better5]

            for (let i = 0; i < times; i++) {
                const len = ranInt(2, 10)

                const oddsList = randomOddsList(len)
                console.log(len)
                console.log(oddsList)

                const conditionId = await makeCondition(
                    core,
                    oracle,
                    timestamp,
                    timestamp + ONE_HOUR_IN_SECS,
                    oddsList,
                )

                const tokenIds = []

                for (const better of betters) {
                    const betAmount = (await token.balanceOf(better.address)).div(2)

                    await token.connect(better).approve(core.address, betAmount)

                    await core.connect(better).bet(conditionId, ranInt(0, len), betAmount)

                    tokenIds.push(await bet.lastTokenId())
                }

                timestamp += ONE_HOUR_IN_SECS
                await time.increaseTo(timestamp)

                await core.connect(oracle).resolveCondition(conditionId, ranInt(0, len))

                for (const idx in betters) {
                    // 获得奖金
                    await core.connect(betters[idx]).resolveBet(tokenIds[idx])
                    console.log(await token.balanceOf(betters[idx].address))
                }
            }
        })
    })
})
