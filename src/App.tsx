import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Account, ERC20, ETH, Connect, NetworkSwitcher } from './components';

export function App() {
  const { isConnected } = useAccount();
  const [selected, setSelected] = useState('ERC20');

  return (
    <>
      <div className="navbar bg-base-100">
        <div className="navbar-start">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost lg:hidden">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a>Airdrop ERC20</a>
              </li>
              <li>
                <a>Airdrop ETH</a>
              </li>
            </ul>
          </div>
          <a className="btn btn-secondary normal-case text-xl">wentokens</a>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            {isConnected && (
              <>
                <li>
                  <a onClick={() => setSelected('ERC20')}>Airdrop ERC20</a>
                </li>
                <li>
                  <a onClick={() => setSelected('ETH')}>Airdrop ETH</a>
                </li>
              </>
            )}
          </ul>
        </div>
        <div className="navbar-end">
          <a className="btn btn-secondary">Connect Wallet</a>
        </div>
      </div>
      <Connect />

      {isConnected && (
        <>
          <Account />
          <hr />
          <NetworkSwitcher />
          <hr />
          {selected === 'ERC20' ? <ERC20 /> : <ETH />}
        </>
      )}
    </>
  );
}
