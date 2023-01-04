import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"

async function deployContracts() {
    const TestToken = await ethers.getContractFactory("TestToken")

    const Core = await ethers.getContractFactory("Core")

    const BetNFT = await ethers.getContractFactory("BetNFT")
    const LiquidityPoolERC20 = await ethers.getContractFactory("LiquidityPoolERC20")

    const [owner, oracle, maker, better] = await ethers.getSigners()

    const token = await TestToken.deploy(ethers.utils.parseEther("1000"))
    const core = await Core.deploy(oracle.address)

    const pool = await LiquidityPoolERC20.deploy(core.address, token.address)
    const bet = await BetNFT.deploy(core.address)

    await core.setBet(bet.address)
    await core.setLP(pool.address)

    await token.transfer(maker.address, ethers.utils.parseEther("400"))
    await token.transfer(better.address, ethers.utils.parseEther("400"))

    const ONE_DAY_IN_SECS = 24 * 60 * 60
    const startTime = (await time.latest()) + ONE_DAY_IN_SECS
    const endTime = startTime + ONE_DAY_IN_SECS

    return {
        core,
        bet,
        pool,
        token,
        owner,
        oracle,
        maker,
        better,
        startTime,
        endTime,
    }
}

async function testBetting(oddsList: number[], betIndex: number) {
    const { token, core, pool, bet, oracle, maker, better, startTime, endTime } = await loadFixture(
        deployContracts,
    )

    const amount = ethers.utils.parseEther("200")
    await token.connect(maker).approve(pool.address, amount)
    await pool.connect(maker).addLiquidity(amount)

    const valueOfLiquidity = (await pool.totalTokenValue()).div(2)

    const multiplier = 1e9

    const conditionId = 1
    const tokenId = 1
    const betAmount = ethers.utils.parseEther("0.005")

    await expect(
        core.connect(oracle).createCondition(
            oddsList.map((odds) => odds * multiplier),
            valueOfLiquidity,
            startTime,
            endTime,
        ),
    )
        .to.emit(core, "CreatedCondition")
        .withArgs(conditionId)

    token.connect(better).approve(core.address, betAmount)

    console.log("before reserves:", (await core.getCondition(conditionId)).reserves)
    const beforeSumReserves = (await core.getCondition(conditionId)).reserves.reduce((a, b) =>
        a.add(b),
    )
    console.log("before sum of reserves:", beforeSumReserves)

    await expect(core.connect(better).bet(conditionId, betIndex, betAmount))
        .to.emit(bet, "MintedBet")
        .withArgs(tokenId)

    const reward = (await bet.getBet(tokenId)).reward

    console.log("betAmount:", betAmount)
    console.log("reward:", reward)
    console.log("after reserves:", (await core.getCondition(conditionId)).reserves)

    // console.log("reserves:", (await core.getCondition(conditionId)).reserves)
    const afterSumReserves = (await core.getCondition(conditionId)).reserves.reduce((a, b) =>
        a.add(b),
    )
    console.log("after sum of reserves:", afterSumReserves)

    console.log("before and bet amount:", beforeSumReserves.add(betAmount))
    console.log("after and reward:", afterSumReserves.add(reward))

    console.log(
        "real odds:",
        reward.add(betAmount).mul(multiplier).div(betAmount).toNumber() / multiplier,
    )

    await time.increaseTo(endTime)

    // 设置胜利场次
    await core.connect(oracle).resolveCondition(conditionId, betIndex)

    console.log(await token.balanceOf(better.address))

    // 获得奖金
    await core.connect(better).resolveBet(tokenId)

    console.log(await token.balanceOf(better.address))
}

describe("BetDog", function () {
    describe("LiquidityPool", function () {
        it("Should liquidity token right", async function () {
            const { pool, token, maker } = await loadFixture(deployContracts)

            const amount = ethers.utils.parseEther("4")

            await token.connect(maker).approve(pool.address, amount)
            await pool.connect(maker).addLiquidity(amount)
            expect(await pool.balanceOf(maker.address)).to.equal(amount)
        })
    })
    describe("Condition", function () {
        it("Should fail if not oracle call", async function () {
            const { core, startTime, endTime, pool } = await loadFixture(deployContracts)

            const valueOfLiquidity = (await pool.totalTokenValue()).div(2)

            const multiplier = 1e9

            await expect(
                core.createCondition(
                    [5 * multiplier, 1.25 * multiplier],
                    valueOfLiquidity,
                    startTime,
                    endTime,
                ),
            ).to.be.revertedWithCustomError(core, "MustBeOracle")
        })
        it("Create condition", async function () {
            const { core, oracle, startTime, endTime, pool, token, maker } = await loadFixture(
                deployContracts,
            )
            const multiplier = 1e9

            const amount = ethers.utils.parseEther("200")
            await token.connect(maker).approve(pool.address, amount)
            await pool.connect(maker).addLiquidity(amount)

            const valueOfLiquidity = (await pool.totalTokenValue()).div(2)

            await expect(
                core
                    .connect(oracle)
                    .createCondition(
                        [5 * multiplier, 1.25 * multiplier],
                        valueOfLiquidity,
                        startTime,
                        endTime,
                    ),
            ).not.to.be.reverted
        })
    })
    describe("Betting", function () {
        it("Full steps of betting", async function () {
            await testBetting([5, 1.25], 1)
            // await testBetting([5, 2.5, 2.5], 1)
        })
    })
})
