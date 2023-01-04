import { ethers, network } from "hardhat"

async function main() {
    if (network.name === "hardhat") {
        console.warn(
            "You are trying to deploy a contract to the Hardhat Network, which" +
                "gets automatically created and destroyed every time. Use the Hardhat" +
                " option '--network localhost'",
        )
    }

    // ethers is available in the global scope
    const [deployer, oracle] = await ethers.getSigners()

    const TestToken = await ethers.getContractFactory("TestToken")
    const token = await TestToken.deploy(ethers.utils.parseEther("100"))
    await token.deployed()

    const Core = await ethers.getContractFactory("Core")
    const core = await Core.deploy(oracle.address)
    await core.deployed()

    const LiquidityPoolERC20 = await ethers.getContractFactory("LiquidityPoolERC20")
    const pool = await LiquidityPoolERC20.deploy(core.address, token.address)

    await pool.deployed()

    const BetNFT = await ethers.getContractFactory("BetNFT")
    const bet = await BetNFT.deploy(core.address)

    await core.setBet(bet.address)
    await core.setLP(pool.address)

    console.log("core address:", core.address)
    console.log("pool address:", pool.address)
    console.log("bet address:", bet.address)
    console.log("deployer address:", deployer.address)
    console.log("oracle address:", oracle.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
