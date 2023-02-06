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

    await core.createLp(token.address)
    // await core.createBet()

    await token.transfer(maker.address, ethers.utils.parseEther("400"))
    await token.transfer(better.address, ethers.utils.parseEther("400"))

    const multiplier = 1e9

    return {
        core,
        betNFT: BetNFT.attach(await core.betNFT()),
        pool: LiquidityPoolERC20.attach(await core.pools(token.address)),
        token,
        owner,
        oracle,
        maker,
        better,
        multiplier,
    }
}

async function testBetting(name: string, outcomes: string[], oddsList: number[], betIndex: number) {
    const { token, core, betNFT, pool, oracle, maker, better, multiplier } = await loadFixture(
        deployContracts,
    )

    const amount = ethers.utils.parseEther("200")
    await token.connect(maker).approve(pool.address, amount)
    await pool.connect(maker).addLiquidity(amount)

    const lokedReserve = (await pool.totalValue()).div(2)

    const betAmount = ethers.utils.parseEther("0.005")

    const gameId = (await core.lastGameId()).add(1)
    const gambleId = (await core.lastGambleId()).add(1)
    const tokenId = (await betNFT.lastTokenId()).add(1)

    await expect(core.connect(oracle).createGame(ethers.utils.formatBytes32String("")))
        .to.emit(core, "CreatedGame")
        .withArgs(gameId)

    await core.connect(oracle).createGamble(
        token.address,
        gameId,
        name,
        outcomes,
        oddsList.map((odds) => odds * multiplier),
        lokedReserve,
    )

    token.connect(better).approve(core.address, betAmount)

    await expect(core.connect(better).bet(gambleId, betIndex, betAmount))
        .to.emit(betNFT, "MintedBet")
        .withArgs(tokenId)

    // await time.increaseTo(endTime)

    // 设置胜利场次
    await core.connect(oracle).resolveGame(gameId)
    await core.connect(oracle).resolveGamble(gambleId, betIndex)

    console.log(await token.balanceOf(better.address))

    // 获得奖金
    await core.connect(better).withdraw(tokenId)

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
    describe("Game", function () {
        it("Should fail if not oracle call", async function () {
            const { core } = await loadFixture(deployContracts)

            await expect(
                core.createGame(ethers.utils.formatBytes32String("")),
            ).to.be.revertedWithCustomError(core, "MustBeOracle")
        })
        it("Create game", async function () {
            const { core, oracle, pool, token, maker } = await loadFixture(deployContracts)

            const amount = ethers.utils.parseEther("200")
            await token.connect(maker).approve(pool.address, amount)
            await pool.connect(maker).addLiquidity(amount)

            await expect(
                core.connect(oracle).createGame(
                    // [5 * multiplier, 1.25 * multiplier],
                    ethers.utils.formatBytes32String(""),
                ),
            ).not.to.be.reverted
        })
    })
    describe("Betting", function () {
        it("Full steps of betting", async function () {
            await testBetting("Winner", ["Home", "Away"], [5, 1.25], 1)
            // await testBetting([5, 2.5, 2.5], 1)
        })
    })
})
