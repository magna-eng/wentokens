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
        <p>{new Date().getFullYear()} © Magna Digital, Inc. - All rights reserved.</p>
      </div>
    </footer>
  );
}
