import React, { useState, useMemo } from 'react';
import { BigNumber, ethers } from 'ethers';
import { toast } from 'sonner';
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
import { AirdropTypeEnum, AirdropRecipient } from '../types/airdrop';
import { recipientsParser } from '../types/parsers';
import CsvUpload from '../ui/CsvUpload';
import { CongratsModal, ConfirmModal, ModalSelector } from '../ui/Modal';
import Switch from '../ui/Switch';

// TODO: Keyboard shortcuts

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
function useApproveAllowance(
  tokenAddress: Address,
  amount: BigNumber,
  onPending: () => void,
  onSuccess: () => void,
  onError: (error: string) => void,
) {
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
    // onError: error => onError(error.message),
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
    onError: error => onError(error.message),
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
  onError: (error: string) => void,
) {
  const { config } = usePrepareAirdropAirdropErc20({
    args: [
      tokenAddress,
      recipients.map(({ address }) => address),
      recipients.map(({ amount }) => amount),
      recipients.reduce((acc, { amount }) => acc.add(amount), BigNumber.from(0)),
    ],
  });

  const { data, write } = useAirdropAirdropErc20({
    ...config,
    onSuccess: onPending,
    onError: error => {
      onError(error.message);
    },
  });

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess,
    onError: error => onError(error.message),
  });

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
  const [recipients, setRecipients] = useState<[string, string][]>([]);
  const [openModal, setOpenModal] = useState<ModalSelector | false>(false);
  const [loadingMessage, setLoadingMessage] = useState<string | false>(false);
  const [errorMessage, setErrorMessage] = useState<string | false>(false);

  const displayMessage = (message: string, type?: 'success' | 'error') => {
    if (type === 'error') {
      setLoadingMessage(false);
      setErrorMessage(message);
      toast[type](message);
    } else if (type === 'success') {
      setLoadingMessage(message);
      setErrorMessage(false);
      toast[type](message);
    } else {
      setLoadingMessage(message);
      setErrorMessage(false);
      toast(message);
    }
  };

  const displayModal = () => {
    setOpenModal('confirm');
    setLoadingMessage(false);
    setErrorMessage(false);
  };

  const {
    name: tokenName,
    symbol: tokenSymbol,
    balance: tokenBalance,
    decimals: tokenDecimals,
  } = useTokenData(tokenAddress);
  const balanceData = {
    name: tokenName,
    symbol: tokenSymbol,
    value: tokenBalance,
    decimals: tokenDecimals,
  };
  const formattedTokenBalance = tokenBalance ? ethers.utils.formatUnits(tokenBalance, tokenDecimals) : '0';

  const parsedRecipients = useMemo(() => {
    try {
      return (recipients.length ? recipientsParser(tokenDecimals).parse(recipients) : []) as AirdropRecipient[];
    } catch (e) {
      displayMessage((e as Error).message, 'error');
      return [] as AirdropRecipient[];
    }
  }, [tokenDecimals, recipients]);

  const { write: airdropWrite } = useApproveAirdrop(
    tokenAddress,
    parsedRecipients,
    () => displayMessage('Airdrop transaction pending...'),
    function onSuccess() {
      displayMessage('Airdrop transaction successful!', 'success');
      setOpenModal('congrats');
    },
    function onError(error) {
      displayMessage(error, 'error');
    },
  );

  const { write: approveWrite } = useApproveAllowance(
    tokenAddress,
    parsedRecipients.reduce((acc, { amount }) => acc.add(amount), BigNumber.from(0)),
    () => displayMessage('Approval transaction pending...'),
    function onSuccess() {
      displayMessage('Approval transaction submitted!', 'success');
      airdropWrite?.();
    },
    function onError(error) {
      displayMessage(error, 'error');
    },
  );

  const handleTokenAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    setTokenAddress(rawInput as Address);
  };

  const validToken = tokenName && tokenSymbol;

  return (
    <div className={tw.container}>
      {openModal === 'confirm' && (
        <ConfirmModal
          isOpen={openModal === 'confirm'}
          setIsOpen={val => setOpenModal(val ? 'confirm' : false)}
          recipients={parsedRecipients}
          balanceData={balanceData}
          loadingMessage={loadingMessage ? loadingMessage : undefined}
          errorMessage={errorMessage ? errorMessage : undefined}
          onSubmit={() => approveWrite?.()}
        />
      )}
      {openModal === 'congrats' && (
        <CongratsModal isOpen={openModal === 'congrats'} setIsOpen={val => setOpenModal(val ? 'congrats' : false)} />
      )}
      <div className={tw.flex.flex_col.text_left.space_y_2.whitespace_pre_wrap.sm(tw.w_['1/2'])}>
        <h2 className={tw.text_3xl.text_base_100.mb_2}>Token Address</h2>
        {!validToken ? <Switch selected={selected} setSelected={setSelected} /> : null}
        <input
          className={tw.input.input_bordered.text_base_100.bg_transparent.border_2.border_neutral_700}
          spellCheck={false}
          value={tokenAddress}
          onChange={handleTokenAddressChange}
        />
        <div>
          <div className={tw.badge.badge_primary.badge_outline.px_3.py_2.text_xs.mt_2.h_auto + ' !min-h-fit'}>
            {validToken ? (
              <>
                You have {formattedTokenBalance} {tokenSymbol}
              </>
            ) : (
              `Enter a valid token address to see your available balance.`
            )}
          </div>
        </div>

        {validToken && (
          <div className={tw.min_h_fit}>
            <h2 className={tw.text_4xl.text_base_100.mb_2}>Recipients and Amounts</h2>
            <h4 className={tw.text_neutral_400.mb_8}>
              Upload a <code>.csv</code> containing one address and amount of {tokenSymbol} in each row.
            </h4>
            <CsvUpload
              onUpload={({ data }) => {
                setRecipients(data as [string, string][]);
                displayModal();
              }}
              onReset={() => setRecipients([])}
            />
          </div>
        )}
      </div>
    </div>
  );
}
