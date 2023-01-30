// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.17;

import "forge-std/Test.sol";
import "../src/Airdrop.sol";
import "../src/Deployer.sol";

contract DeployTest is Test {
    Deployer deployer;

    // deploy a new Deployer contract
    constructor() {
        deployer = new Deployer();
    }

    // util function to get the pre-computed address of the contract
    function _preComputeAddress() external view returns (address) {
        bytes memory airdropCode = abi.encodePacked(type(Airdrop).creationCode);
        bytes32 airdropSalt = keccak256(abi.encodePacked("airdrop"));
        address airdropAddress = deployer.preComputeAddress(
            airdropCode,
            airdropSalt
        );
        return airdropAddress;
    }

    function testDeploy_deployContract() external {
        console.log("[TEST]: Contract deploys successfully");
        bytes memory airdropCode = abi.encodePacked(type(Airdrop).creationCode);
        bytes32 airdropSalt = keccak256(abi.encodePacked("airdrop"));
        deployer.deploy(airdropCode, airdropSalt);
    }

    function testDeploy_deployAndValidateAddress() external {
        console.log(
            "[TEST]: Pre-compute contract address and validate deployed address"
        );
        bytes memory airdropCode = abi.encodePacked(type(Airdrop).creationCode);
        bytes32 airdropSalt = keccak256(abi.encodePacked("airdrop"));
        address airdropAddress = deployer.preComputeAddress(
            airdropCode,
            airdropSalt
        );
        address deployedAddress = deployer.deploy(airdropCode, airdropSalt);
        assertEq(airdropAddress, deployedAddress);
    }
}
