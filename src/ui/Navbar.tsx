import { ConnectButton } from '@rainbow-me/rainbowkit';
import { tw } from 'typewind';
import { useNetwork } from 'wagmi';
import EtherscanLogo from '../assets/etherscan-logo.svg';
import { airdropAddress } from '../generated';

type ChainID = keyof typeof airdropAddress;

export default function Navbar() {
  const { chain } = useNetwork();
  const chainID = (chain?.id ?? 1) as ChainID;
  const chainName = chain?.name?.toLowerCase() ?? 'ethereum';
  const subdomain = !chain || chainName === 'ethereum' ? '' : `${chain.name}.`;
  const etherscanURL = `https://${subdomain}etherscan.io/address/${airdropAddress[chainID]}`;
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
        <div className={tw.mr_4}>
          <ConnectButton />
        </div>
        <div className={tw.mr_4}>
          <a href={etherscanURL} target="_blank" rel="noopener noreferrer">
            <img src={EtherscanLogo} alt="Etherscan Logo" className={tw.w_6.h_6} />
          </a>
        </div>
      </div>
    </div>
  );
}
