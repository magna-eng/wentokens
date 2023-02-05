import React, { useState, useCallback, useEffect } from 'react';
import { BigNumber, ethers } from 'ethers';
import { tw } from 'typewind';
import { useWaitForTransaction, useBalance, useAccount, Address } from 'wagmi';
import {
  usePrepareAirdropAirdropEth,
  useAirdropAirdropEth,
  airdropAddress as airdropAddressByChain,
} from '../generated';
import { AirdropRecipient } from '../types/airdrop';
import { recipientsParser } from '../types/parsers';
import { Toast, ToastMessage } from '../ui/Toast';

export default function ETH() {
  return (
    <div>
      <center>
        <AirdropETH />
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

function AirdropETH() {
  const [rawRecipients, setRawRecipients] = useState<string>('');
  const [recipients, setRecipients] = useState<AirdropRecipient[]>([]);
  const [recipientsError, setRecipientsError] = useState<Error>();
  const [airdropPending, setAirdropPending] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const { address, isConnected } = useAccount();
  const {
    data: balance,
    isError,
    isLoading: balanceIsLoading,
  } = useBalance({
    address: address,
  });

  const { write: airdropWrite } = useAirdrop(
    recipients,
    () =>
      pushToast({
        text: 'Airdrop transaction pending...',
        className: 'alert-info',
      }),
    function onSuccess() {
      pushToast({
        text: 'Airdrop transaction successful!',
        className: 'alert-success',
      });
      airdropWrite?.();
    },
  );

  useEffect(() => {
    if (airdropPending) {
      airdropWrite?.();
    }
  }, [airdropPending]);

  const pushToast = (message: ToastMessage) => {
    setToasts(prev => [...prev, message]);
  };

  const handleRecipientsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawRecipients(e.target.value);
  };

  const submitRecipients = () => {
    try {
      const recipients = recipientsParser(balance?.decimals).parse(rawRecipients) as AirdropRecipient[];
      setRecipients(recipients);
      setAirdropPending(true);
    } catch (err) {
      setRecipientsError(err as Error);
    }
  };

  return (
    <div className={tw.container}>
      {!!toasts.length && <Toast messages={toasts} />}

      <div className={tw.flex.flex_col.text_left.space_y_2.whitespace_pre_wrap + " w-1/2"}>
        <div className="mt-2">
          {isConnected ? (
            <div>
              You have <span className="text-secondary">{balance?.formatted}</span> {balance?.symbol}.
            </div>
          ) : (
            'Enter a valid token address to see your available balance.'
          )}
        </div>

        {isConnected && (
          <div className="h-72">
            <h2 className={tw.text_2xl}>Recipients and Amounts</h2>
            <h4>Enter one address and amount of {balance?.symbol} on each line. Supports any format.</h4>
            <textarea
              spellCheck={false}
              className="input input-bordered input-secondary w-full my-4 min-h-full h-max"
              onChange={handleRecipientsChange}
              placeholder={`0x0000000000000000000000000000000000000000 1000000\n0x0000000000000000000000000000000000000000 1000000`}
            />
            <button className="btn btn-secondary w-1/4" onClick={submitRecipients}>
              Airdrop
            </button>
            {recipientsError && recipientsError.message}
          </div>
        )}
      </div>
    </div>
  );
}
