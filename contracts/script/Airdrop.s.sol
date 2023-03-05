pragma solidity=0.8.17;

import "./../src/Airdrop.sol";
import "forge-std/Script.sol";
import { console } from "forge-std/console.sol";

contract AirdropScript is Script {
    function run() external {
        console.log("AirdropScript");
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        bytes32 airdropSalt = keccak256(abi.encodePacked("foo111"));
        bytes memory airdropCode = abi.encodePacked(type(Airdrop).creationCode);
        deploy(airdropCode, airdropSalt);
        vm.stopBroadcast();
    }

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
    ) internal returns (address) {
        address addr;
        assembly {
            addr := create2(0, add(_bytecode, 0x20), mload(_bytecode), _salt)
            if iszero(extcodesize(addr)) {
                revert(0, 0)
            }
        }
        console.log("Deployed contract at address: ", addr);
        return addr;
    }
}