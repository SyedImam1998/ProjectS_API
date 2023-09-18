const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const pdf = require("pdf-parse");
const axios = require("axios");
const bodyParser = require("body-parser");
const {
  extractDetails,
  saveToSupabase,
  fetch_Flights_from_DB,
  flight_Price_Average_Calculator,
  copyProperties_from_one_to_another_Array,
  upsertSupbase,
  calculateDateTillDepature,
} = require("./helper/helperFunctions");
const { flights } = require("./dataSet/sampleData");
const { stat } = require("fs");
const { mintSBT } = require("./Components/mintComponent");

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
app.post("/upload-and-save-Flight-price-changes", async (req, res) => {
  const data = req.body;

  try {
    // Save extracted details to Supabase
    const result = await saveToSupabase("Flight_Price_Changes", data);
    res.json({ message: "Data saved to Supabase", result });
  } catch (error) {
    console.error("Error processing PDF and saving data:", error);
    res.status(400).json({ error: error });
  }
});
app.post("/upload-and-save-Investor-pool", async (req, res) => {
  const data = req.body;

  try {
    // Save extracted details to Supabase
    const result = await saveToSupabase("Investor_Pool", data);
    res.json({ message: "Data saved to Supabase", result });
  } catch (error) {
    console.error("Error processing PDF and saving data:", error);
    res.status(400).json({ error: error });
  }
});
app.post("/upload-and-save-Flight-Average-price", async (req, res) => {
  const data = req.body;

  try {
    // Save extracted details to Supabase
    const result = await saveToSupabase(
      "Flight_Average_Price",
      data,
      "Flight_ID"
    );
    res.json({ message: "Data saved to Supabase", result });
  } catch (error) {
    console.error("Error processing PDF and saving data:", error);
    res.status(400).json({ error: error });
  }
});

// **************** Duffle Data API  **************
app.get("/duffle-Flight-Data", (req, res) => {
  res.json(flights).status(200);
});

// ********* Job to pull data from Duffle and put in Supbase *********

app.post("/insert-duffle-data-to-supabase", async (req, res) => {
  try {
    const resposne = await axios.get(
      "http://localhost:3500/duffle-Flight-Data"
    );
    const result = await saveToSupabase("Flight_Price_Changes", resposne.data);
    res.json("Duffle Data Sent to Supbase DB").status(200);
  } catch (e) {
    console.log("Error", e);
    res.json("Went wrong while pushing duffle data to Supbase").status(400);
  }
});

app.post("/insert-flight-avgerage-price", async (req, res) => {
  try {
    const flightsDB = await fetch_Flights_from_DB();

    const averagePriceEachFlight = flight_Price_Average_Calculator(flightsDB);

    const propertiesToCopy = [
      "Flight_ID",
      "Airline",
      "Origin",
      "Destination",
      "Departure_Date_Time",
    ];
    const modifiedArray = copyProperties_from_one_to_another_Array(
      flightsDB,
      averagePriceEachFlight,
      propertiesToCopy
    );

    const finalArray = calculateDateTillDepature(modifiedArray);
    console.log("finalArray", finalArray);

    const saveToSupabase = await upsertSupbase(
      "Flight_Average_Price",
      finalArray
    );
    res.json("Average Of Each Flight Saved on SupaBase").status(200);
  } catch (e) {
    console.log("Error:", e);
    res.json(e).status(400);
  }
});

app.post("/insert-PoolsContract_From_Destination_Tracker", async (req, res) => {
  try {
    const data = req.body;
    const saveDB = await saveToSupabase(
      "PoolsContract_From_Destination_Tracker",
      [data]
    );
    if (saveDB.success) {
      res.json("Saved on Supabase");
    }
  } catch (e) {
    res.json("some things went wrong");
  }
});

app.get("/", (req, res) => {
  res.send("Imam");
});

app.post("/mintSBT", (req, res) => {
  mintSBT(req.body.address, req, res);
});
app.listen("3500", () => {
  console.log("server running at port 3500");
});
