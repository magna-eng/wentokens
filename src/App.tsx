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
    <div className="h-screen">
      <div className="navbar bg-base-100 p-4">
        <div className="navbar-start">
          <h1 className="text-4xl text-secondary">wentokens</h1>
        </div>
        <div className="navbar-end gap-x-2">
          <ul className="menu menu-horizontal px-1">
            {isConnected && <Switch selected={airdropType} setSelected={setAirdropType} />}
          </ul>
          <ConnectButton />
        </div>
      </div>

      {!isConnected && (
        <div className="hero bg-base-200 min-h-[80%]">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold text-secondary">wentokens</h1>
              <p className="py-6">The fastest airdrop tool in da wild west. Connect your wallet to get started.</p>
              <div className={tw.flex.flex_row.justify_center}>
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      )}

      {isConnected && (
        // MOVE CENTER STYLES INTO PROVIDER
        <center>{airdropType === AirdropType.ERC20 ? <ERC20Provider /> : <ETHProvider />}</center>
      )}
    </div>
  );
}
