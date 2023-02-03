import { ethers } from 'ethers';
import { useWaitForTransaction } from 'wagmi';
import { usePrepareAirdropAirdropEth, useAirdropAirdropEth } from '../generated';

export function ETH() {
  return (
    <div>
      <center>
        <AirdropETH />
      </center>
    </div>
  );
}

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
      <button disabled={!write || isLoading} onClick={() => write?.()} className="btn btn-secondary">
        {' '}
        Airdrop ETH{' '}
      </button>
    </div>
  );
}
