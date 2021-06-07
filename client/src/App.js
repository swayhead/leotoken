import React, { Component } from "react";
import LeoToken from "./contracts/LeoToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json";
import KycContract from "./contracts/KycContract.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded: false, kycAllowedAddress: '0x123...', tokenSaleAddress: null, tokenAmount: 0 };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await this.web3.eth.net.getId();

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

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ loaded: true, tokenSaleAddress: MyTokenSale.networks[networkId].address }, this.updateTokenAmount);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };  

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    })
  }

  handleKycAllow = async () => {
    try {
      await this.kycContract.methods.setKycStatus(this.state.kycAllowedAddress, true).send({from: this.accounts[0]});
       alert('Address ' + this.state.kycAllowedAddress + ' has been whitelisted');
    } catch (error) {
     console.log(error);
     alert('Error. See console for details.')
    }
    
  }

  updateTokenAmount = async () => {
    let tokenAmount = await this.tokenInstance.methods.balanceOf(this.accounts[0]).call();
    // console.log(tokenAmount);
    this.setState({tokenAmount})

  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="flex h-screen justify-center items-center">
         <div>
           
           <div className="p-6 m-6 max-w-lg mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img className="h-12 w-12 animate-spin-3s" src="/logo192.png" alt="Logo" />
              </div>
              <div>
                <div className="py-2 text-xl font-medium text-black">Do Whitelist</div>
                <div>
                  <p className="py-3 text-gray-500">Enter Address</p>
           
                  <div className="flex items-center space-x-4">
                    <input type="text" className="shadow appearance-none border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none font-mono" name="kycAllowedAddress" value={this.state.kycAllowedAddress} onChange={this.handleInputChange} />
                    <button type="button" className="p-2 text-white bg-gray-400 rounded-lg hover:bg-gray-700 active:shadow-lg mouse shadow transition ease-in duration-200 focus:outline-none" onClick={this.handleKycAllow}>Add to whitelist</button>
                  </div>
                </div>
           
              </div>
            </div>
           <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img className="h-12 w-12 animate-spin-3s" src="/logo192.png" alt="Logo" />
              </div>
              <div>
                <div className="py-2 text-xl font-medium text-black">Buy Tokens</div>
                <div>
                  <p className="py-3 text-gray-500">Use this Address: <code>{this.state.tokenSaleAddress}</code></p>
                  <p className="py-3 text-gray-500">You currently have: <b>{this.state.tokenAmount}</b> token{this.state.tokenAmount == '1' ? '' : 's'}</p>
                  <p> <button type="button" className="p-2 text-white bg-gray-400 rounded-lg hover:bg-gray-700 active:shadow-lg mouse shadow transition ease-in duration-200 focus:outline-none">Buy tokens</button></p>
                </div>
           
              </div>
            </div>
         </div>
      </div>
    );
  }
}

export default App;