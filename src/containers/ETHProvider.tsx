import React, { useState, useCallback, useEffect } from 'react';
import { BigNumber } from 'ethers';
import { tw } from 'typewind';
import { toast } from 'sonner'
import { useWaitForTransaction, useBalance, useAccount } from 'wagmi';
import { Icon } from '@iconify/react';
import {
  usePrepareAirdropAirdropEth,
  useAirdropAirdropEth,
} from '../generated';
import { AirdropTypeEnum, AirdropRecipient } from '../types/airdrop';
import { recipientsParser } from '../types/parsers';
import Button from '../ui/Button';
import { CongratsModal, FormModal } from '../ui/Modal';
import Switch from '../ui/Switch';
import CsvUpload from '../ui/CsvUpload';

// Prepares the airdrop
function useAirdrop(recipients: AirdropRecipient[], onPending: () => void, onSuccess: () => void) {
  const { config } = usePrepareAirdropAirdropEth({
    args: [recipients.map(({ address }) => address), recipients.map(({ amount }) => amount)],
    overrides: {
      value: recipients.reduce((acc, { amount }) => acc.add(amount), BigNumber.from(0)),
    },
  });

  const { data, write } = useAirdropAirdropEth({
    ...config,
    onSuccess: () => console.log('Airdrop transaction pending...'),
  });

  const { isLoading } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess: () => console.log('Airdrop transaction successful!'),
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
  const [recipients, setRecipients] = useState<AirdropRecipient[]>([]);
  const [airdropPending, setAirdropPending] = useState<boolean>(false);
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address: address,
  });

  const { write: airdropWrite } = useAirdrop(
    recipients,
    () => toast('Airdrop transaction pending...'),
    function onSuccess() {
      toast.success('Airdrop transaction successful!');
      airdropWrite?.();
    },
  );

  useEffect(() => {
    if (airdropPending) {
      airdropWrite?.();
    }
  }, [airdropPending]);

  const handleRecipientsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawRecipients(e.target.value);
  };

  const openModal = useCallback(() => {
    setModalIsOpen(true);
  })

  // const submitRecipients = useCallback(() => {
  //   try {
  //     const recipients = recipientsParser(balance?.decimals).parse(rawRecipients) as AirdropRecipient[];
  //     setRecipients(recipients);
  //     setAirdropPending(true);
  //   } catch (err) {
  //     toast.error((err as Error).message);
  //   }
  // }, [balance?.decimals, rawRecipients]);

  return (
    <div className={tw.container}>
      <FormModal isOpen={modalIsOpen} setIsOpen={setModalIsOpen} />
      <div className={tw.flex.flex_col.text_left.space_y_2.whitespace_pre_wrap.w_["1/2"]}>
        <div className={tw.mt_2.text_neutral_400}>
          <div className={tw.badge.badge_primary.badge_outline.px_3.py_2.text_xs}>
            You have {balance?.formatted} {balance?.symbol}
          </div>
        </div>

        {isConnected && (
          <div className={tw.min_h_fit}>
            <h2 className={tw.text_4xl.text_base_100.mb_2}>Recipients and Amounts</h2>
            <h4 className={tw.text_neutral_400.mb_8}>Upload a <code>.csv</code> containing one address and amount of {balance?.symbol} in each row.</h4>
            <Switch selected={selected} setSelected={setSelected} />
            <CsvUpload />
            <Button onClick={openModal}>
              Airdrop <Icon icon="ri:arrow-right-up-line" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
