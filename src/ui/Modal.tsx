import { ReactNode } from 'react';
import { tw } from 'typewind';
import Checkmark from '../assets/congrats-checkmark.svg';
import Button from './Button';

interface IBaseModalProps {
  className?: string;
  isOpen?: boolean;
  setIsOpen?: (val: boolean) => void;
  isCongrats?: boolean;
  children?: ReactNode;
}

function BaseModal({ isOpen, setIsOpen, children, className }: IBaseModalProps) {
  return <>
    <input type="checkbox" id="airdrop-modal" className={tw.modal_toggle} checked={isOpen} onChange={e => setIsOpen?.(e.currentTarget.checked)} />
    <label htmlFor="airdrop-modal" className={tw.modal.cursor_pointer}>
      <label className={`${tw.modal_box.relative.border_2.border_neutral_700.bg_neutral_900.text_base_100} ${className ?? ''}`} htmlFor="">
        <label htmlFor="airdrop-modal" className={tw.absolute.right_6.top_4.cursor_pointer}>✕</label>
        {children}
      </label>
    </label>
  </>
}

type IModalProps = IBaseModalProps & {
  symbol?: string;
  formattedBalance?: string;
}

export function CongratsModal (props: IBaseModalProps) {
  return <BaseModal className={tw.bg_no_repeat.bg_top + " bg-congrats"} {...props}>
    <img className={tw.m_4} src={Checkmark} />
    <h1 className={tw.text_2xl}>Congratulations!</h1>
    <p className={tw.text_sm.text_neutral_300.mt_2.mb_10}>You have been rugged and all of your tokens are gone!</p>
    <button className={tw.btn.btn_secondary.w_full.border_2.border_neutral_700.bg_transparent}>Cancel</button>
  </BaseModal>
}

export function FormModal({ symbol, ...props }: IModalProps) {
  return <BaseModal {...props} className={tw.w_['1/2'].max_w_5xl.p_0.font_light}>
    <div className={tw.pt_4.px_10.pb_2}>
      <h1 className={tw.text_2xl.font_medium}>Recipients and amounts</h1>
      <h4 className={tw.text_sm.text_neutral_300.mt_2}>Enter one address and amount of {symbol ?? 'your token'} on each line, supports any format.</h4>
    </div>
    <hr className={tw.text_neutral_700} />


    <div className={tw.p_4.px_10}>
      <h3 className={tw.text_xl.text_left.mt_2.font_medium}>Confirm</h3>
      <table className={tw.w_full.border_2.border_neutral_700.bg_transparent.rounded_lg.border_separate.border_spacing_0}>
        <thead>
          <tr>
            <th className={tw.capitalize.bg_transparent.text_neutral_400.p_3.text_left}>Recipient</th>
            <th className={tw.capitalize.bg_transparent.text_neutral_400.p_3.text_right}>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className={tw.capitalize.bg_transparent.text_neutral_400.p_3.text_left}>1</th>
            <td className={tw.capitalize.bg_transparent.text_neutral_400.p_3.text_right}>Blue</td>
          </tr>
          <tr>
            <th className={tw.capitalize.bg_transparent.text_neutral_400.p_3.text_left}>1</th>
            <td className={tw.capitalize.bg_transparent.text_neutral_400.p_3.text_right}>Blue</td>
          </tr>
          <tr>
            <th className={tw.capitalize.bg_transparent.text_neutral_400.p_3.text_left}>1</th>
            <td className={tw.capitalize.bg_transparent.text_neutral_400.p_3.text_right}>Blue</td>
          </tr>
        </tbody>
      </table>

      <div className={tw.flex.flex_col.gap_2.my_2.text_sm}>
        <span className={tw.flex.flex_row}>
          <p className={tw.text_neutral_400.mr_auto}>Total</p>
          <p>0</p>
        </span>
        <span className={tw.flex.flex_row}>
          <p className={tw.text_neutral_400.mr_auto}>Your balance</p>
          <p>0</p>
        </span>
        <span className={tw.flex.flex_row}>
          <p className={tw.text_neutral_400.mr_auto}>Total</p>
          <p>0</p>
        </span>
      </div>
    </div>

    <hr className={tw.text_neutral_700} />

    <div className={tw.p_4.px_10}>
      <Button>
        Sign Transaction
      </Button>
    </div>

    <div>

    </div>
  </BaseModal>
}