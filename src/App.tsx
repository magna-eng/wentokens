import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import ERC20Provider from './containers/ERC20Provider';
import { AirdropType, AirdropTypeEnum } from './types/airdrop';
import Switch from './ui/Switch';

export function App() {
  const { isConnected } = useAccount();
  const [airdropType, setAirdropType] = useState<AirdropTypeEnum>(AirdropType.ERC20);

  return (
    <div>
      <div className="navbar bg-base-100">
        <div className="navbar-start p-2">
          <h1 className="text-4xl text-secondary">wentokens</h1>
        </div>
        <div className="navbar-end">
          <ul className="menu menu-horizontal px-1">
            {isConnected && <Switch selected={airdropType} setSelected={setAirdropType} />}
          </ul>
          <ConnectButton />
        </div>
      </div>

      {isConnected && (
        <center>
          <ERC20Provider />
        </center>
      )}
    </div>
  );
}
