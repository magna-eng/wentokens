import { defineConfig } from '@wagmi/cli';
import { foundry, react } from '@wagmi/cli/plugins';
import * as chains from 'wagmi/chains';

export default defineConfig({
  out: 'src/generated.ts',
  plugins: [
    foundry({
      deployments: {
        Airdrop: {
          [chains.mainnet.id]: '0x2c952eE289BbDB3aEbA329a4c41AE4C836bcc231',
          [chains.goerli.id]: '0x2c952eE289BbDB3aEbA329a4c41AE4C836bcc231',
          [chains.sepolia.id]: '0x2c952eE289BbDB3aEbA329a4c41AE4C836bcc231',
        },
      },
      artifacts: '/out', // TODO: comment this out when wagmi-cli bug is fixed
      project: './contracts',
    }),
    react(),
  ],
});
