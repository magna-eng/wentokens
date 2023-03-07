import { ConnectButton } from '@rainbow-me/rainbowkit';
import { tw } from 'typewind';

export default function Navbar() {
  return (
    <div className={tw.navbar.bg_transparent.border_b_['1px'].py_4.px_4.sm(tw.px_40)}>
      <div className={tw.navbar_start}>
        <a
          href="/"
          className={
            tw.font_logo.text_xl.sm(tw.text_4xl).text_transparent.bg_clip_text.bg_gradient_to_r.from_primary.to_base_100
          }
        >
          wentokens
        </a>
      </div>
      <div className={tw.navbar_end}>
        <ConnectButton />
      </div>
    </div>
  );
}
