import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "@nomiclabs/hardhat-etherscan"

import "dotenv/config"

const config: HardhatUserConfig = {
    solidity: "0.8.17",
    networks: {
        hardhat: {
            chainId: 1337, // We set 1337 to make interacting with MetaMask simpler
        },
        goerli: {
            url: `https://eth-goerli.g.alchemy.com/v2/${process.env["ALCHEMY_GOERLI_KEY"]}`,
            accounts: [process.env["PRIVATE_KEY"] as string],
        },
    },
    etherscan: {
        apiKey: {
            mainnet: process.env["MAINNET_KEY"] as string,
            mumbai: process.env["MUMBAI_KEY"] as string,
        },
        customChains: [
            {
                network: "mumbai",
                chainId: 80001,
                urls: {
                    apiURL: "https://api-testnet.polygonscan.com/",
                    browserURL: "https://mumbai.polygonscan.com/",
                },
            },
        ],
    },
}

export default config
