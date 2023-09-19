const { contractSetup } = require("../config/contractConfig");
const { supabase } = require("../config/supaBaseConfig");

async function mintSBT(req, res) {
  try {
    let { data: User_Accounts, error } = await supabase
      .from("User_Accounts")
      .select("*")
      .eq("WC_address", req.body.WC_address);

    if (User_Accounts.length > 0) {
      if (User_Accounts[0].linked_address === null) {
        console.log("updating supabase");
        const { data, error2 } = await supabase
          .from("User_Accounts")
          .update({ linked_address: req.body.link_new_address })
          .eq("WC_address", req.body.WC_address)
          .select();
        const contract = contractSetup(req.body.network);
        const transaction = await contract.safeMint(req.body.link_new_address);
        await transaction.wait();
        res.status(200).json("NFT minted !!!");
      } else {
        let linked_address_array = User_Accounts[0].linked_address.split(",");
        console.log(linked_address_array);
        let checkAddress = linked_address_array.find(
          (addr) => addr === req.body.link_new_address
        );
        if (checkAddress) {
          res.json("Already Linked !!!");
        } else {
          const contract = contractSetup(req.body.network);
          const transaction = await contract.safeMint(address);
          await transaction.wait();

          linked_address_array.push(req.body.link_new_address);
          console.log(linked_address_array);
          const { data, error2 } = await supabase
            .from("User_Accounts")
            .update({ linked_address: linked_address_array.toString() })
            .eq("WC_address", req.body.WC_address)
            .select();
            res.status(200).json("NFT minted !!!");
        }
      }
    } else {
      res.json("Sorry No Account Details Found.").status(404);
    }
   
  } catch (e) {
    console.log(e);
    res.status(400).json("Something went wrong");
  }
}

module.exports = {
  mintSBT: mintSBT,
};
