// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

// import SAFEERC20.sol
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Airdrop {
    function airdropETH(address[] memory _recipients, uint256[] memory _amounts) external payable {
        bool success;

        assembly {
            for {
                let i := 0
            } lt(i, mload(_recipients)) {
                i := add(i, 1)
            } {
                success := call(
                    gas(),
                    mload(add(add(_recipients, 0x20), mul(i, 0x20))),
                    mload(add(add(_amounts, 0x20), mul(i, 0x20))),
                    0,
                    0,
                    0,
                    0
                )
            }
        }
    }

    function airdropERC20(
        IERC20 _token,
        address[] memory _recipients,
        uint256[] memory _amounts,
        uint256 _total
    ) external {

        bytes4 transferFrom = bytes4(keccak256("transferFrom(address,address,uint256)"));
        bytes4 transfer = bytes4(keccak256("transfer(address,uint256)"));

        assembly {
            let transferFromData := add(0x20, mload(0x40))
            mstore(transferFromData, transferFrom)
            mstore(add(transferFromData, 0x04), caller())
            mstore(add(transferFromData, 0x24), address())
            mstore(add(transferFromData, 0x44), _total)
            let successTransferFrom := call(gas(), _token, 0, transferFromData, 0x64, 0, 0)
            if iszero(successTransferFrom) {
                revert(0, 0)
            }

            for {
                let i := 0
            } lt(i, mload(_recipients)) {
                i := add(i, 1)
            } {
                let transferData := add(0x20, mload(0x40))
                mstore(transferData, transfer)
                mstore(add(transferData, 0x04), mload(add(add(_recipients, 0x20), mul(i, 0x20))))
                mstore(add(transferData, 0x24), mload(add(add(_amounts, 0x20), mul(i, 0x20))))
                let successTransfer := call(gas(), _token, 0, transferData, 0x44, 0, 0)
                if iszero(successTransfer) {
                    revert(0, 0)
                }
            }
        }
    }

    function disperseToken(
        IERC20 token,
        address[] memory recipients,
        uint256[] memory values
    ) external {
        uint256 total = 0;
        for (uint256 i = 0; i < recipients.length; i++) total += values[i];
        require(token.transferFrom(msg.sender, address(this), total));
        for (uint256 i = 0; i < recipients.length; i++) require(token.transfer(recipients[i], values[i]));
    }
}