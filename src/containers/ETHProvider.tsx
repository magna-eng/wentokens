import React, { useState, useCallback, useEffect } from 'react';
import { BigNumber, ethers } from 'ethers';
import { tw } from 'typewind';
import { toast } from 'sonner'
import { useWaitForTransaction, useBalance, useAccount } from 'wagmi';
import TextareaAutosize from 'react-textarea-autosize';
import { Icon } from '@iconify/react';
import {
  usePrepareAirdropAirdropEth,
  useAirdropAirdropEth,
  airdropAddress as airdropAddressByChain,
} from '../generated';
import { AirdropTypeEnum, AirdropRecipient } from '../types/airdrop';
import { recipientsParser } from '../types/parsers';
import Button from '../ui/Button';
import Switch from '../ui/Switch';

export default function ETH(props: IAirdropEthProps) {
  return (
    <div>
      <center>
        <AirdropETH {...props} />
      </center>
    </div>
  );
}

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

function AirdropETH({ selected, setSelected }: IAirdropEthProps) {
  const [rawRecipients, setRawRecipients] = useState<string>('0x0000000000000000000000000000000000000000 1000000\n0x0000000000000000000000000000000000000000 1000000');
  const [recipients, setRecipients] = useState<AirdropRecipient[]>([]);
  const [airdropPending, setAirdropPending] = useState<boolean>(false);

  const { address, isConnected } = useAccount();
  const {
    data: balance,
    isLoading: balanceIsLoading,
  } = useBalance({
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

  const submitRecipients = () => {
    try {
      const recipients = recipientsParser(balance?.decimals).parse(rawRecipients) as AirdropRecipient[];
      setRecipients(recipients);
      setAirdropPending(true);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className={tw.container}>
      <div className={tw.flex.flex_col.text_left.space_y_2.whitespace_pre_wrap.w_["1/2"]}>
        <div className={tw.mt_2.text_neutral_400}>
            <div className={tw.badge.badge_primary.badge_outline.px_3.py_2.text_xs}>
              You have {balance?.formatted} {balance?.symbol}
            </div>
        </div>

        {isConnected && (
          <div className={tw.min_h_fit}>
            <h2 className={tw.text_4xl.text_base_100.mb_2}>Recipients and Amounts</h2>
            <h4 className={tw.text_neutral_400.mb_8}>Enter one address and amount of {balance?.symbol} on each line. Supports any format.</h4>
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
