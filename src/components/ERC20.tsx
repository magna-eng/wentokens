import { BigNumber, ethers } from "ethers";
import { useWaitForTransaction } from "wagmi";

import {
  usePrepareErc20Approve,
  useErc20Approve,
  useErc20Allowance,
} from "../generated";

export function ERC20() {
  return (
    <div>
      <GetAllowance />
      <Approve />
    </div>
  );
}

function Approve() {
  const airdropAddress = "0x93c1313F006669130e37626BB85558a378703181";

  const { config } = usePrepareErc20Approve({
    args: [airdropAddress, ethers.utils.parseUnits("1000", "ether")],
    enabled: true,
  });

  const { data, write } = useErc20Approve({
    ...config,
    onSuccess: () => console.log("Approval transaction sent!"),
  });

  const { refetch } = useErc20Allowance({
    args: ["0x76BCF35A7D0F9Ab3B33952920AEC7f229E839a0F", airdropAddress],
    enabled: false,
  });
  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => refetch(),
  });

  return (
    <div>
      <button disabled={!write || isLoading} onClick={() => write?.()}>
        {" "}
        Approve{" "}
      </button>
    </div>
  );
}

function GetAllowance() {
  const airdropAddress = "0x93c1313F006669130e37626BB85558a378703181";

  const { data: allowance } = useErc20Allowance({
    args: ["0x76BCF35A7D0F9Ab3B33952920AEC7f229E839a0F", airdropAddress],
    enabled: true,
  });

  return <div>Allowance: {allowance?.toString()}</div>;
}
