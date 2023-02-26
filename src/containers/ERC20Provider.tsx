import React, { useState, useCallback, useEffect } from 'react';
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
import {
  usePrepareAirdropAirdropErc20,
  useAirdropAirdropErc20,
  airdropAddress as airdropAddressByChain,
} from '../generated';
import { AirdropRecipient } from '../types/airdrop';
import { recipientsParser } from '../types/parsers';
import Button from '../ui/Button';
import { Toast, ToastMessage } from '../ui/Toast';

// TODO: Keyboard shortcuts
// TODO: Better toasts
// TODO: proper error handling

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
function useApproveAllowance(tokenAddress: Address, amount: BigNumber, onPending: () => void, onSuccess: () => void) {
  const { address } = useAccount();
  const chainId = useChainId();
  const airdropAddress = airdropAddressByChain[chainId as 5];

  const { config: approveConfig } = usePrepareContractWrite({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'approve',
    args: [airdropAddress, amount],
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
  });

  const { data, write } = useAirdropAirdropErc20({ ...config, onSuccess: onPending });

  const { isLoading } = useWaitForTransaction({ hash: data?.hash, onSuccess });

  return {
    isLoading,
    data,
    write,
  };
}

export default function ERC20() {
  const [tokenAddress, setTokenAddress] = useState<Address>('0x');
  const [rawRecipients, setRawRecipients] = useState<string>('');
  const [recipients, setRecipients] = useState<AirdropRecipient[]>([]);
  const [recipientsError, setRecipientsError] = useState<Error>();
  const [airdropPending, setAirdropPending] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const {
    name: tokenName,
    symbol: tokenSymbol,
    balance: tokenBalance,
    decimals: tokenDecimals,
  } = useTokenData(tokenAddress);
  const formattedTokenBalance = tokenBalance ? ethers.utils.formatUnits(tokenBalance, tokenDecimals) : '0';

  const { isLoading: airdropIsLoading, write: airdropWrite } = useApproveAirdrop(
    tokenAddress,
    recipients,
    () =>
      pushToast({
        text: 'Airdrop transaction pending...',
        className: 'alert-info',
      }),
    function onSuccess() {
      setAirdropPending(false);
      pushToast({
        text: 'Airdrop transaction successful!',
        className: 'alert-success',
      });
    },
  );

  const { isLoading: allowanceIsLoading, write: approveWrite } = useApproveAllowance(
    tokenAddress,
    recipients.reduce((acc, { amount }) => acc.add(amount), BigNumber.from(0)),
    () =>
      pushToast({
        text: 'Approval transaction pending...',
        className: 'alert-info',
      }),
    function onSuccess() {
      pushToast({
        text: 'Approval transaction successful!',
        className: 'alert-success',
      });
      airdropWrite?.();
    },
  );

  useEffect(() => {
    if (airdropPending) {
      approveWrite?.();
    }
  }, [airdropPending]);

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

  const submitRecipients = useCallback(() => {
    try {
      const recipients = recipientsParser(tokenDecimals).parse(rawRecipients) as AirdropRecipient[];
      setRecipients(recipients);
      setAirdropPending(true);
    } catch (err) {
      setRecipientsError(err as Error);
    }
  }, [tokenDecimals, rawRecipients]);

  const validToken = tokenName && tokenSymbol;

  return (
    <div className={tw.container}>
      {!!toasts.length && <Toast messages={toasts} />}

      <div className={tw.flex.flex_col.text_left.space_y_2.whitespace_pre_wrap + " w-1/2"}>
        <h2 className={tw.text_2xl}>Token Address</h2>
        <input
          className={tw.input.input_bordered.input_secondary}
          spellCheck={false}
          value={tokenAddress}
          onChange={handleTokenAddressChange}
        />
        <div className={tw.mt_2}>
          {validToken ? (
            <div>
              You have <span className={tw.text_secondary}>{formattedTokenBalance}</span> {tokenSymbol} ({tokenName})
              token
            </div>
          ) : (
            'Enter a valid token address to see your available balance.'
          )}
        </div>

        {validToken && (
          <div className={tw.min_h_fit}>
            <h2 className={tw.text_2xl}>Recipients and Amounts</h2>
            <h4>Enter one address and amount of {tokenName ?? 'your token'} on each line. Supports any format.</h4>
            <textarea
              spellCheck={false}
              className={tw.input.input_bordered.input_secondary.w_full.my_4.min_h_full.h_max}
              onChange={handleRecipientsChange}
              placeholder={`0x0000000000000000000000000000000000000000 1000000\n0x0000000000000000000000000000000000000000 1000000`}
            />
            <br />
            <Button className={tw.btn_primary.w_["1/4"]} onClick={submitRecipients}>
              Airdrop
            </Button>
            {recipientsError && recipientsError.message}
          </div>
        )}
      </div>
    </div>
  );
}
