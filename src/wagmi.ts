import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createClient } from 'wagmi';
import {
  foundry,
  goerli,
  sepolia,
  mainnet,
  arbitrum,
  arbitrumGoerli,
  avalanche,
  avalancheFuji,
  polygon,
  polygonMumbai,
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const { chains, provider, webSocketProvider } = configureChains(
  [
    sepolia,
    mainnet,
    goerli,
    arbitrum,
    arbitrumGoerli,
    avalanche,
    avalancheFuji,
    polygon,
    polygonMumbai,
    ...(import.meta.env?.MODE === 'development' ? [goerli, foundry] : []),
  ],
  [publicProvider()],
);

const { connectors } = getDefaultWallets({
  appName: 'wentokens',
  chains,
});

export const client = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

export { chains };
