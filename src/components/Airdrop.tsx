import { ethers } from 'ethers';
import { useWaitForTransaction } from 'wagmi';
import {
  // usePrepareAirdropAirdropErc20,
  usePrepareAirdropAirdropEth,
  // useAirdropAirdropErc20,
  useAirdropAirdropEth,
} from '../generated';

export function Airdrop() {
  return (
    <div>
      {/* <AirdropERC20 /> */}
      <AirdropETH />
    </div>
  );
}

// function AirdropERC20() {
//   const tokenAddress = "0x6292F13202e6d418136aa7d40e1BF85F3e394682";

//   const { config } = usePrepareAirdropAirdropErc20({
//     args: [
//       tokenAddress,
//       ["0x3d4aaFbe86059d17C6263332c560f18C4F1Fec34"],
//       [ethers.utils.parseUnits("1000", "ether")],
//       ethers.utils.parseUnits("1000", "ether"),
//     ],
//     enabled: true,
//   });

//   const { data, write } = useAirdropAirdropErc20({
//     ...config,
//     onSuccess: () => console.log("Airdrop transaction pending..."),
//   });

//   const { isLoading } = useWaitForTransaction({
//     hash: data?.hash,
//     onSuccess: () => console.log("Airdrop transaction successful!"),
//   });

//   return (
//     <div>
//       <button disabled={!write || isLoading} onClick={() => write?.()}>
//         {" "}
//         Airdrop ERC20{" "}
//       </button>
//     </div>
//   );
// }

function AirdropETH() {
  const { config } = usePrepareAirdropAirdropEth({
    args: [['0xBE77A2C0c6948553Bb8F9a24Cb4414485AE53BcD'], [ethers.utils.parseUnits('0.01', 'ether')]],
    overrides: {
      value: ethers.utils.parseUnits('0.02', 'ether'),
    },
    enabled: true,
  });

  const { data, write } = useAirdropAirdropEth({
    ...config,
    onSuccess: () => console.log('Airdrop transaction pending...'),
  });

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => console.log('Airdrop transaction successful!'),
  });

  return (
    <div>
      <button disabled={!write || isLoading} onClick={() => write?.()}>
        {' '}
        Airdrop ETH{' '}
      </button>
    </div>
  );
}
