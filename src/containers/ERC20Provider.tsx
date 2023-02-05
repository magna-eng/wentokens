import React, { useState, useCallback } from 'react';
import { BigNumber, ethers } from 'ethers';
import { tw } from 'typewind';
import {
  erc20ABI,
  useAccount,
  useContractRead,
  useWaitForTransaction,
  usePrepareContractWrite,
  useContractWrite,
  Address,
  useChainId,
} from 'wagmi';
import z, { ZodError } from 'zod';
import {
  usePrepareAirdropAirdropErc20,
  useAirdropAirdropErc20,
  airdropAddress as airdropAddressByChain,
} from '../generated';

// Fetches the relevant metadata of the token at the provided address
function useTokenData(tokenAddress: Address) {
  const { address } = useAccount();

  const { data: name } = useContractRead({
    abi: erc20ABI,
    address: tokenAddress,
    functionName: 'name',
  });

  const { data: symbol } = useContractRead({
    abi: erc20ABI,
    address: tokenAddress,
    functionName: 'symbol',
  });

  const { data: balance } = useContractRead({
    abi: erc20ABI,
    address: tokenAddress,
    functionName: 'balanceOf',
    args: [address!],
    enabled: !!address,
  });

  const { data: decimals } = useContractRead({
    abi: erc20ABI,
    address: tokenAddress,
    functionName: 'decimals',
    enabled: !!address,
  });

  return {
    name,
    symbol,
    balance,
    decimals,
  };
}

// Approves the airdrop
function useApproveAllowance(tokenAddress: Address, onPending: () => void, onSuccess: () => void) {
  const { address } = useAccount();
  const chainId = useChainId();
  const airdropAddress = airdropAddressByChain[chainId as 5];

  const { config: approveConfig } = usePrepareContractWrite({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'approve',
    args: [airdropAddress, ethers.utils.parseUnits('1000', 'ether')],
    enabled: Boolean(tokenAddress),
  });

  const { data, write } = useContractWrite({
    ...approveConfig,
    onSuccess: onPending,
  });

  const { refetch } = useContractRead({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address!, airdropAddress],
  });
  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess,
  });

  return {
    isLoading,
    data,
    write,
    refetch,
  };
}

type AirdropRecipient = {
  address: Address;
  amount: BigNumber;
};
// Prepares the airdrop
function useApproveAirdrop(
  tokenAddress: Address,
  recipients: AirdropRecipient[],
  onPending: () => void,
  onSuccess: () => void,
) {
  const { config } = usePrepareAirdropAirdropErc20({
    args: [
      tokenAddress,
      recipients.map(({ address }) => address),
      recipients.map(({ amount }) => amount),
      recipients.reduce((acc, { amount }) => acc.add(amount), BigNumber.from(0)),
    ],
    enabled: true,
  });

  const { data, write } = useAirdropAirdropErc20({ ...config, onSuccess: onPending });

  const { isLoading } = useWaitForTransaction({ hash: data?.hash, onSuccess });

  return {
    isLoading,
    data,
    write,
  };
}

type ToastMessage = {
  text: string;
  className?: string;
};

interface IToastProps {
  messages: ToastMessage[];
}

function Toast({ messages }: IToastProps) {
  return (
    <div className="toast">
      {messages.map(({ text, className }) => (
        <div className={`alert ${className}`}>
          <div>
            <span>{text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const recipientsParser = z.preprocess(
  res => {
    const separator = /[^0-9a-fA-Fx]/;
    const tokens = (res as string).split(separator);
    const ret: AirdropRecipient[] = [];
    console.log(tokens);
    for (let i = 0; i < tokens.length; i += 2) {
      ret.push({
        address: tokens[i] as Address,
        amount: BigNumber.from(tokens[i + 1]),
      });
    }
    return ret;
  },
  z.array(
    z.object({
      address: z.coerce.string().startsWith('0x').length(42),
      amount: z.instanceof(BigNumber).refine(b => b.gte(BigNumber.from(0))),
    }),
  ),
);

export default function ERC20() {
  const [tokenAddress, setTokenAddress] = useState<Address>('0x');
  const [rawRecipients, setRawRecipients] = useState<string>('');
  const [recipients, setRecipients] = useState<AirdropRecipient[]>([]);
  const [recipientsError, setRecipientsError] = useState<ZodError>();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const {
    name: tokenName,
    symbol: tokenSymbol,
    balance: tokenBalance,
    decimals: tokenDecimals,
  } = useTokenData(tokenAddress);
  const formattedTokenBalance = tokenBalance ? ethers.utils.formatUnits(tokenBalance, tokenDecimals) : '0';

  const { isLoading: allowanceIsLoading, write: approveWrite } = useApproveAllowance(
    tokenAddress,
    () =>
      pushToast({
        text: 'Approval transaction pending...',
        className: 'alert-info',
      }),
    () =>
      pushToast({
        text: 'Approval transaction successful!',
        className: 'alert-success',
      }),
  );

  const { isLoading: airdropIsLoading, write: airdropWrite } = useApproveAirdrop(
    tokenAddress,
    [],
    () =>
      pushToast({
        text: 'Airdrop transaction pending...',
        className: 'alert-info',
      }),
    () =>
      pushToast({
        text: 'Airdrop transaction successful!',
        className: 'alert-success',
      }),
  );

  const pushToast = (message: ToastMessage) => {
    setToasts(prev => [...prev, message]);
  };

  const handleTokenAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    setTokenAddress(rawInput as Address);
  };

  const handleRecipientsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawRecipients(e.target.value);
  };

  const submitRecipients = () => {
    try {
      const recipients = recipientsParser.parse(rawRecipients) as AirdropRecipient[];
      setRecipients(recipients);
      alert(recipients);
    } catch (err) {
      if (err instanceof ZodError) {
        setRecipientsError(err);
      }
      console.error(err);
    }
  };

  const validToken = tokenName && tokenSymbol;

  return (
    <div className={tw.container}>
      {!!toasts.length && <Toast messages={toasts} />}

      <div className={tw.flex.flex_col.text_left.space_y_2.whitespace_pre_wrap}>
        <h2 className={tw.text_2xl}>Token Address</h2>
        <input
          className="input input-bordered input-secondary w-full"
          spellCheck={false}
          value={tokenAddress}
          onChange={handleTokenAddressChange}
        />
        <div className="mt-2">
          {validToken ? (
            <div>
              You have <span className="text-secondary">{formattedTokenBalance}</span> {tokenSymbol} ({tokenName})
              token.
            </div>
          ) : (
            'Enter a valid token address to see your available balance.'
          )}
        </div>

        {validToken && (
          <div className="h-72">
            <h2 className={tw.text_2xl}>Recipients and Amounts</h2>
            <h4>Enter one address and amount of {tokenName ?? 'your token'} on each line. Supports any format.</h4>
            <textarea
              spellCheck={false}
              className="input input-bordered input-secondary w-full my-4 min-h-full h-max"
              onChange={handleRecipientsChange}
              placeholder={`0x0000000000000000000000000000000000000000 1000000\n0x0000000000000000000000000000000000000000 1000000`}
            />
            <button className="btn btn-secondary w-1/4" onClick={submitRecipients}>
              Submit
            </button>
            {!recipients && (
              <button disabled={airdropIsLoading} onClick={() => airdropWrite?.()} className="btn btn-secondary w-1/4">
                Submit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
