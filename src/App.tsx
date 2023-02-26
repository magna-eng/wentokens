import { useState } from 'react';
import { tw } from 'typewind';
import { useAccount } from 'wagmi';
import ERC20Provider from './containers/ERC20Provider';
import ETHProvider from './containers/ETHProvider';
import { AirdropType, AirdropTypeEnum } from './types/airdrop';
import ConnectButton from './ui/ConnectButton';
import Switch from './ui/Switch';

export function App() {
  const { isConnected } = useAccount();
  const [airdropType, setAirdropType] = useState<AirdropTypeEnum>(AirdropType.ERC20);

  return (
    <div className={tw.h_screen}>
      <div className={tw.navbar.bg_base_100.p_4}>
        <div className={tw.navbar_start}>
          <h1 className={tw.text_4xl.text_secondary}>wentokens</h1>
        </div>
        <div className={tw.navbar_end.gap_x_2}>
          <ul className={tw.menu.menu_horizontal.px_1}>
            {isConnected && <Switch selected={airdropType} setSelected={setAirdropType} />}
          </ul>
          <ConnectButton />
        </div>
      </div>

      {!isConnected && (
        <div className={tw.hero.bg_base_200.min_h_[`80%`]}>
          <div className={tw.hero_content.text_center}>
            <div className={tw.max_w_md}>
              <h1 className={tw.text_5xl.font_bold.text_secondary}>wentokens</h1>
              <p className={tw.py_6}>The fastest airdrop tool in da wild west. Connect your wallet to get started.</p>
              <div className={tw.flex.flex_row.justify_center}>
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      )}

      {isConnected && (
        // add margin top to the container

        <div className={tw.mt_10}>
          <center>{airdropType === AirdropType.ERC20 ? <ERC20Provider /> : <ETHProvider />}</center>
        </div>
      )}
    </div>
  );
}
