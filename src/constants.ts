enum NetsType {
  mainnet = "mainnet",
  devnet = "devnet",
  testnet = "testnet",
}

enum NetsUrl {
  mainnet = "https://fullnode.mainnet.sui.io",
  devnet = "https://fullnode.devnet.sui.io",
  testnet = "https://fullnode.testnet.sui.io",
}

interface Net {
  networkType: NetsType;
  fullnodeUrl: NetsUrl;
}

export const nets: Net[] = [
  {
    networkType: NetsType.mainnet,
    fullnodeUrl: NetsUrl.mainnet,
  },
  {
    networkType: NetsType.testnet,
    fullnodeUrl: NetsUrl.testnet,
  },
  {
    networkType: NetsType.devnet,
    fullnodeUrl: NetsUrl.devnet,
  },
];
