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
import { toast } from 'sonner'
import TextareaAutosize from 'react-textarea-autosize';
import { Icon } from '@iconify/react';
import {
  usePrepareAirdropAirdropErc20,
  useAirdropAirdropErc20,
  airdropAddress as airdropAddressByChain,
} from '../generated';
import { AirdropTypeEnum, AirdropRecipient } from '../types/airdrop';
import { recipientsParser } from '../types/parsers';
import Button from '../ui/Button';
import Switch from '../ui/Switch';

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

interface IAirdropEthProps {
  selected: AirdropTypeEnum;
  setSelected: (selected: AirdropTypeEnum) => void;
}

export default function ERC20({ selected, setSelected }: IAirdropEthProps) {
  const [tokenAddress, setTokenAddress] = useState<Address>('0x');
  const [rawRecipients, setRawRecipients] = useState<string>('0x0000000000000000000000000000000000000000 1000000\n0x0000000000000000000000000000000000000000 1000000');
  const [recipients, setRecipients] = useState<AirdropRecipient[]>([]);
  const [airdropPending, setAirdropPending] = useState<boolean>(false);

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
    () => toast('Airdrop transaction pending...'),
    function onSuccess() {
      setAirdropPending(false);
      toast.success('Airdrop transaction successful!');
    },
  );

  const { isLoading: allowanceIsLoading, write: approveWrite } = useApproveAllowance(
    tokenAddress,
    recipients.reduce((acc, { amount }) => acc.add(amount), BigNumber.from(0)),
    () => toast('Approval transaction pending...'),
    function onSuccess() {
      toast.success('Approval transaction successful!');
      airdropWrite?.();
    },
  );

  useEffect(() => {
    if (airdropPending) {
      approveWrite?.();
    }
  }, [airdropPending]);

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
      toast.error((err as Error).message);
    }
  }, [tokenDecimals, rawRecipients]);

  const validToken = tokenName && tokenSymbol;

  return (
    <div className={tw.container}>

      <div className={tw.flex.flex_col.text_left.space_y_2.whitespace_pre_wrap + " w-1/2"}>
        <h2 className={tw.text_3xl.text_base_100.mb_2}>Token Address</h2>
        {!validToken ? <Switch selected={selected} setSelected={setSelected} /> : null }
        <input
          className={tw.input.input_bordered.text_base_100.bg_transparent.border_2.border_neutral_700}
          spellCheck={false}
          value={tokenAddress}
          onChange={handleTokenAddressChange}
        />
        <div>
          <div className={tw.badge.badge_primary.badge_outline.px_3.py_2.text_xs.mt_2}>
            {validToken ? <>You have {formattedTokenBalance} {tokenSymbol}</>
              : `Enter a valid token address to see your available balance.`}
          </div>
        </div>

        {validToken && (
          <div className={tw.min_h_fit}>
            <h2 className={tw.text_4xl.text_base_100.mb_2}>Recipients and Amounts</h2>
            <h4 className={tw.text_neutral_400.mb_8}>Enter one address and amount of {tokenName ?? 'your token'} on each line. Supports any format.</h4>
            <Switch selected={selected} setSelected={setSelected} />
            <TextareaAutosize
              spellCheck={false}
              className={tw.input.input_bordered.input_secondary.text_base_100.bg_transparent.border_2.border_neutral_700.py_4.px_6.w_full.my_4.min_h_["30vh"].h_max}
              onChange={handleRecipientsChange}
              defaultValue={`0x0000000000000000000000000000000000000000 1000000\n0x0000000000000000000000000000000000000000 1000000`}
              placeholder={`0x0000000000000000000000000000000000000000 1000000\n0x0000000000000000000000000000000000000000 1000000`}
            />
            <Button onClick={submitRecipients}>
              Airdrop <Icon icon="ri:arrow-right-up-line" />
            </Button> 
          </div>
        )}
      </div>
    </div>
  );
}
