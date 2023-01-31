// SPDX-License-Identifier: MIT
/**
 * @title Magna Airdrop | wentokens.xyz
 * @author @PopPunkOnChain | Harrison Leggio
 * @notice Gas efficient airdrop contract for ERC20 and ETH
 */
pragma solidity =0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Airdrop {
    /**
     * 
     * @param _recipients list of recipients
     * @param _amounts  list of amounts to send each recipient
     */
    function airdropETH(
        address[] memory _recipients,
        uint256[] memory _amounts
    ) external payable {

        assembly {
            for {
                let i := 0
            } lt(i, mload(_recipients)) {
                i := add(i, 1)
            } {
                let success := call(
                    gas(),
                    mload(add(add(_recipients, 0x20), mul(i, 0x20))),
                    mload(add(add(_amounts, 0x20), mul(i, 0x20))),
                    0,
                    0,
                    0,
                    0
                )
                if iszero(success) {
                    revert(0, 0)
                }
            }
        }
    }

    /**
     * 
     * @param _token ERC20 token to airdrop
     * @param _recipients list of recipients
     * @param _amounts list of amounts to send each recipient
     * @param _total total amount to transfer from caller
     */
    function airdropERC20(
        IERC20 _token,
        address[] memory _recipients,
        uint256[] memory _amounts,
        uint256 _total
    ) external {
        bytes4 transferFrom = bytes4(
            keccak256("transferFrom(address,address,uint256)")
        );
        bytes4 transfer = bytes4(keccak256("transfer(address,uint256)"));

        assembly {
            let transferFromData := add(0x20, mload(0x40))
            mstore(transferFromData, transferFrom)
            mstore(add(transferFromData, 0x04), caller())
            mstore(add(transferFromData, 0x24), address())
            mstore(add(transferFromData, 0x44), _total)
            let successTransferFrom := call(
                gas(),
                _token,
                0,
                transferFromData,
                0x64,
                0,
                0
            )
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
                mstore(
                    add(transferData, 0x04),
                    mload(add(add(_recipients, 0x20), mul(i, 0x20)))
                )
                mstore(
                    add(transferData, 0x24),
                    mload(add(add(_amounts, 0x20), mul(i, 0x20)))
                )
                let successTransfer := call(
                    gas(),
                    _token,
                    0,
                    transferData,
                    0x44,
                    0,
                    0
                )
                if iszero(successTransfer) {
                    revert(0, 0)
                }
            }
        }
    }

    /**
     * 
     * @param token ERC20 token to airdrop
     * @param recipients list of recipients
     * @param values values to send each recipient
     * 
     * @dev This function is used to benchmark against airdropERC20
     * source: https://etherscan.io/address/0xD152f549545093347A162Dce210e7293f1452150#code
     */
    function disperseToken(
        IERC20 token,
        address[] memory recipients,
        uint256[] memory values
    ) external {
        uint256 total = 0;
        for (uint256 i = 0; i < recipients.length; i++) total += values[i];
        require(token.transferFrom(msg.sender, address(this), total));
        for (uint256 i = 0; i < recipients.length; i++)
            require(token.transfer(recipients[i], values[i]));
    }
}
