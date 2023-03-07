import { useState, useMemo } from 'react';
import { BigNumber } from 'ethers';
import { toast } from 'sonner';
import { tw } from 'typewind';
import { useWaitForTransaction, useBalance, useAccount } from 'wagmi';
import { usePrepareAirdropAirdropEth, useAirdropAirdropEth } from '../generated';
import { AirdropTypeEnum, AirdropRecipient } from '../types/airdrop';
import { recipientsParser } from '../types/parsers';
import CsvUpload from '../ui/CsvUpload';
import { CongratsModal, ConfirmModal, ModalSelector } from '../ui/Modal';
import Switch from '../ui/Switch';

// Prepares the airdrop
function useAirdrop(
  recipients: AirdropRecipient[],
  onPending: () => void,
  onSuccess: () => void,
  onError: (error: string) => void,
) {
  const { config } = usePrepareAirdropAirdropEth({
    args: [recipients.map(({ address }) => address), recipients.map(({ amount }) => amount)],
    overrides: {
      value: recipients.reduce((acc, { amount }) => acc.add(amount), BigNumber.from(0)),
    },
  });

  const { data, write } = useAirdropAirdropEth({
    ...config,
    onSuccess: onPending,
    onError: error => onError(error.message),
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

export default function AirdropETH({ selected, setSelected }: IAirdropEthProps) {
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

  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
    onError: error => displayMessage(error.message, 'error'),
  });

  const parsedRecipients = useMemo(() => {
    try {
      return (recipients.length ? recipientsParser(balance?.decimals).parse(recipients) : []) as AirdropRecipient[];
    } catch (e) {
      displayMessage((e as Error).message, 'error');
      return [] as AirdropRecipient[];
    }
  }, [balance?.decimals, recipients]);

  const { write: airdropWrite } = useAirdrop(
    parsedRecipients,
    () => displayMessage('Airdrop transaction pending...'),
    function onSuccess() {
      displayMessage('Airdrop transaction successful!', 'success');
      setOpenModal('congrats');
    },
    function onError(error: string) {
      displayMessage(error, 'error');
    },
  );

  return (
    <div className={tw.container}>
      {openModal === 'confirm' && (
        <ConfirmModal
          isOpen={openModal === 'confirm'}
          setIsOpen={val => setOpenModal(val ? 'confirm' : false)}
          recipients={parsedRecipients}
          balanceData={balance}
          loadingMessage={loadingMessage ? loadingMessage : undefined}
          errorMessage={errorMessage ? errorMessage : undefined}
          onSubmit={() => airdropWrite?.()}
        />
      )}
      {openModal === 'congrats' && (
        <CongratsModal isOpen={openModal === 'congrats'} setIsOpen={val => setOpenModal(val ? 'congrats' : false)} />
      )}
      <div className={tw.flex.flex_col.text_left.space_y_2.whitespace_pre_wrap.sm(tw.w_['1/2'])}>
        <div className={tw.mt_2.text_neutral_400}>
          <div className={tw.badge.badge_primary.badge_outline.px_3.py_2.text_xs}>
            You have {balance?.formatted} {balance?.symbol}
          </div>
        </div>

        {isConnected && (
          <div className={tw.min_h_fit}>
            <h2 className={tw.text_4xl.text_base_100.mb_2}>Recipients and Amounts</h2>
            <h4 className={tw.text_neutral_400.mb_8}>
              Upload a <code>.csv</code> containing one address and amount of {balance?.symbol} in each row.
            </h4>
            <Switch selected={selected} setSelected={setSelected} />
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
