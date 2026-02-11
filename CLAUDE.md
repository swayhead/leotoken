# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LeoToken is a full-stack Ethereum dApp: an ERC-20 token ("Leonardo Token", symbol LEO) with a KYC-gated crowdsale, plus a React frontend for purchasing tokens via MetaMask.

## Prerequisites

- Node.js >= 20 (see `.nvmrc`; use `nvm use` to switch)

## Commands

### Smart Contracts (run from project root)
```bash
npm run compile                    # Compile contracts + export ABIs to client/
npm test                           # Run all contract tests
npx hardhat test test/LeoToken.test.js  # Run a single test file
npm run node                       # Start local Hardhat node
npm run deploy:local               # Deploy to local Hardhat node
npm run deploy:sepolia             # Deploy to Sepolia testnet
```

### React Frontend (run from client/)
```bash
cd client
npm run dev      # Dev server (localhost:3000), Vite
npm run build    # Production build
npm run preview  # Preview production build
```

## Architecture

### Smart Contracts (`contracts/`)
- **LeoToken.sol** — ERC-20 token extending OpenZeppelin's `ERC20`. Mints `INITIAL_TOKENS` to deployer.
- **Crowdsale.sol** — Base crowdsale with extensible hooks: `_preValidatePurchase`, `_postValidatePurchase`, `_processPurchase`, `_deliverTokens`. Uses `.call{value}` for safe ETH forwarding.
- **MyTokenSale.sol** — Extends Crowdsale, overrides `_preValidatePurchase` to enforce KYC whitelist check.
- **KycContract.sol** — Owner-restricted address whitelist (Ownable + mapping-based) for KYC approval.

Solidity ^0.8.20, compiled with solc 0.8.28, optimizer (200 runs). OpenZeppelin v5.2.0.

### Deployment Flow (`scripts/deploy.js`)
1. Deploy LeoToken with initial supply
2. Deploy KycContract
3. Deploy MyTokenSale (rate=1, wallet=deployer, linked to token & KYC)
4. Transfer all tokens from deployer to MyTokenSale contract
5. Export ABIs and deployment addresses to `client/src/contracts/`

### Frontend (`client/src/`)
- **App.jsx** — Functional component with hooks managing ethers.js provider, contract instances, MetaMask interaction, token buying, and KYC whitelisting.
- **components/Card.jsx** — Reusable Tailwind-styled card component.
- **contracts/** — Contract ABIs (exported by `npm run compile`) and `deployments.json` (written by deploy script).

Built with Vite + React 18 + Tailwind CSS v3. Uses ethers.js v6 for blockchain interaction.

## Key Configuration

- **hardhat.config.js** — Networks: `localhost` (local:8545), `sepolia` (Infura). Solidity 0.8.28 with optimizer.
- **.env** — `INITIAL_TOKENS` (token supply), `MNEMONIC` (HD wallet seed), `INFURA_API_KEY`. See `.env_example`.
- Network validation in App.jsx: expects Sepolia (chainId `11155111`) in production, Hardhat local (chainId `31337`) in development.

## Testing

Contract tests use Hardhat's Mocha runner with Chai and `@nomicfoundation/hardhat-chai-matchers` (ethers.js-aware assertions). Tests are in `test/`. Run with `npm test`.
