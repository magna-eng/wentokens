import { useState } from 'react';
import { tw } from 'typewind';
import { useAccount } from 'wagmi';
import { Toaster, toast } from 'sonner'
import ERC20Provider from './containers/ERC20Provider';
import ETHProvider from './containers/ETHProvider';
import { AirdropType, AirdropTypeEnum } from './types/airdrop';
import ConnectButton from './ui/ConnectButton';
import Navbar from './ui/Navbar';
import Footer from './ui/Footer';

export function App() {
  const { isConnected } = useAccount();
  const [airdropType, setAirdropType] = useState<AirdropTypeEnum>(AirdropType.ERC20);

  return (
    <div className={tw.h_screen.bg_transparent}>
      <Toaster theme="dark"/>
      <Navbar />

      {!isConnected && (
        <div className={tw.hero.bg_transparent.min_h_["80%"]}>
          <div className={tw.hero_content.text_center}>
            <div className={tw.max_w_md}>
              <h1 className={tw.text_7xl.text_transparent.bg_clip_text.bg_gradient_to_r.from_primary.to_base_100}>wentokens</h1>
              <p className={tw.py_6.text_neutral_400}>The fastest airdrop tool in da wild west. Connect your wallet to get started.</p>
              <div className={tw.flex.flex_row.justify_center}>
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      )}

      {isConnected && (
        <div className={tw.m_10}>
          <center>{airdropType === AirdropType.ERC20 ? <ERC20Provider selected={airdropType} setSelected={setAirdropType} /> : <ETHProvider selected={airdropType} setSelected={setAirdropType} />}</center>
        </div>
      )}

      <Footer />
    </div>
  );
}
