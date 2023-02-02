import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";
import * as chains from "wagmi/chains";

export default defineConfig({
  out: "src/generated.ts",
  plugins: [
    foundry({
      deployments: {
        ERC20: {
          [chains.goerli.id]: "0x6292F13202e6d418136aa7d40e1BF85F3e394682",
        },
        Airdrop: {
          [chains.goerli.id]: "0x93c1313F006669130e37626BB85558a378703181",
        },
      },
      artifacts: "/out", // TODO: comment this out when wagmi-cli bug is fixed
      project: "./contracts",
    }),
    react(),
  ],
});
