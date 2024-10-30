import {Interface, ContractFactory, BytesLike, BaseWallet} from "@coti-io/coti-ethers"

export async function deploy(abi: Interface, bytecode: BytesLike, wallet: BaseWallet, args: any[]): Promise<any> {
    const contractFactory = new ContractFactory(abi, bytecode, wallet)
  
    const contract = await contractFactory.deploy(...args, { gasLimit: 15000000 })
  
    await contract.waitForDeployment()
  
    return contract
  }