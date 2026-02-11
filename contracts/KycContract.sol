// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract KycContract is Ownable {
    mapping(address => bool) kycList;

    constructor() Ownable(msg.sender) {}

    function setKycStatus(address _addr, bool _status) public onlyOwner {
        kycList[_addr] = _status;
    }

    function isKycCompleted(address _addr) public view returns (bool) {
        return kycList[_addr];
    }
}
