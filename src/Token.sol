// SPDX-License-Identifier: MIT
pragma solidity=0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    uint256 constant _initial_supply = (10**9) * (10**18);

    constructor() ERC20("AYYLMAO", "AYY") {
        _mint(msg.sender, _initial_supply);
    }

    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }
}