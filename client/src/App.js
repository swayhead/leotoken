import React, { Component } from "react";
import LeoToken from "./contracts/LeoToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json";
import KycContract from "./contracts/KycContract.json";
import getWeb3 from "./getWeb3";

import Card from "./components/Card";

import "./App.css";

const styles = {
  rotorImg: 'h-12 w-12',
  alertStrip: 'fixed flex justify-center items-center h-10 w-screen text-white font-bold transition-all duration-500 ease-in-out px-2 py-7 text-center',
  cardLabel: "rounded-t-xl text-center text-white bg-purple-400 font-bold h-6",
  button: "p-2 text-white bg-gray-400 rounded-lg hover:bg-gray-700 active:shadow-lg mouse shadow transition ease-in duration-200 focus:outline-none disabled:bg-gray-300",
  input: "shadow appearance-none border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none font-mono disabled:bg-gray-300",
};

const Blockchains = {
  MAINNET: 1,
  ROPSTEN: 3,
  RINKEBY: 4,
  GOERLI: 5,
  KOVAN: 42,
  LOCAL: 1337,
};
class App extends Component {
  state = {
    loaded: false,
    error: null,
    success: null,
    kycAllowedAddress: '0x123...',
    tokenSaleAddress: null,
    tokenAmount: 0,
    inBuyingProcess: false,
    inWhitelistingProcess: false
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await this.web3.eth.net.getId();
      const chainId = await this.web3.eth.getChainId();

      if (!this.checkNetwork(chainId)) {
        return;
      }

      this.tokenInstance = new this.web3.eth.Contract(
        LeoToken.abi,
        LeoToken.networks[networkId] && LeoToken.networks[networkId].address,
      );
      this.tokenSaleInstance = new this.web3.eth.Contract(
        MyTokenSale.abi,
        MyTokenSale.networks[networkId] && MyTokenSale.networks[networkId].address,
      );
      this.kycContract = new this.web3.eth.Contract(
        KycContract.abi,
        KycContract.networks[networkId] && KycContract.networks[networkId].address,
      );


      this.listenToTokenTransfer();
      this.listenToWalletChanges();
      this.setState({ loaded: true, tokenSaleAddress: MyTokenSale.networks[networkId].address }, this.updateTokenAmount);
    } catch (error) {
      // Catch any errors for any of the above operations.
      this.setState({ loaded: true, error: { message: `<a href="https://metamask.io/" target="_blank">Please install Metamask first</a>`, disable: true } });

      console.error(error);
    }
  };

  checkNetwork = chainId => {
    let isLegalNetwork = parseInt(chainId) === Blockchains.ROPSTEN || (process.env.NODE_ENV === 'development' && parseInt(chainId) === Blockchains.LOCAL);
    this.setState({ loaded: true, error: isLegalNetwork ? null : { message: `At present only available on Ropsten test network`, disable: true } });
    return isLegalNetwork;
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    })
  }

  handleKycAllow = async () => {
    this.setState({ inWhitelistingProcess: true, error: null, success: null })
    try {
      await this.kycContract.methods.setKycStatus(this.state.kycAllowedAddress, true).send({ from: this.accounts[0] });
      this.setState({ success: { message: `Address ${this.state.kycAllowedAddress} has been whitelisted` } });
    } catch (error) {
      this.setState({ error });
    }
    this.setState({ inWhitelistingProcess: false });
  }

  listenToTokenTransfer = () => {
    this.tokenInstance.events.Transfer({ to: this.accounts[0] }).on('data', () => {
      this.updateTokenAmount();
      this.setState({ inBuyingProcess: false, success: { message: `Tokens successfully acquired.` } });
    });
  }

  listenToWalletChanges = () => {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', chainId => {
        this.checkNetwork(chainId);
      })
      window.ethereum.on('accountsChanged', accounts => {
        this.accounts = accounts;
        this.updateTokenAmount();
      })
    }
  }

  handleBuyTokens = async () => {
    this.setState({ inBuyingProcess: true, error: null, success: null })
    try {
      await this.tokenSaleInstance.methods.buyTokens(this.accounts[0]).send({ from: this.accounts[0], value: this.web3.utils.toWei("1", "wei") });
    } catch (error) {
      this.setState({ error, inBuyingProcess: false });
    }
  }

  updateTokenAmount = async () => {
    let tokenAmount = await this.tokenInstance.methods.balanceOf(this.accounts[0]).call();
    this.setState({ tokenAmount })
  }


  render() {
    if (!this.state.loaded) {
      return <div className="flex h-screen justify-center items-center">Loading Web3, accounts, and contract...</div>;
    }
    let alert = { className: '', message: '' };
    if (this.state.error) {
      alert = { className: 'bg-red-400', message: this.state.error.message };
    }
    if (this.state.success) {
      alert = { className: 'bg-green-400', message: this.state.success.message };
    }


    return (
      <>
        <div className={`${styles.alertStrip} ${alert.className}`} dangerouslySetInnerHTML={{ __html: alert.message }}></div>

        <div className="flex h-screen justify-center items-center bg-gray-200 p-3">
          <div>
            <Card styles={styles} inProcess={this.state.inWhitelistingProcess}>
              <div className="py-2 text-xl font-medium text-black">Whitelist</div>
              <div>
                <p className="py-3 text-gray-500">Enter Address</p>
                <div className="sm:flex items-center sm:space-x-4">
                  <input type="text" className={`${styles.input} sm:mb-0 mb-2 w-full`} name="kycAllowedAddress" disabled={(this.state.error && this.state.error.disable) || this.state.inWhitelistingProcess} value={this.state.kycAllowedAddress} onChange={this.handleInputChange} />
                  <button type="button" className={`${styles.button} w-full`} disabled={(this.state.error && this.state.error.disable) || this.state.inWhitelistingProcess} onClick={this.handleKycAllow}>Add to whitelist</button>
                </div>
              </div>
            </Card>

            <Card styles={styles} inProcess={this.state.inBuyingProcess}>
              <div className="py-2 text-xl font-medium text-black">Buy Tokens</div>
              <div>
                <p className="py-3 text-gray-500">Using this Address: <code className="break-all">{this.state.tokenSaleAddress}</code></p>
                <p className="py-3 text-gray-500">You currently have: <b>{this.state.tokenAmount}</b> token{this.state.tokenAmount === '1' ? '' : 's'}</p>
                <p> <button type="button" className={`${styles.button} w-full`} onClick={this.handleBuyTokens} disabled={(this.state.error && this.state.error.disable) || this.state.inBuyingProcess}>Buy tokens</button></p>
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }
}

export default App;