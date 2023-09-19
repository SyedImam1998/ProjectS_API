const { contractSetup } = require("../config/contractConfig");
const { supabase } = require("../config/supaBaseConfig");

async function burnSBT(req, res) {
  try {
    const contract = contractSetup(req.body.network);
    const tokenId = await contract.gettokenIdByAddress(
      req.body.link_new_address
    );
    console.log("token Id", tokenId);
    if (Number(tokenId) === 0) {
      throw new Error("Sorry this address has no SBT !!!");
    }
    const transaction = await contract.burn(tokenId);
    await transaction.wait();

    let { data: sepolia_accounts, error } = await supabase
      .from("User_Accounts")
      .select("sepolia_accounts")
      .eq("WC_address", req.body.WC_address);
    console.log("sepo", sepolia_accounts);
    const newArray = sepolia_accounts[0].sepolia_accounts.filter(
      (item) => item !== req.body.link_new_address
    );
    const { data, error2 } = await supabase
      .from("User_Accounts")
      .update({
        sepolia_accounts: newArray.length === 0 ? null : newArray,
      })
      .eq("WC_address", req.body.WC_address)
      .select();

    res.status(200).json("Burn SuccessFull !!!");
  } catch (error) {
    console.log(error.message);
    if (error.message === "Sorry this address has no SBT !!!") {
      res.status(400).json(error.message);
    }
    res.status(400).json("Something went wrong !!!");
  }
}

module.exports = {
  burnSBT: burnSBT,
};
