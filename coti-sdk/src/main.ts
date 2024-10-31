import {
    buildInputText,
    buildStringInputText,
    decryptRSA,
    decryptString,
    decryptUint,
    generateRSAKeyPair,
    sign
} from "@coti-io/coti-sdk-typescript"
import { Contract, JsonRpcProvider, keccak256, Wallet } from "ethers"
import dotenv from "dotenv"

dotenv.config()

const RPC_URL = 'https://devnet.coti.io/rpc'
const ONBOARD_CONTRACT_ADDRESS = '0x413370ed41FB9EE3aea0B1B91FD336cC0be1Bad6'
const ONBOARD_CONTRACT_ABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "_from",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bytes",
                "name": "userKey",
                "type": "bytes"
            }
        ],
        "name": "AccountOnboarded",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "publicKey",
                "type": "bytes"
            },
            {
                "internalType": "bytes",
                "name": "signedEK",
                "type": "bytes"
            }
        ],
        "name": "onboardAccount",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]
const CONTRACT_ADDRESS = '0xc0ffee254729296a45a3885639AC7E10F9d54979'
const FUNCTION_SELECTOR = '0x11223344'

async function onboard(wallet: Wallet) {
    const accountOnboardContract = new Contract(ONBOARD_CONTRACT_ADDRESS, JSON.stringify(ONBOARD_CONTRACT_ABI), wallet)

    const rsaKeyPair = generateRSAKeyPair()

    const signedEK = sign(keccak256(rsaKeyPair.publicKey), wallet.privateKey)

    const receipt = await (await accountOnboardContract.onboardAccount(rsaKeyPair.publicKey, signedEK, {gasLimit: 15000000})).wait()

    const decodedLog = accountOnboardContract.interface.parseLog(receipt.logs[0])

    return decryptRSA(rsaKeyPair.privateKey, decodedLog!.args.userKey.substring(2))
}

function encryptDecryptUint(plaintext: bigint, wallet: Wallet, userKey: string) {
    console.log(`Encrypting uint: ${plaintext}`)

    const inputText = buildInputText(
        plaintext,
        { wallet, userKey },
        CONTRACT_ADDRESS,
        FUNCTION_SELECTOR
    )

    console.log(`Encrypted value: ${inputText.ciphertext} \n`)
    console.log(`Decrypting uint: ${inputText.ciphertext}`)

    const clearText = decryptUint(inputText.ciphertext, userKey)

    console.log(`Decrypted value: ${clearText} \n`)

    if (clearText !== plaintext) {
        throw new Error("Decrypted number does not match plaintext")
    }
}

function encryptDecryptString(plaintext: string, wallet: Wallet, userKey: string) {
    console.log(`Encrypting string: ${plaintext}`)

    const inputText = buildStringInputText(
        plaintext,
        { wallet, userKey },
        CONTRACT_ADDRESS,
        FUNCTION_SELECTOR
    )

    console.log(`Encrypted value: ${inputText.ciphertext.value} \n`)
    console.log(`Decrypting string: ${inputText.ciphertext.value}`)

    const clearText = decryptString(inputText.ciphertext, userKey)

    console.log(`Decrypted value: ${clearText} \n`)

    if (clearText !== plaintext) {
        throw new Error("Decrypted number does not match plaintext")
    }
}

async function main() {
    const provider = new JsonRpcProvider(RPC_URL)
    const wallet = new Wallet(process.env.PRIVATE_KEY!, provider)

    const userKey = await onboard(wallet)

    encryptDecryptUint(BigInt(123), wallet, userKey)
    encryptDecryptString("Hello, World!", wallet, userKey)
}

main()