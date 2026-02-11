# LEO Token

A token purchase dApp on the Ethereum blockchain.
The purpose of the project is to showcase the basic features of an ERC-20 token (Leonardo Token, symbol LEO) with a KYC-gated crowdsale, built on Ethereum smart contracts.


## Technologies

- Solidity ^0.8.20 (compiled with 0.8.28)
- OpenZeppelin 5.x
- Hardhat
- ethers.js v6
- React 18
- Vite
- Tailwind CSS 3


## Demo

- Head to [https://swayhead.github.io/leotoken/](https://swayhead.github.io/leotoken/)
- Install [MetaMask](https://metamask.io/) and switch to the **Sepolia** test network
- Get free test ETH from a [Sepolia faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
- Whitelist your address (contract owner only)
- Buy tokens!


## Local Development

```bash
# Start local Hardhat node
npm run node

# Deploy contracts locally (in another terminal)
npm run deploy:local

# Start frontend dev server
cd client
npm run dev
```


## License

[MIT](https://choosealicense.com/licenses/mit/)
