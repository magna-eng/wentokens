import { tw } from 'typewind';
import LogoMark from '../assets/magna-logomark.png';
import WordMark from '../assets/magna-wordmark.png';

export default function Footer() {
  return (
    <footer className={tw.footer.footer_center.p_10.bg_transparent.text_neutral_400.text_sm.mt_auto}>
      <div>
        <p className={tw.flex.justify_center.items_end.gap_1}>
          Powered by{' '}
          <a href="https://www.magna.so/" target="_blank" className={tw.flex.justify_center.items_start.gap_1}>
            <img src={LogoMark} /> <img src={WordMark} />
          </a>
        </p>
        <p className={tw.flex.justify_center.items_end.gap_1}>
          <p className={tw.text_base_100}>Contributors: </p>
          <a className={tw.hover(tw.text_primary)} href="https://twitter.com/PopPunkOnChain" target="_blank">
            @PopPunkOnChain
          </a>
          <a className={tw.hover(tw.text_primary)} href="https://twitter.com/danxtao" target="_blank">
            @danxtao
          </a>
          <a className={tw.hover(tw.text_primary)} href="https://twitter.com/yungtesh" target="_blank">
            @yungtesh
          </a>
          <a className={tw.hover(tw.text_primary)} href="https://twitter.com/arundotai" target="_blank">
            @arundotai
          </a>
        </p>
        <p className={tw.flex.justify_center.items_end.gap_1}>
          <p className={tw.text_base_100.hidden.sm(tw.inline_block)}>In collaboration with: </p>
          <p className={tw.text_base_100.inline_block.sm(tw.hidden)}>Collaborators: </p>
          <a className={tw.hover(tw.text_primary)} href="https://twitter.com/zellic_io" target="_blank">
            @zellic_io
          </a>
          <a className={tw.hover(tw.text_primary)} href="https://twitter.com/osec_io" target="_blank">
            @osec_io
          </a>
          <a className={tw.hover(tw.text_primary)} href="https://twitter.com/optimizoor" target="_blank">
            @optimizoor
          </a>
        </p>
        <p>{new Date().getFullYear()} © Magna Digital, Inc. - All rights reserved.</p>
      </div>
    </footer>
  );
}
