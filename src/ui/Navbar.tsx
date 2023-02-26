import { tw } from 'typewind';
import ConnectButton from './ConnectButton';

export default function Navbar() {
  return <div className={tw.navbar.bg_transparent.border_b_["1px"].border_b_neutral_800.py_4.px_40}>
    <div className={tw.navbar_start}>
      <h1 className={tw.font_logo.text_4xl.text_transparent.bg_clip_text.bg_gradient_to_r.from_primary.to_base_100}>wentokens</h1>
    </div>
    <div className={tw.navbar_end.gap_x_2}>
      <ConnectButton />
    </div>
  </div>
}