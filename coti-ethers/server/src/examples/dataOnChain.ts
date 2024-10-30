import * as fs from "fs"
import * as path from "path"

import { itString, itUint, Provider, Wallet } from "@coti-io/coti-ethers"
import {assert} from "../util/assert"
import {validateTxStatus} from "../util/general-utils";
import { deploy } from "../util/contracts"
import { DataOnChain } from "@coti-io/coti-contracts-examples/typechain-types"

const GAS_LIMIT = 12000000

async function getDataOnChainContract(user: Wallet): Promise<DataOnChain> {
    const dataOnChainFilePath = path.join(
        "node_modules",
        "@coti-io",
        "coti-contracts-examples",
        "artifacts",
        "contracts",
        "DataOnChain.sol",
        "DataOnChain.json"
    )

    const dataOnChainArtifacts: any = JSON.parse(fs.readFileSync(dataOnChainFilePath, "utf8"))

    const contract = await deploy(
        dataOnChainArtifacts["abi"],
        dataOnChainArtifacts["bytecode"],
        user,
        []
    )

    return contract
}

export async function dataOnChainExample(provider: Provider, user: Wallet) {
    const contract: DataOnChain = await getDataOnChainContract(user)
    const value = 100n
    console.log(`setting network encrypted value: ${value}`)
    await (await contract.setSomeEncryptedValue(value, { gasLimit: GAS_LIMIT })).wait()

    const networkEncryptedValue = await contract.getNetworkSomeEncryptedValue()
    console.log(`Network encrypted value: ${networkEncryptedValue}`)
    console.log(`Network decrypted value: ${await user.decryptValue(networkEncryptedValue)}`)

    await (await contract.setUserSomeEncryptedValue({ gasLimit: GAS_LIMIT })).wait()
    console.log(`setting user encrypted value: ${value}`)

    const userEncryptedValue = await contract.getUserSomeEncryptedValue()
    console.log(`User encrypted value: ${userEncryptedValue}`)
    console.log(`User decrypted value: ${await user.decryptValue(userEncryptedValue)}`)

    const value2 = 555n
    await setValueWithEncryptedInput(contract, user, value2)

    await (await contract.add({ gasLimit: GAS_LIMIT })).wait()

    const encryptedResult = await contract.getUserArithmeticResult()
    const decryptedResult = await user.decryptValue(encryptedResult)
    const expectedResult = value + value2
    assert(
        decryptedResult === expectedResult,
        `Expected addition result to be ${expectedResult}, but got ${decryptedResult}`
    )
    console.log(`User decrypted addition result: ${decryptedResult}`)

    await testUserEncryptedString(contract, user)
}

async function testUserEncryptedString(
    contract: DataOnChain,
    user: Wallet
) {
    const testString = 'test string'
    const func = contract.setSomeEncryptedStringEncryptedInput
    const encryptedString = await user.encryptValue(testString, await contract.getAddress(), func.fragment.selector) as itString
    let response = await (await contract.setSomeEncryptedStringEncryptedInput(encryptedString, {gasLimit: GAS_LIMIT})).wait()
    if (!validateTxStatus(response)) {
        throw Error("tx setSomeEncryptedStringEncryptedInput failed")
    }
    response = await (await contract.setUserSomeEncryptedStringEncryptedInput({ gasLimit: GAS_LIMIT })).wait()
    if (!validateTxStatus(response)) {
        throw Error("tx to setUserSomeEncryptedStringEncryptedInput failed")
    }
    const userEncyData = await contract.getUserSomeEncryptedStringEncryptedInput()
    const decryptedUserString = await user.decryptValue(userEncyData)
    assert(testString === decryptedUserString,
        `Expected test result to be ${testString}, but got ${decryptedUserString}`
    )
    console.log(`user data decrypted successfully - the value is: ${decryptedUserString}`)
}

async function setValueWithEncryptedInput(
    contract: DataOnChain,
    user: Wallet,
    value: bigint
) {
    console.log(`setting network encrypted value using user encrypted value: ${value}`)
    const func = contract.setSomeEncryptedValueEncryptedInput
    const itValue = await user.encryptValue(value.valueOf(), await contract.getAddress(), func.fragment.selector) as itUint

    await (await func(itValue, { gasLimit: GAS_LIMIT })).wait()

    await (await contract.setUserSomeEncryptedValueEncryptedInput({ gasLimit: GAS_LIMIT })).wait()

    const userEncryptedValue = await contract.getUserSomeEncryptedValueEncryptedInput()
    const decryptedValue = await user.decryptValue(userEncryptedValue)
    assert(decryptedValue === value, `Expected value to be ${value}, but got ${decryptedValue}`)
    console.log(`User decrypted using user encrypted value: ${decryptedValue}`)
}