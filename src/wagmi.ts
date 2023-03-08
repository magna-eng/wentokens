import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createClient } from 'wagmi';
import { foundry, goerli, sepolia, mainnet, arbitrum, arbitrumGoerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

const { chains, provider, webSocketProvider } = configureChains(
  [sepolia, mainnet, goerli, arbitrum, arbitrumGoerli, ...(import.meta.env?.MODE === 'development' ? [goerli, foundry] : [])],
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
