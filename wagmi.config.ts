import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";
import * as chains from "wagmi/chains";

export default defineConfig({
  out: "src/generated.ts",
  plugins: [
    foundry({
      deployments: {
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
