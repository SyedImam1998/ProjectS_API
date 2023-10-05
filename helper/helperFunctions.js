const { supabase } = require("../config/supaBaseConfig");

async function saveToSupabase(tableName, uploaddData) {
  const { data, error } = await supabase
    .from(tableName) // Adjust the table name as needed
    .insert(uploaddData); // Keep [uploaddData] when you are send non array data or just uploaddData

  console.log("data", data);

  if (error) {
    console.error("Error saving data to Supabase:", error);
    throw new Error("Something went wrong while saving");
    // return { success: false, error };
  }

  return { success: true, data };
}

function extractDetails(text) {
  // Use regular expressions or string manipulation to extract the details
  const Booking_ID = /Booking ID: (.+)/.exec(text)?.[1];
  const Passenger_Wallet_Address = /Passenger Wallet Address: (.+)/.exec(
    text
  )?.[1];
  const Flight_ID = /Flight ID: (.+)/.exec(text)?.[1];
  const Airline = /Airline: (.+)/.exec(text)?.[1];
  const Origin = /Origin: (.+)/.exec(text)?.[1];
  const Destination = /Destination: (.+)/.exec(text)?.[1];
  const Departure_Date_Time = /Departure Date & Time: (.+)/.exec(text)?.[1];
  const Arrival_Date_Time = /Arrival Date & Time: (.+)/.exec(text)?.[1];
  const Seat_Class = /Seat Class: (.+)/.exec(text)?.[1];
  const Number_of_Seats = /Number of Seats: (.+)/.exec(text)?.[1];
  const Total_Price = /Total Price: (.+)/.exec(text)?.[1];
  const Payment_Status = /Payment Status: (.+)/.exec(text)?.[1];
  const Booking_Status = /Booking Status: (.+)/.exec(text)?.[1];
  const Booking_Date = /Booking Date: (.+)/.exec(text)?.[1];
  const Passenger_Custom_ID_1 = /Passenger Custom ID 1: (.+)/.exec(text)?.[1];
  const Emission_per_Passenger = /Emission per Passenger: (.+)/.exec(text)?.[1];
  const Total_Emission = /Total Emission: (.+)/.exec(text)?.[1];

  return {
    Booking_ID,
    Passenger_Wallet_Address,
    Flight_ID,
    Airline,
    Origin,
    Destination,
    Departure_Date_Time,
    Arrival_Date_Time,
    Seat_Class,
    Number_of_Seats,
    Total_Price,
    Payment_Status,
    Booking_Status,
    Booking_Date,
    Passenger_Custom_ID_1,
    Emission_per_Passenger,
    Total_Emission,
  };
}

// To Fetch Data from Flight_Price_Changes Table
async function fetch_Flights_from_DB() {
  const flightsDB = await supabase
    .from("Flight_Price_Changes")
    .select(
      "Flight_ID,Airline,Origin,Destination,Departure_Date_Time,Price_At_Time"
    );
  return flightsDB.data;
}

async function upsertSupbase(tableName, uploadData) {
  const { data, error } = await supabase
    .from("Flight_Average_Price")
    .upsert(uploadData, { onConflict: ["Flight_ID"] })
    .select();

  if (error) {
    console.error("Error saving data to Supabase:", error);
    throw new Error("Something went wrong while saving");
    // return { success: false, error };
  }
}

function copyProperties_from_one_to_another_Array(
  sourceArray,
  destinationArray,
  propertiesToCopy
) {
  const finalResult = destinationArray.map((destObj) => {
    const sourceObj = sourceArray.find(
      (srcObj) => srcObj.Flight_ID === destObj.Flight_ID
    );
    if (sourceObj) {
      const updatedProps = propertiesToCopy.reduce((props, prop) => {
        props[prop] = sourceObj[prop];
        return props;
      }, {});
      return { ...destObj, ...updatedProps };
    }
    return destObj;
  });
  return finalResult;
}

function flight_Price_Average_Calculator(flightsDB) {
  const flightPriceSumMap = new Map();
  const flightCountMap = new Map();

  flightsDB.forEach((flight) => {
    const { Flight_ID, Price_At_Time } = flight;

    if (!flightPriceSumMap.has(Flight_ID)) {
      flightPriceSumMap.set(Flight_ID, 0);
      flightCountMap.set(Flight_ID, 0);
    }

    flightPriceSumMap.set(
      Flight_ID,
      parseInt(flightPriceSumMap.get(Flight_ID)) + parseInt(Price_At_Time)
    );
    flightCountMap.set(Flight_ID, parseInt(flightCountMap.get(Flight_ID)) + 1);
  });
  const averagePrices = [];

  flightPriceSumMap.forEach((totalPrice, Flight_ID) => {
    const count = flightCountMap.get(Flight_ID);
    const averagePrice = totalPrice / count;

    const formattedAveragePrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(averagePrice);

    averagePrices.push({ Flight_ID, Average_Price: formattedAveragePrice });
  });
  console.log("Avg Price", averagePrices);

  return averagePrices;
}

function modifyExistingPropertyName(arrayOfObjects, current, updateTo) {
  const updatedArrayOfObjects = arrayOfObjects.map((obj) => {
    const { [current]: currentProp, ...rest } = obj;
    return { [updateTo]: currentProp, ...rest };
  });
  return updatedArrayOfObjects;
}

function calculateDateTillDepature(flights) {
  const today = new Date();
  const flightInfoWithAverages = flights.map((flight) => {
    const {
      Flight_ID,
      Airline,
      Origin,
      Destination,
      Departure_Date_Time,
      Average_Price,
    } = flight;
    const departureDate = new Date(Departure_Date_Time);
    const daysTillDeparture = Math.floor(
      (departureDate - today) / (1000 * 60 * 60 * 24)
    );
    return {
      Flight_ID,
      Airline,
      Origin,
      Destination,
      Date: Departure_Date_Time,
      Average_Price,
      Days_Till_Departure: daysTillDeparture,
    };
  });
  return flightInfoWithAverages;
}

async function addUser(req, res) {
  try {
    const { data, error } = await supabase
      .from("User_Accounts")
      .select("*")
      .eq("WC_address", req.body.worldId);

    console.log(data);
    if (error) {
      throw new Error("Supabase Errro");
    }

    if (data && data.length === 0) {
      const { data: insertData, error: insertError } = await supabase
        .from("User_Accounts")
        .insert([
          {
            WC_address: req.body.worldId,
            // Add other columns and values as needed
          },
        ]);

      if (insertError) {
        throw new Error("Error while saving user address");
      }
      res.status(200).json("User Address Saved");
    } else {
      // throw new Error("Address Already present");
      res.status(200).json("Address Already present")
    }
  } catch (e) {
    throw e;
  }
}
module.exports = {
  saveToSupabase: saveToSupabase,
  extractDetails: extractDetails,
  fetch_Flights_from_DB: fetch_Flights_from_DB,
  upsertSupbase: upsertSupbase,
  copyProperties_from_one_to_another_Array:
    copyProperties_from_one_to_another_Array,
  flight_Price_Average_Calculator: flight_Price_Average_Calculator,
  modifyExistingPropertyName: modifyExistingPropertyName,
  calculateDateTillDepature: calculateDateTillDepature,
  addUser: addUser,
};
