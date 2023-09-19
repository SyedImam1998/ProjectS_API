const { contractSetup } = require("../config/contractConfig");
const { supabase } = require("../config/supaBaseConfig");

async function burnSBT(req, res) {
  try {
    let { data: User_Accounts, error } = await supabase
      .from("User_Accounts")
      .select("*")
      .eq("WC_address", req.body.WC_address);

    let linked_address_array = User_Accounts[0].linked_address.split(",");
    let checkAddress = linked_address_array.find(
      (addr) => addr === req.body.link_new_address
    );

    if (checkAddress) {
      const newArray = linked_address_array.filter(
        (item) => item !== req.body.linked_address
      );
      const { data, error2 } = await supabase
        .from("User_Accounts")
        .update({ linked_address: newArray.toString() })
        .eq("WC_address", req.body.WC_address)
        .select();
      const contract = contractSetup(req.body.network);
      const transaction = await contract.burn(req.body.link_new_address);
      await transaction.wait();
    }else{
    res.json("Sorry Address Not Found");

    }
  } catch (error) {
    console.log(error)
    res.json("Something went wrong !!!").status(400);
  }
}

module.exports = {
  burnSBT: burnSBT,
};
