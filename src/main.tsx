import * as React from 'react';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import * as ReactDOM from 'react-dom/client';
import { WagmiConfig } from 'wagmi';
import { App } from './App';
import { client, chains } from './wagmi';

import '@rainbow-me/rainbowkit/styles.css';
import './index.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiConfig client={client}>
      <RainbowKitProvider chains={chains} theme={darkTheme()}>
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>,
);
