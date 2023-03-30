const BlockExplorers: any = {
  ETHEREUM: 'https://etherscan.io/address/',
  GOERLI: 'https://goerli.etherscan.io/address/',
  ARBITRUM_ONE: 'https://arbiscan.io/address/',
  ARBITRUM_GORELI: 'https://goerli.arbiscan.io/address/',
  POLYGON: 'https://polygonscan.com/address/',
  POLYGON_MUMBAI: 'https://mumbai.polygonscan.com/address/',
  AVALANCHE: 'https://snowtrace.io/address/',
  AVALANCHE_FUJI: 'https://testnet.snowtrace.io/address/',
  SEPOLIA: 'https://sepolia.etherscan.io/address/',
};

export const getBlockExplorer = (chainName: string) => {
  return BlockExplorers[chainName];
};
