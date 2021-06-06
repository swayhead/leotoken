const path = require("path");
const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

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
    }
  },
  compilers: {
    solc: {
      version: "^0.8.4"
    }
  }
};
