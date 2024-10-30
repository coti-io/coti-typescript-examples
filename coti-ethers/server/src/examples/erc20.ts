import * as fs from "fs"
import * as path from "path"

import {itUint, Provider, Wallet} from "@coti-io/coti-ethers"
import {PrivateToken} from "@coti-io/coti-contracts-examples/typechain-types"
import {assert} from "../util/assert"
import {deploy} from "../util/contracts"

const GAS_LIMIT = 12000000

async function assertBalance(token: PrivateToken, amount: bigint, user: Wallet) {
    const ctBalance = await token["balanceOf(address)"](user.address)
    let balance = await user.decryptValue(ctBalance) as bigint
    assert(balance === amount, `Expected balance to be ${amount}, but got ${balance}`)
    return balance
}

async function assertAllowance(
    token: PrivateToken,
    amount: bigint,
    owner: Wallet,
    spenderAddress: string
) {
    const ctAllowance = (await token["allowance(address,address)"](owner.address, spenderAddress))[1]
    let allowance = await owner.decryptValue(ctAllowance)
    assert(allowance === amount, `Expected allowance to be ${amount}, but got ${allowance}`)
}

async function getTokenContract(user: Wallet): Promise<PrivateToken> {
    const privateTokenFilePath = path.join(
        "node_modules",
        "@coti-io",
        "coti-contracts-examples",
        "artifacts",
        "contracts",
        "PrivateToken.sol",
        "PrivateToken.json"
    )

    const privateTokenArtifacts: any = JSON.parse(fs.readFileSync(privateTokenFilePath, "utf8"))

    const contract = await deploy(
        privateTokenArtifacts["abi"],
        privateTokenArtifacts["bytecode"],
        user,
        ["My Private Token", "PTOK"]
    )

    return contract
}

export async function erc20Example(provider: Provider, user: Wallet) {
    const token: PrivateToken = await getTokenContract(user)

    await (
        await token
            .mint(user.address, 5000n, { gasLimit: GAS_LIMIT })
    ).wait()

    let balance = await assertBalance(token, 5000n, user)

    const otherWallet = new Wallet(Wallet.createRandom(provider).privateKey)

    const transferAmount = 5n

    balance = await transfer(token, balance, user, otherWallet, transferAmount)

    await approve(token, user, otherWallet, transferAmount * 10n)

    balance = await transferFrom(token, balance, user, otherWallet, transferAmount)
}

async function transfer(
    token: PrivateToken,
    initlalBalance: bigint,
    owner: Wallet,
    alice: Wallet,
    transferAmount: bigint
) {
    console.log("************* Private transfer ", transferAmount, " from my account to Alice *************")

    const itAmount = await owner.encryptValue(transferAmount, await token.getAddress(), token["transfer(address,(uint256,bytes))"].fragment.selector) as itUint

    await (
        await token
            ["transfer(address,(uint256,bytes))"]
            (alice.address, itAmount, { gasLimit: GAS_LIMIT })
    ).wait()

    return await assertBalance(token, initlalBalance - transferAmount, owner)
}

async function approve(
    token: PrivateToken,
    owner: Wallet,
    alice: Wallet,
    approveAmount: bigint
) {
    console.log("************* Private approve", approveAmount, " to Alice address *************")

    const itAmount = await owner.encryptValue(approveAmount, await token.getAddress(), token["approve(address,(uint256,bytes))"].fragment.selector) as itUint

    await (
        await token
            ["approve(address,(uint256,bytes))"]
            (alice.address, itAmount, { gasLimit: GAS_LIMIT })
    ).wait()

    await assertAllowance(token, approveAmount, owner, alice.address)
}

async function transferFrom(
    token: PrivateToken,
    initlalBalance: bigint,
    owner: Wallet,
    alice: Wallet,
    transferAmount: bigint
) {
    console.log("************* Private transferFrom ", transferAmount, " from my account to Alice *************")

    const itAmount = await owner.encryptValue(BigInt(transferAmount), await token.getAddress(), token["transferFrom(address,address,(uint256,bytes))"].fragment.selector) as itUint
    
    await (
        await token
            ["transferFrom(address,address,(uint256,bytes))"]
            (owner.address, alice.address, itAmount, { gasLimit: GAS_LIMIT })
    ).wait()

    return await assertBalance(token, initlalBalance - transferAmount, owner)
}