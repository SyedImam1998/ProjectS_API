const { contractSetup } = require("../config/contractConfig");
const { supabase } = require("../config/supaBaseConfig");

async function mintSBT(address, req, res) {
  console.log("mintSBT function");
  try {
    // let { data: User_Accounts, error } = await supabase.from("User_Accounts").select(req.body.address);
    let { data: User_Accounts, error } = await supabase
      .from("User_Accounts")
      .select("*")
      .eq("WC_address", req.body.WC_address);

    console.log(User_Accounts);

    // const contract = contractSetup(req.body.network);
    // const transaction = await contract.safeMint(address);
    // await transaction.wait();

    // const { data, error2 } = await supabase
    //   .from("User_Accounts")
    //   .update({ other_column: "otherValue" })
    //   .eq("WC_address", address)
    //   .select();

    // console.log(`NFT minted successfully to address ${address}`);
    res.status(200).json("NFT minted !!!");
  } catch (e) {
    console.log(e);
    res.status(400).json("Something went wrong");
  }
}

module.exports = {
  mintSBT: mintSBT,
};
