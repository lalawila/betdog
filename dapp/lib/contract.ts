import { providers, Contract, Wallet, utils } from "ethers"

import coreABI from "#/abi/contracts/interfaces/ICore.sol/ICore.json"
import addresses from "#/address.json"

const { AlchemyProvider } = providers

const provider = new AlchemyProvider("maticmum", process.env["ALCHEMY_MUMBAI_KEY"])

const signer = new Wallet(process.env["PRIVATE_KEY"] as string, provider)

const core = new Contract(addresses.Core, coreABI, signer)

export { core }
