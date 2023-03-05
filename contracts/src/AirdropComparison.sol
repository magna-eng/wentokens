// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import "@openzeppelin/token/ERC20/utils/SafeERC20.sol";

/**
 ▄█     █▄     ▄████████ ███▄▄▄▄       ███      ▄██████▄     ▄█   ▄█▄    ▄████████ ███▄▄▄▄      ▄████████ 
███     ███   ███    ███ ███▀▀▀██▄ ▀█████████▄ ███    ███   ███ ▄███▀   ███    ███ ███▀▀▀██▄   ███    ███ 
███     ███   ███    █▀  ███   ███    ▀███▀▀██ ███    ███   ███▐██▀     ███    █▀  ███   ███   ███    █▀  
███     ███  ▄███▄▄▄     ███   ███     ███   ▀ ███    ███  ▄█████▀     ▄███▄▄▄     ███   ███   ███        
███     ███ ▀▀███▀▀▀     ███   ███     ███     ███    ███ ▀▀█████▄    ▀▀███▀▀▀     ███   ███ ▀███████████ 
███     ███   ███    █▄  ███   ███     ███     ███    ███   ███▐██▄     ███    █▄  ███   ███          ███ 
███ ▄█▄ ███   ███    ███ ███   ███     ███     ███    ███   ███ ▀███▄   ███    ███ ███   ███    ▄█    ███ 
 ▀███▀███▀    ██████████  ▀█   █▀     ▄████▀    ▀██████▀    ███   ▀█▀   ██████████  ▀█   █▀   ▄████████▀  
                                                            ▀                                             
 */

/**
 * @title Magna Airdrop | wentokens.xyz
 * @notice Hyper efficient Airdrop contract for ERC20 and ETH
 * @author Harrison (@PopPunkOnChain)
 * @author Magna (@MagnaTokens)
 */
contract AirdropComparison {
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

            // store transfer selector
            let transferData := add(0x20, mload(0x40))
            mstore(transferData, transfer)

            // store length of _recipients
            let sz := _amounts.length

            // loop through _recipients
            for {
                let i := 0
            } lt(i, sz) {
                // increment i
                i := add(i, 1)
            } {
                // store offset for _amounts[i]
                let offset := mul(i, 0x20)
                // store _amounts[i]
                let amt := calldataload(add(_amounts.offset, offset))
                // store _recipients[i]
                let recp := calldataload(add(_recipients.offset, offset))
                // store _recipients[i] in transferData
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
