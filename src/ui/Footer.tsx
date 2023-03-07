import { tw } from 'typewind';
import LogoMark from '../assets/magna-logomark.png';
import WordMark from '../assets/magna-wordmark.png';

export default function Footer() {
  return (
    <footer className={tw.footer.footer_center.p_10.bg_transparent.text_neutral_400.text_sm.mt_auto}>
      <div>
        <p className={tw.flex.justify_center.items_end.gap_1}>
          Powered by{' '}
          <a 
            href="https://www.magna.so/"
            target="_blank"
            className={tw.flex.justify_center.items_start.gap_1}
          >
            <img src={LogoMark} /> <img src={WordMark} />
          </a>
        </p>
        <p className={tw.flex.justify_center.items_end.gap_1}>
          Contributors: {' '}
          <a 
            href="https://twitter.com/PopPunkOnChain"
            target="_blank"
            className={tw.flex.justify_center.items_start.gap_1}
          >
            @PopPunkOnChain
          </a>
          <a 
            href="https://twitter.com/danxtao"
            target="_blank"
            className={tw.flex.justify_center.items_start.gap_1}
          >
            @danxtao
          </a>
        </p>
        <p className={tw.flex.justify_center.items_end.gap_1}>
          In collaboration with: {' '}
          <a 
            href="https://twitter.com/zellic_io"
            target="_blank"
            className={tw.flex.justify_center.items_start.gap_1}
          >
            @zellic_io
          </a>
          <a 
            href="https://twitter.com/osec_io"
            target="_blank"
            className={tw.flex.justify_center.items_start.gap_1}
          >
            @osec_io
          </a>
          <a 
            href="https://twitter.com/optimizoor"
            target="_blank"
            className={tw.flex.justify_center.items_start.gap_1}
          >
            @optimizoor
          </a>
        </p>
        <p>{new Date().getFullYear()} © Magna Digital, Inc. - All rights reserved.</p>
      </div>
    </footer>
  );
}
