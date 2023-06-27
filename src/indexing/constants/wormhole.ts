interface OfficialCoinsMap {
  [key: string]: string;
}

//https://docs.sui.io/learn/sui-bridging
export const SUI_OFFICIAL_COINS: OfficialCoinsMap = {
  "0xa198f3be41cda8c07b3bf3fee02263526e535d682499806979a111e88a5a8d0f": "CELO",
  "0x027792d9fed7f9844eb4839566001bb6f6cb4804f66aa2da6fe1ee242d896881": "WBTC",
  "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf": "USDC",
  "0xe32d3ebafa42e6011b87ef1087bbc6053b499bf6f095807b9013aff5a6ecd7bb":
    "USDCarb",
  "0x909cba62ce96d54de25bec9502de5ca7b4f28901747bbf96b76c2e63ec5f1cba":
    "USDCbnb",
  "0xcf72ec52c0f8ddead746252481fb44ff6e8485a39b803825bde6b00d77cdb0bb":
    "USDCpol",
  "0xb231fcda8bbddb31f2ef02e6161444aec64a514e2c89279584ac9806ce9cf037":
    "USDCsol",
  "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c": "USDT",
  "0x1e8b532cca6569cab9f9b9ebc73f8c13885012ade714729aa3b450e0339ac766": "WAVAX",
  "0xb848cce11ef3a8f62eccea6eb5b35a12c4c2b1ee1af7755d02d7bd6218e8226f": "WBNB",
  "0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5": "WETH",
  "0x6081300950a4f1e2081580e919c210436a1bed49080502834950d31ee55a2396": "WFTM",
  "0x66f87084e49c38f76502d17f87d17f943f183bb94117561eb573e075fdc5ff75": "WGLMR",
  "0xdbe380b13a6d0f5cdedd58de8f04625263f113b3f9db32b3e1983f49e2841676":
    "WMATIC",
  "0xb7844e289a8410e50fb3ca48d69eb9cf29e27d223ef90353fe1bd8e27ff8f3f8": "WSOL",
  "0x2": "SUI",
};

interface ChainMap {
  [key: number]: string;
}

export const WH_CHAIN_MAP: ChainMap = {
  1: "Solana",
  2: "Ethereum",
  3: "Terra_Classic",
  4: "Binace_Smart_Chain",
  5: "Polygon",
  6: "Avalanche",
  7: "Oasis",
  8: "Algorand",
  9: "Aurora",
  10: "Fantom",
  11: "Karura",
  12: "Acala",
  13: "Klaytn",
  14: "Celo",
  15: "NEAR",
  16: "Moonbeam",
  18: "Terra",
  19: "Injective",
  21: "Sui",
  22: "Aptos",
  23: "Arbitrum",
  24: "Optimism",
  28: "XLPA",
};
