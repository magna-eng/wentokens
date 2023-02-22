// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Magna Airdrop | wentokens.xyz
 * @notice Hyper efficient Airdrop contract for ERC20 and ETH
 * @author Harrison (@PopPunkOnChain)
 * @author Magna (@MagnaTokens)
 */
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
        // looop through _recipients
        assembly {
            // store runningTotal
            let runningTotal := 0
            // store pointer to _recipients
            let recipientsPtr := add(_recipients, 0x20)
            // store pointer to _amounts
            let amountsPtr := add(_amounts, 0x20)
            for {
                let i := 0
            } lt(i, mload(_recipients)) {
                // increment i
                i := add(i, 1)
                // increment pointers
                recipientsPtr := add(recipientsPtr, 0x20)
                amountsPtr := add(amountsPtr, 0x20)
            } {
                // send _amounts[i] to _recipients[i]
                let success := call(
                    gas(),
                    mload(recipientsPtr), // load address
                    mload(amountsPtr), // load amount
                    0,
                    0,
                    0,
                    0
                )
                // revert if call fails
                if iszero(success) {
                    revert(0, 0)
                }
                // add _amounts[i] to runningTotal
                runningTotal := add(runningTotal, mload(amountsPtr))
            }
            // revert if runningTotal != msg.value
            if iszero(eq(runningTotal, callvalue())) {
                revert(0, 0)
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
        // bytes selector for transferFrom(address,address,uint256)
        bytes4 transferFrom = 0x23b872dd;
        // bytes selector for transfer(address,uint256)
        bytes4 transfer = 0xa9059cbb;

        assembly {
            // store transferFrom selector
            let transferFromData := add(0x20, mload(0x40))
            mstore(transferFromData, transferFrom)
            // store caller address
            mstore(add(transferFromData, 0x04), caller())
            // store address
            mstore(add(transferFromData, 0x24), address())
            // store _total
            mstore(add(transferFromData, 0x44), _total)
            // call transferFrom for _total
            let successTransferFrom := call(
                gas(),
                _token,
                0,
                transferFromData,
                0x64,
                0,
                0
            )
            // revert if call fails
            if iszero(successTransferFrom) {
                revert(0, 0)
            }
            // store pointer to _recipients
            let recipientsPtr := add(_recipients, 0x20)
            // store pointer to _amounts
            let amountsPtr := add(_amounts, 0x20)
            // loop through _recipients
            for {
                let i := 0
            } lt(i, mload(_recipients)) {
                // increment i
                i := add(i, 1)
                // increment pointers
                recipientsPtr := add(recipientsPtr, 0x20)
                amountsPtr := add(amountsPtr, 0x20)
            } {
                // store transfer selector
                let transferData := add(0x20, mload(0x40))
                mstore(transferData, transfer)
                // store _recipients[i]
                mstore(
                    add(transferData, 0x04),
                    mload(recipientsPtr)
                )
                // store _amounts[i]
                mstore(
                    add(transferData, 0x24),
                    mload(amountsPtr)
                )
                // call transfer for _amounts[i] to _recipients[i]
                let successTransfer := call(
                    gas(),
                    _token,
                    0,
                    transferData,
                    0x44,
                    0,
                    0
                )
                // revert if call fails
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
