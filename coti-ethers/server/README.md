# coti-ethers | server

### Faucet

🤖 To request devnet/testnet funds use our [faucet](https://faucet.coti.io)

# coti-ethers examples

> [!NOTE]
> Please refer to the latest [tags](https://github.com/coti-io/coti-typescript-examples/tags) to find the most stable version to use.

The following examples are available for **execution**:

| Contract       | Contract Description                                                                                                                          |
|----------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| AccountOnboard | Onboard a EOA account - During onboard network creates AES unique for that EOA which is used for decrypting values sent back from the network |
| ERC20Example   | Confidential ERC20 - deploy and transfer encrypted amount of funds                                                                            |
| DataOnChain    | Basic encryption and decryption - Good place to start explorining network capabilties                                                         |

## Usage

1.  Install dependencies

    ```bash
    npm install
    ```


> [!NOTE]  
> Ensure your environment meets all the pre-requisites. Visit the [pre-requisites section of the readme](https://github.com/coti-io/coti-typescript-examples/blob/main/README.md).

### ERC20

The following process will help you run the [**`erc20.ts`**](https://github.com/coti-io/coti-typescript-examples/blob/main/coti-ethers/server/src/examples/erc20.ts) example from the [**COTI Typescript Examples**](https://github.com/coti-io/coti-typescript-examples) project. The script includes functions for transferring tokens, approving allowances, and handling confidential transactions. The script uses various utilities from the SDK to manage confidential accounts, decrypt values, and ensure correct balances and allowances during transactions. It will also:

* Create a EOA (Externally Owned Account)
* Validate minimum balance

1.  Run `erc20.ts` script

    ```bash
    npm run erc20
    ```

    \
    Running this test will automatically create an account and a key/value pair with name: `SIGNING_KEY` (visible in the .env file). The script will output something like this:\


    ```bash
    npm run v1.22.22
    $ ts-node src/main.ts erc20
    ************* Created new account  0x87c13D0f5903a68bE8288E52b23A220CeC6b1aB6  and saved into .env file *************
    /Users/user/projects/coti-sdk-typescript-examples/src/util/onboard.ts:13
          throw new Error(`Please use faucet to fund account ${wallet.address}`)
                ^
    Error: Please use faucet to fund account 0x87c13D0f5903a68bE8288E52b23A220CeC6b1aB6
    ```

    \
    It is normal to receive the exception `Error: Please use faucet to fund account` on the first run. This will be resolved once the account is funded.  

2. Head to the faucet at [**https://faucet.coti.io**](https://faucet.coti.io) to get devnet funds. \
   Send the following message to the BOT using your newly created account, visible in the fourth line of the response `Created new account  0x87c13D0f5903a68bE8288E52b23A220CeC6b1aB6 [...]`\
   \
   `devnet <account address>`\
   \
   The bot will reply with the message:\
   \
   `<username> faucet transferred 5 COTIv2 (devnet)` \
   &#x20;
3.  Run `erc20.ts` script once more

    ```bash
    npm run erc20
    ```

### Data On Chain

The following process will help you run the [**`dataOnChain.ts`**](https://github.com/coti-io/coti-typescript-examples/blob/main/coti-ethers/server/src/examples/dataOnChain.ts) example from the [**COTI Typescript Examples**](https://github.com/coti-io/coti-typescript-examples) project. The script includes functions for storing values on-chain that are encrypted using using either your user or the network key, and then reading these encrypted values and attempting to decrypt them using either your key or another users key.

1.  Run `dataOnChain.ts` script

    ```bash
    npm run dataOnChain
    ```


#### Pending enhancements

- Extending examples such as confidential ERC20 minting, confidential NFT (deployment and actions) and more.

#### To report issues, please create a [github issue](https://github.com/coti-io/coti-typescript-examples/issues)