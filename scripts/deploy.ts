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

    const token = await TestToken.deploy(ethers.utils.parseEther("100"))
    await token.deployed()

    const Core = await ethers.getContractFactory("Core")
    // const LiquidityPoolERC20 = await ethers.getContractFactory("LiquidityPoolERC20")
    // const BetNFT = await ethers.getContractFactory("BetNFT")

    const core = await Core.deploy(deployer.address)
    await core.deployed()
    await core.createLp(token.address)

    fs.writeFileSync(
        "./dapp/address.json",
        JSON.stringify({
            Core: core.address,
            TestToken: token.address,
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
    } catch {}

    try {
        await run("verify:verify", {
            address: await core.betNFT(),
            constructorArguments: [core.address],
        })
    } catch {}

    try {
        await run("verify:verify", {
            address: await core.pools(token.address),
            constructorArguments: [core.address, token.address],
        })
    } catch {}
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
