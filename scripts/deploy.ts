import fs from "fs"

import { ethers, network, run } from "hardhat"

async function main() {
    if (network.name === "hardhat") {
        console.warn(
            "You are trying to deploy a contract to the Hardhat Network, which" +
                "gets automatically created and destroyed every time. Use the Hardhat" +
                " option '--network localhost'",
        )
    }

    // ethers is available in the global scope
    const [deployer] = await ethers.getSigners()

    const TestToken = await ethers.getContractFactory("TestToken")

    const token = await TestToken.deploy(ethers.utils.parseEther("2000000"))
    await token.deployed()

    const Core = await ethers.getContractFactory("Core")
    // const LiquidityPoolERC20 = await ethers.getContractFactory("LiquidityPoolERC20")
    // const BetNFT = await ethers.getContractFactory("BetNFT")

    const core = await Core.deploy(deployer.address)
    await core.deployed()
    await (await core.createLp(token.address)).wait()

    const LiquidityPoolERC20 = await ethers.getContractFactory("LiquidityPoolERC20")
    const pool = LiquidityPoolERC20.attach(await core.pools(token.address))

    await (await token.approve(pool.address, ethers.utils.parseEther("1000000"))).wait()
    await (await pool.addLiquidity(ethers.utils.parseEther("1000000"))).wait()

    await fs.writeFileSync(
        "./dapp/address.json",
        JSON.stringify({
            Core: core.address,
            TestToken: token.address,
            TestPool: pool.address,
        }),
    )

    // verify contract
    // 因为 etherscan 会复用相同的合约验证
    // 合约未更新重新部署的话就会报已经验证过的错
    // 所以这里放在 try catch 中
    try {
        await run("verify:verify", {
            address: core.address,
            constructorArguments: [deployer.address],
        })
    } catch (error) {
        console.log(error)
    }

    try {
        await run("verify:verify", {
            address: await core.betNFT(),
            constructorArguments: [core.address],
        })
    } catch (error) {
        console.log(error)
    }

    try {
        await run("verify:verify", {
            address: await core.pools(token.address),
            constructorArguments: [core.address, token.address],
        })
    } catch (error) {
        console.log(error)
    }

    try {
        await run("verify:verify", {
            contract: "contracts/test/TestToken.sol:TestToken",
            address: token.address,
            constructorArguments: [ethers.utils.parseEther("1000000")],
        })
    } catch (error) {
        console.log(error)
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
