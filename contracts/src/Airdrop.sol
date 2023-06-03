// License: https://github.com/magna-eng/wentokens/blob/33525bd94508f0976e114bcbc6761add2a21ad06/LICENSE.md
pragma solidity =0.8.17;


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
contract Airdrop {

    // 0x8689d991
    error EthNotSent(); 
    // 0x543bf3c4 
    error arrayLengthMismatch();

    /**
     *
     * @param _recipients list of recipients
     * @param _amounts  list of amounts to send each recipient
     */
    function airdropETH(
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

    /**
     *
     * @param _token ERC20 token to airdrop
     * @param _recipients list of recipients
     * @param _amounts list of amounts to send each recipient
     * @param _total total amount to transfer from caller
     */
    function airdropERC20(
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
}
