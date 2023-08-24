const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const pdf = require("pdf-parse");
const bodyParser = require("body-parser");
const { createClient } = require("@supabase/supabase-js");
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =process.env.SUPABASE_ANON;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "10mb" }));

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json({ limit: "10mb" }));

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "uploads/");
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    console.log("uniqueSuffix", uniqueSuffix);
    callback(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("pdfFile"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file provided" });
  }
  // Here you can perform any processing or save the file's information to a database
  res.json({ message: "File uploaded successfully" });
});

app.post("/extract-details", async (req, res) => {
  const { pdfData } = req.body;

  try {
    const decodedPdfData = Buffer.from(pdfData, "base64");
    const data = await pdf(decodedPdfData);
    const extractedDetails = extractDetails(data.text);
    res.json(extractedDetails);
  } catch (error) {
    console.error("Error extracting details:", error);
    res.status(500).json({ error: "Error extracting details" });
  }
});

app.post("/upload-and-save-booking-details", async (req, res) => {
  const { pdfData } = req.body;

  try {
    const decodedPdfData = Buffer.from(pdfData, "base64");
    const data = await pdf(decodedPdfData);
    const extractedDetails = extractDetails(data.text);

    // Save extracted details to Supabase
    const result = await saveToSupabase(
      "Booking_Details",
      extractedDetails,
      "Booking_ID"
    );
    res.json({ message: "Data saved to Supabase", result });
  } catch (error) {
    console.error("Error processing PDF and saving data:", error);
    res.status(400).json({ error: error });
  }
});
app.post("/upload-and-save-Flight-changes", async (req, res) => {
  const data = req.body;

  try {
    // Save extracted details to Supabase
    const result = await saveToSupabase(
      "Flight_Price_Changes",
      data,
      "Price_Change_ID"
    );
    res.json({ message: "Data saved to Supabase", result });
  } catch (error) {
    console.error("Error processing PDF and saving data:", error);
    res.status(400).json({ error: error });
  }
});

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

async function saveToSupabase(tableName, uploaddData, PK) {
  const { data, error } = await supabase
    .from(tableName) // Adjust the table name as needed
    .upsert([uploaddData], { onConflict: [PK] }); // Upsert data using bookingId as the conflict key

  console.log("data", data);

  if (error) {
    console.error("Error saving data to Supabase:", error);
    throw new Error("Something went wrong while saving");
    // return { success: false, error };
  }

  return { success: true, data };
}

app.get("/", (req, res) => {
  res.send("Imam");
});
app.listen("3500", () => {
  console.log("server running at port 3500");
});
