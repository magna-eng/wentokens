import { useState } from 'react';
import { ethers } from 'ethers';
import {
  erc20ABI,
  useAccount,
  useContractRead,
  useWaitForTransaction,
  usePrepareContractWrite,
  useContractWrite,
  Address,
} from 'wagmi';
import { usePrepareAirdropAirdropErc20, useAirdropAirdropErc20 } from '../generated';

export function ERC20() {
  return (
    <div>
      <center>
        <Approve />
        <GetAllowance />
        <AirdropERC20 />
      </center>
    </div>
  );
}

function AirdropERC20() {
  const tokenAddress = '0x6292F13202e6d418136aa7d40e1BF85F3e394682';

  const { config } = usePrepareAirdropAirdropErc20({
    args: [
      tokenAddress,
      ['0x3d4aaFbe86059d17C6263332c560f18C4F1Fec34'],
      [ethers.utils.parseUnits('1000', 'ether')],
      ethers.utils.parseUnits('1000', 'ether'),
    ],
    enabled: true,
  });

  const { data, write } = useAirdropAirdropErc20({
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
        Airdrop ERC20{' '}
      </button>
    </div>
  );
}

function Approve() {
  const [value, setValue] = useState<string>('');
  const { address } = useAccount();
  const airdropAddress = '0x93c1313F006669130e37626BB85558a378703181';
  const tokenAddress = '0x6292F13202e6d418136aa7d40e1BF85F3e394682';

  const { config } = usePrepareContractWrite({
    address: value as Address,
    abi: erc20ABI,
    functionName: 'approve',
    args: [airdropAddress, ethers.utils.parseUnits('1000', 'ether')],
    enabled: Boolean(value),
  });

  const { data, write } = useContractWrite({
    ...config,
    onSuccess: () => setValue(''),
  });

  const { refetch } = useContractRead({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address!, airdropAddress],
  });
  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => refetch(),
  });

  return (
    <div>
      <input
        disabled={isLoading}
        onChange={e => setValue(e.target.value)}
        value={value}
        className="input input-bordered input-secondary w-full max-w-xs"
      />
      <button disabled={!write || isLoading} onClick={() => write?.()} className="btn">
        {' '}
        Approve{' '}
      </button>
    </div>
  );
}

function GetAllowance() {
  const { address } = useAccount();
  const airdropAddress = '0x93c1313F006669130e37626BB85558a378703181';
  const tokenAddress = '0x6292F13202e6d418136aa7d40e1BF85F3e394682';

  const { data: allowance } = useContractRead({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address!, airdropAddress],
  });

  return <div>Allowance: {allowance?.toString()}</div>;
}
