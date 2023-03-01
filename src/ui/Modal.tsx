import { ReactNode, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { ethers, BigNumber } from 'ethers';
import { tw } from 'typewind';
import { FetchBalanceResult } from 'wagmi/dist/actions';
import Checkmark from '../assets/congrats-checkmark.svg';
import { AirdropRecipient } from '../types/airdrop';
import Button from './Button';

interface IBaseModalProps {
  className?: string;
  isOpen?: boolean;
  setIsOpen?: (val: boolean) => void;
  isCongrats?: boolean;
  children?: ReactNode;
}

function BaseModal({ isOpen, setIsOpen, children, className }: IBaseModalProps) {
  return (
    <>
      <input
        type="checkbox"
        id="airdrop-modal"
        className={tw.modal_toggle}
        checked={isOpen}
        onChange={e => setIsOpen?.(e.currentTarget.checked)}
      />
      <label htmlFor="airdrop-modal" className={tw.modal.cursor_pointer}>
        <label
          className={`${tw.modal_box.relative.border_2.border_neutral_700.bg_neutral_900.text_base_100} ${
            className ?? ''
          }`}
          htmlFor=""
        >
          <label htmlFor="airdrop-modal" className={tw.absolute.right_6.top_4.cursor_pointer}>
            ✕
          </label>
          {children}
        </label>
      </label>
    </>
  );
}

type IModalProps = IBaseModalProps & {
  symbol?: string;
  balanceData?: Partial<Pick<FetchBalanceResult, 'decimals' | 'value' | 'symbol'>>;
  recipients: AirdropRecipient[];
  formattedBalance?: string;
  onSubmit?: () => void;
};

export type ModalSelector = 'confirm' | 'congrats';

export function CongratsModal(props: IBaseModalProps) {
  return (
    <BaseModal className={tw.bg_no_repeat.bg_top + ' bg-congrats'} {...props}>
      <img className={tw.m_4} src={Checkmark} />
      <h1 className={tw.text_2xl}>Congratulations!</h1>
      <p className={tw.text_sm.text_neutral_300.mt_2.mb_10}>You have been rugged and all of your tokens are gone!</p>
      <button className={tw.btn.btn_secondary.w_full.border_2.border_neutral_700.bg_transparent}>Cancel</button>
    </BaseModal>
  );
}

export function ConfirmModal({ recipients, balanceData = {}, onSubmit, ...props }: IModalProps) {
  const { decimals = 18, value: balance = BigNumber.from(0), symbol = '' } = balanceData;
  const total = useMemo(() => recipients.reduce((acc, { amount }) => acc.add(amount), BigNumber.from(0)), [recipients]);
  return (
    <BaseModal {...props} className={tw.w_['1/2'].max_w_5xl.p_0.font_light}>
      <div className={tw.pt_4.px_10.pb_2}>
        <h1 className={tw.text_2xl.font_medium}>Recipients and amounts</h1>
        <h4 className={tw.text_sm.text_neutral_300.mt_2}>
          Enter one address and amount of {symbol ?? 'your token'} on each line, supports any format.
        </h4>
      </div>
      <hr className={tw.text_neutral_700} />

      <div className={tw.p_4.px_10}>
        <h3 className={tw.text_xl.text_left.my_2.font_medium}>Confirm</h3>
        <table
          className={tw.w_full.border_2.border_neutral_700.bg_transparent.rounded_lg.border_separate.border_spacing_0}
        >
          <thead>
            <tr>
              <th className={tw.capitalize.bg_transparent.text_neutral_400.p_3.text_left}>Recipient</th>
              <th className={tw.capitalize.bg_transparent.text_neutral_400.p_3.text_right}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {recipients.map((recipient, index) => (
              <tr key={recipient.address + index}>
                <td
                  className={tw.capitalize.bg_transparent.text_neutral_400.p_3.text_left.border_t_2.border_neutral_700}
                >
                  {recipient.address}
                </td>
                <td
                  className={tw.capitalize.bg_transparent.text_neutral_400.p_3.text_right.border_t_2.border_neutral_700}
                >
                  {ethers.utils.formatUnits(recipient.amount, decimals)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={tw.flex.flex_col.gap_2.my_2.text_sm}>
          <span className={tw.flex.flex_row}>
            <p className={tw.text_neutral_400.mr_auto}>Total</p>
            <p>
              {ethers.utils.formatUnits(total, decimals)} {symbol}
            </p>
          </span>
          <span className={tw.flex.flex_row}>
            <p className={tw.text_neutral_400.mr_auto}>Your balance</p>
            <p>
              {ethers.utils.formatUnits(balance, decimals)} {symbol}
            </p>
          </span>
          <span className={tw.flex.flex_row}>
            <p className={tw.text_neutral_400.mr_auto}>Remaining</p>
            <p className={tw.text_critical}>
              {ethers.utils.formatUnits(balance.sub(total), decimals)} {symbol}
            </p>
          </span>
        </div>
      </div>

      <hr className={tw.text_neutral_700} />

      <div className={tw.p_4.px_10}>
        <Button onClick={() => onSubmit?.()}>
          <p className={tw.mr_1}>Sign Transaction</p> <Icon icon="ri:edit-fill" />
        </Button>
      </div>

      <div></div>
    </BaseModal>
  );
}
