// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract KycContract {
    mapping (address=>bool) kycList;

    function setKycStatus(address _addr, bool _status) public {
        kycList[_addr] = _status;
    }

    function isKycCompleted(address _addr) view public returns (bool) {
        return kycList[_addr];
    }

}