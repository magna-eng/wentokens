import { defineConfig } from '@wagmi/cli';
import { foundry, react } from '@wagmi/cli/plugins';
import * as chains from 'wagmi/chains';

export default defineConfig({
  out: 'src/generated.ts',
  plugins: [
    foundry({
      deployments: {
        Airdrop: {
          [chains.goerli.id]: '0xBE4E91D4b555874f0dFA9718D7d9331285a88C9e',
          [chains.sepolia.id]: '0xBE4E91D4b555874f0dFA9718D7d9331285a88C9e'
        },
      },
      artifacts: '/out', // TODO: comment this out when wagmi-cli bug is fixed
      project: './contracts',
    }),
    react(),
  ],
});
