const { contractSetup } = require("../config/contractConfig");
const { supabase } = require("../config/supaBaseConfig");

async function mintSBT(req, res) {
  try {
    const contract = contractSetup(req.body.network);
    const transaction = await contract.safeMint(req.body.link_new_address);
    await transaction.wait();

    let { data: sepolia_accounts, error } = await supabase
      .from("User_Accounts")
      .select("sepolia_accounts")
      .eq("WC_address", req.body.WC_address);

    const { data, error2 } = await supabase
      .from("User_Accounts")
      .update({
        sepolia_accounts:
          sepolia_accounts[0].sepolia_accounts === null
            ? [req.body.link_new_address]
            : [
                ...sepolia_accounts[0].sepolia_accounts,
                req.body.link_new_address,
              ],
      }).eq("WC_address", req.body.WC_address)
      .select();

    res.status(200).json("NFT minted !!!");
  } catch (e) {
    console.log(e.reason);
    if (e.reason === "Already Have SBT") {
      res.status(400).json("Hey this address already have SBT !!!");
    } else {
      res.status(400).json("Something went wrong !!!");
    }
  }
}

module.exports = {
  mintSBT: mintSBT,
};
