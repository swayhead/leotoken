// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./ERC20Mintable.sol";

contract LeoToken is ERC20Mintable {
    constructor() ERC20("Leonardo Token", "LEO") {
    }
}
