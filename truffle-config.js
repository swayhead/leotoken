const path = require("path");
const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config('./.env');
console.log(process.env.MNEMONIC)

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545
    },
    with_metamask: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, 'http://127.0.0.1:8545', 0),
      network_id: "5777"
    },
    infura_ropsten: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, 'https://ropsten.infura.io/v3/aa381c77520d4647a2a368ca18490e77'),
      network_id: "3"
    },
    infura_goerli: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, 'https://goerli.infura.io/v3/aa381c77520d4647a2a368ca18490e77'),
      network_id: "5"
    },
  },
  compilers: {
    solc: {
      version: "^0.8.4",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
