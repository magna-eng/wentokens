// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.17;

import 'forge-std/Test.sol';
import '../src/AirdropComparison.sol';
import '../src/Token.sol';

/*
    Test for demonstrating mismatched array lengths sending ETH or Tokens to Null address.
    Can be seen using -vvvv and inspecting the calls // using an assertion to check 0 address
    balance before & after the call.

    │   ├─ [0] 0xa5c3658bf1ea53BBD3EDcDE54E16205E18b45792::fallback{value: 1}() 
    │   │   └─ ← ()
    │   ├─ [0] 0xa5c3658bf1ea53BBD3EDcDE54E16205E18b45792::fallback{value: 1}() 
    │   │   └─ ← ()
    │   ├─ [0] 0x0000000000000000000000000000000000000000::fallback{value: 1}() 
    │   │   └─ ← ()


*/

contract AirdropBug is Test {

    uint256 constant AIRDROP_SIZE = 9000;
    AirdropComparison airdrop;
    Token token;
    address admin;
    address[] recipients;
    uint256[] amounts;

    constructor() {
        airdrop = new AirdropComparison();
        // token = new Token();
        admin = _randomAddress();
        // token.mint(admin, _initial_supply);
    }
    function _randomAddress() private view returns (address payable) {
        return payable(address(uint160(_randomUint256())));
    }

    function _randomUint256() private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, block.number)));
    }
    
    function testFailWenTokensAirdropETHArrayLengths() public {
        vm.prank(admin);
        vm.deal(admin, 100000 ether);

        recipients = new address[](AIRDROP_SIZE);
        amounts = new uint256[](AIRDROP_SIZE);

        for (uint256 i = 0; i < AIRDROP_SIZE - 1; i++) {
            recipients[i] = _randomAddress();
        }

        for (uint256 i = 0; i < AIRDROP_SIZE; i++) {
            amounts[i] = 1;
        }
        // will try and send ETH to this address on uniningitalized array element
        uint256 balanceBefore = address(0x0000000000000000000000000000000000000000).balance;
        airdrop.airdropETH{value: AIRDROP_SIZE}(recipients, amounts);
        uint256 balanceAfter = address(0x0000000000000000000000000000000000000000).balance;

        assert(balanceAfter <= balanceBefore);
    }


}