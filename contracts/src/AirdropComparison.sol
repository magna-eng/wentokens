// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import "@openzeppelin/token/ERC20/utils/SafeERC20.sol";

contract AirdropComparison {

    /* 
    Summary: 

    LCFR AirdropETH - 135k gas Less than WenTokens
    LCFR AirdropERC20 - 54k gas Less than WenTokens

    | Function Name                                                  | min             | avg      | median   | max      | # calls |
    | airdropERC20                                                   | 29438864        | 29438864 | 29438864 | 29438864 | 1       |
    | airdropERC20LCFR                                               | 29384761        | 29384761 | 29384761 | 29384761 | 1       |
    | airdropETH                                                     | 62458757        | 62458757 | 62458757 | 62458757 | 2       |
    | airdropETHLCFR                                                 | 62323746        | 62323746 | 62323746 | 62323746 | 1       |
    | disperseToken                                                  | 38802181        | 38802181 | 38802181 | 38802181 | 1       |
    */

    error EthNotSent(); // 0x8689d991

    /**
     *
     * @param _token ERC20 token to airdrop
     * @param _recipients list of recipients
     * @param _amounts list of amounts to send each recipient
     * @param _total total amount to transfer from caller
     */
    function airdropERC20(
        IERC20 _token,
        address[] calldata _recipients,
        uint256[] calldata _amounts,
        uint256 _total
    ) external {
        // LCFR - do this in the assembly block + add extra 28 non-zero bytes to save non-zero -> zero gas costs.
        // bytes selector for transferFrom(address,address,uint256)
        bytes4 transferFrom = 0x23b872dd;
        // bytes selector for transfer(address,uint256)
        bytes4 transfer = 0xa9059cbb;

        assembly {
            // LCFR
            // Use scratch space to store the data for the calls
            // transferFrom calldata is 64bytes meaning can use scratch space safely.
            // this removes uncessary add()'s and other calls for keeping track of freememptr.

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
                // LCFR - add returndatacopy to bubble up the revert reason
                revert(0, 0)
            }

            // LCFR - overwrite the previous calls data instead of getting a new freemem location.
            // store transfer selector
            let transferData := add(0x20, mload(0x40))
            mstore(transferData, transfer)

            // LCFR - caching outside of loop in assembly generally costs more.
            // store length of _recipients
            let sz := _amounts.length

            // LCFR - reformat the loop structure to be more effecient:
            // initialize i outside of the pre loop declaration.
            // break if eq() inside of the loop.

            // loop through _recipients
            for {
                let i := 0
            } lt(i, sz) {
                // increment i
                i := add(i, 1)
            } {
                // store offset for _amounts[i]
                // LCFR - use shl instead of mul
                let offset := mul(i, 0x20)
                // store _amounts[i]
                let amt := calldataload(add(_amounts.offset, offset))
                // store _recipients[i]
                let recp := calldataload(add(_recipients.offset, offset))
                // store _recipients[i] in transferData

                // LCFR - use calldatacopy to write directly to memory offsets and remove uneeded add()s
                mstore(
                    add(transferData, 0x04),
                    recp
                )
                // store _amounts[i] in transferData
                mstore(
                    add(transferData, 0x24),
                    amt
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
                    // use returndatacopy to bubble up revert reason
                    revert(0, 0)
                }  
            }
        }
    }

    function airdropETH(
        address[] calldata _recipients,
        uint256[] calldata _amounts
    ) external payable {
        // looop through _recipients
        assembly {
            // store runningTotal
            // LCFR - not quite sure why this is needed - validate all ETH sent?
            let runningTotal := 0
            
            // store length of _recipients
            // LCFR - dont cache. storing the length outside the loop costs more gas in assembly usually.
            let sz := _amounts.length

            // LCFR - reformat the loop structure to be more effecient:
            // initialize i outside of the pre loop declaration.

            // break if i == array length
            for {
                let i := 0
            } lt(i, sz) {
                // increment i
                i := add(i, 1)
            } {
                // store offset for _amounts[i]
                // LCFR - use shl instead of mul
                let offset := mul(i, 0x20)

                // store _amounts[i]
                // LCFR - (bug) if _amounts[] is longer than _recipients[] then this will send ETH to the null address
                let amt := calldataload(add(_amounts.offset, offset))

                // store _recipients[i]
                // LCFR - (bug) if _recipients[] is shorter than _amounts[] then this will send ETH to a NULL address
                let recp := calldataload(add(_recipients.offset, offset))

                // send _amounts[i] to _recipients[i]
                let success := call(
                    gas(),
                    recp, // address
                    amt, // amount
                    0,
                    0,
                    0,
                    0
                )
                // revert if call fails
                if iszero(success) {
                    // LCFR - bubble up the revert reason and return instead
                    revert(0, 0)
                }

                // LCFR - remove this from the loop and check if balance > 0 at the end of execution 
                // add _amounts[i] to runningTotal
                runningTotal := add(runningTotal, amt)
            }
            // LCFR - check if contract balance is > 0 something went wrong instead as mentioned above. 
            // revert if runningTotal != msg.value
            if iszero(eq(runningTotal, callvalue())) {
                revert(0, 0)
            }
        }
    }

    function airdropETHLCFR(
        address[] calldata _recipients,
        uint256[] calldata _amounts
    ) external payable {
        // looop through _recipients
        assembly {

            // LCFR - fix for array length bug. 
            if iszero(eq(_recipients.length, _amounts.length)) {
                mstore(0x00, 0x543bf3c4)
                revert(0x1c, 0x04)
            }

            let i := 0
            for {} 1 { i:= add(i, 1) } {
                if eq(i, _recipients.length){ break }

                let offset := shl(5, i)

                // store _amounts[i]
                let amt := calldataload(add(_amounts.offset, offset))

                // store _recipients[i]
                let recp := calldataload(add(_recipients.offset, offset))

                // send _amounts[i] to _recipients[i]
                let success := call(
                    gas(),
                    recp, // address
                    amt, // amount
                    0,
                    0,
                    0,
                    0
                )
                // revert if call fails
                if iszero(success) {
                    returndatacopy(0x00, 0x00, returndatasize())
                    revert(0, 0)
                }
            }

            if gt(selfbalance(), 0) {
                mstore(0x00, 0x8689d991)
                revert(0x1c, 0x04)
            }
        }
    }

    function airdropERC20LCFR(
        address _token,
        address[] calldata _recipients,
        uint256[] calldata _amounts, 
        uint256 _total
    ) external {
        assembly {
            if iszero(eq(_recipients.length, _amounts.length)) {
                mstore(0x00, 0x543bf3c4)
                revert(0x1c, 0x04)
            }

            // store the transferFrom selector at 0x00
            mstore(0x00, 0x23b872ddac1db17cac1db17cac1db17cac1db17cac1db17cac1db17cac1db17c)
            // store the caller as the first parameter to transferFrom()
            mstore(0x04, caller())
            // store the contract address as the second parameter to transferFrom()
            mstore(0x24, address())
            // store the total amount to transfer as the third parameter to transferFrom()
            mstore(0x44, _total)

            let successTransferFrom := call(
                gas(),
                _token,
                0,
                0,
                0x64,
                0,
                0
            )

            // revert if call fails
            if iszero(successTransferFrom) {
                revert(0, 0)
            }

            // store the transfer selector at 0x00
            let transfer := 0xa9059cbbac1db17cac1db17cac1db17cac1db17cac1db17cac1db17cac1db17c
            mstore(0x00, transfer)
            // store the recipient as the first parameter to transfer()
            let i := 0
            for {} 1 { i:= add(i, 1) } {
                if eq(i, _recipients.length){ break }

                // store offset for _amounts[i]
                // let offset := mul(i, 0x20)
                let offset := shl(5, i)

                calldatacopy(0x04, add(_recipients.offset, offset), 0x20)

                calldatacopy(0x24, add(_amounts.offset, offset), 0x20)

                let successTransfer := call(
                    gas(),
                    _token,
                    0,
                    0,
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
