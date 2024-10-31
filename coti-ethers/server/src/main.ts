import dotenv from "dotenv"

dotenv.config()

import {
    CotiNetwork,
    getDefaultProvider,
    isProviderConnected,
    printAccountDetails,
    printNetworkDetails,
    validateAddress
} from "@coti-io/coti-ethers";

import {setupAccount} from "./util/onboard"
import {dataOnChainExample} from "./examples/dataOnChain"
import {erc20Example} from "./examples/erc20"
import {nativeTransfer} from "./examples/nativeTransfer";
import { onChainDatabaseExample } from "./examples/onChainDatabase";

async function main() {
    const provider = getDefaultProvider(CotiNetwork.Testnet);
    if (!await isProviderConnected(provider))
        throw Error('provider not connected')
    await printNetworkDetails(provider)

    const owner = await setupAccount(provider)
    await printAccountDetails(provider, owner.address)

    const validAddress = await validateAddress(owner.address)
    if (!validAddress.valid) {
        throw Error('Invalid address')
    }

    if (process.argv[2] === "erc20") {
        console.log("Running erc20 example...")
        await erc20Example(provider, owner)
    } else if (process.argv[2] === "dataOnChain") {
        console.log("Running dataOnChain example...")
        await dataOnChainExample(provider, owner)
    } else if (process.argv[2] === "nativeTransfer") {
        console.log("Running nativeTransfer example...")
        await nativeTransfer(provider)
    } else if (process.argv[2] === "onChainDatabase") {
        console.log("Running onChainDatabase example...")
        await onChainDatabaseExample(provider, owner)
    } else {
        console.log("No example specified.")
    }
}

main()