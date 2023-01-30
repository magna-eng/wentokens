// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

contract Deployer {
    /**
     *
     * @param _bytecode full bytecode of the contract to deploy
     * @param _salt salt to use as part of address pre-computation
     * @return address of the deployed contract
     *
     * @dev this function is used to deploy a contract using the CREATE2 opcode
     */
    function deploy(
        bytes memory _bytecode,
        bytes32 _salt
    ) external returns (address) {
        address addr;
        assembly {
            addr := create2(0, add(_bytecode, 0x20), mload(_bytecode), _salt)
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }
        return addr;
    }

    /**
     *
     * @param _bytecode full bytecode of the contract to deploy
     * @param _salt salt to use as part of address pre-computation
     * @return address of the contract that would be deployed
     *
     * @dev this function is used to get the pre-computed address of the contract
     * that would be deployed. This is used to avoid emitting an event in the deploy
     * function to save gas on each deploy
     */
    function preComputeAddress(
        bytes memory _bytecode,
        bytes32 _salt
    ) external view returns (address) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                _salt,
                keccak256(_bytecode)
            )
        );

        return address(uint160(uint256(hash)));
    }
}
