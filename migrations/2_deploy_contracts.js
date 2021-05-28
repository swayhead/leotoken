const LeoToken = artifacts.require('LeoToken.sol');

module.exports = async deployer=>{
    await deployer.deploy(LeoToken, 1000000);
}