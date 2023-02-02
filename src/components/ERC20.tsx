import { ethers } from "ethers";
import {
  erc20ABI,
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";

export function ERC20() {
  return (
    <div>
      <GetAllowance />
      <Approve />
    </div>
  );
}

function Approve() {
  const { address, isConnected } = useAccount();
  const airdropAddress = "0x93c1313F006669130e37626BB85558a378703181";
  const tokenAddress = "0x6292F13202e6d418136aa7d40e1BF85F3e394682";

  const { config } = usePrepareContractWrite({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: "approve",
    args: [airdropAddress, ethers.utils.parseUnits("1000", "ether")],
  });

  const { data, write } = useContractWrite(config);

  const { refetch } = useContractRead({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address!, airdropAddress],
  });
  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => refetch(),
  });

  return (
    <div>
      <button
        disabled={!write || isLoading }
        onClick={() => write?.()}
      >
        {" "}
        Approve{" "}
      </button>
    </div>
  );
}

function GetAllowance() {
  const { address } = useAccount();
  const airdropAddress = "0x93c1313F006669130e37626BB85558a378703181";
  const tokenAddress = "0x6292F13202e6d418136aa7d40e1BF85F3e394682";

  const { data: allowance } = useContractRead({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address!, airdropAddress],
  });

  return <div>Allowance: {allowance?.toString()}</div>;
}
