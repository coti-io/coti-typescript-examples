import { useState } from 'react';
import './App.css';

import { createWeb3Modal, defaultConfig, useWeb3ModalProvider } from '@web3modal/ethers/react'
import { BrowserProvider } from '@coti-io/coti-ethers'

// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata: {
    name: 'COTI Remix Plugin',
    description: 'Plugin to add full support for the COTI V2 network to the Remix IDE',
    url: '', // origin must match your domain & subdomain
    icons: ['']
  },

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: '...', // used for the Coinbase SDK
  defaultChainId: 1 // used for the Coinbase SDK
})

// 5. Create a Web3Modal instance
createWeb3Modal({
  ethersConfig,
  enableOnramp: false,
  chains: [{
    chainId: 13068200,
    name: 'COTI Devnet',
    currency: 'COTI',
    explorerUrl: 'https://explorer-devnet.coti.io',
    rpcUrl: 'https://devnet.coti.io/rpc'
  }],
  allowUnsupportedChain: true,
  defaultChain: {
    chainId: 13068200,
    name: 'COTI Devnet',
    currency: 'COTI',
    explorerUrl: 'https://explorer-devnet.coti.io/',
    rpcUrl: 'https://devnet.coti.io/rpc'
  },
  projectId: 'COTI_REMIX_PLUGIN',
  enableAnalytics: false, // Optional - defaults to your Cloud configuration
  allWallets: "HIDE"
})

function App() {
  const [aesKey, setAesKey] = useState('')
  const {walletProvider} = useWeb3ModalProvider()

  async function onboard() {
    if (walletProvider === undefined) throw Error('Wallet provider is undefined')

    const ethersProvider = new BrowserProvider(walletProvider)

    const signer = await ethersProvider.getSigner()

    await signer.generateOrRecoverAes()

    const key = signer.getUserOnboardInfo()

    setAesKey(key?.aesKey!)
  }

  return (
    <div className="App">
      <w3m-button />
      <button onClick={async () => await onboard()}>onboard</button>
      <p>AES KEY: {aesKey}</p>
    </div>
  );
}

export default App;
