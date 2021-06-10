// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import './Crowdsale.sol';
import './KycContract.sol';

contract MyTokenSale is Crowdsale {
    KycContract kyc;
    constructor (uint256 _rate, address payable _wallet, IERC20 _token, KycContract _kyc) Crowdsale(_rate, _wallet, _token) {
        kyc = _kyc;
    }
     function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view override {
       super._preValidatePurchase(beneficiary, weiAmount);
       require(kyc.isKycCompleted(beneficiary), "This address is not allowed to buy tokens.");
    }
}