const { ethers, AlchemyProvider } = require("ethers");
require("dotenv").config();

const contractAbi = require("../contractABI/GreenSwitchSoulboundToken.json");
const contractABI = contractAbi.abi;

function contractSetup(network) {
  let walletPrivateKey;
  let contractAddress;
  let providerUrl;
  let network_Alcehmy_key;
  
  switch (network) {
    case "sepolia":
      walletPrivateKey = process.env.SEPOLIA_WALLET_PRIVATE_KEY;
      contractAddress = "0x39Fb667AB3F80f47C4ab47912Ea315B9530B4375";
      providerUrl =
        "https://eth-sepolia.g.alchemy.com/v2/TFLw7ABpiZiNMwHmUifkiTJ5OCaT-BWx";
      network_Alcehmy_key = process.env.ALCHEMY_KEY;
      break;

    default:
      break;
  }

  const wallet = new ethers.Wallet(
    walletPrivateKey,
    new AlchemyProvider(network, network_Alcehmy_key)
  );
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);
  return contract;
}

module.exports = {
    contractSetup:contractSetup
};
