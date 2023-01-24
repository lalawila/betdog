import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "@nomiclabs/hardhat-etherscan"
import "hardhat-abi-exporter"

import "dotenv/config"

const deployer = process.env["PRIVATE_KEY"] as string

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.17",
        settings: {
            optimizer: {
                enabled: true,
            },
        },
    },
    networks: {
        hardhat: {
            chainId: 1337, // We set 1337 to make interacting with MetaMask simpler
        },
        goerli: {
            url: `https://eth-goerli.g.alchemy.com/v2/${process.env["ALCHEMY_GOERLI_KEY"]}`,
            accounts: [deployer],
        },
        polygonMumbai: {
            url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env["ALCHEMY_MUMBAI_KEY"]}`,
            accounts: [deployer],
        },
    },
    etherscan: {
        apiKey: {
            mainnet: process.env["MAINNET_SCAN_KEY"] as string, // eth
            polygon: process.env["MATIC_SCAN_KEY"] as string, // polgon mainnet
            polygonMumbai: process.env["MATIC_SCAN_KEY"] as string, // polgon testnet
        },
    },
    abiExporter: {
        path: "./dapp/abi",
        runOnCompile: true,
        clear: true,
        only: ["IBetNFT.sol", "ICore.sol", "ILiquidityPoolERC20.sol"],
    },
}

export default config
