const express = require("express");
const app = express();
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const pdf = require('pdf-parse');
const bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '10mb' }));

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json({ limit: '10mb' }));

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

app.post('/extract-details', async (req, res) => {
    const { pdfData } = req.body;
  
    try {
      const decodedPdfData = Buffer.from(pdfData, 'base64');
      const data = await pdf(decodedPdfData);
      const extractedDetails = extractDetails(data.text);
      res.json(extractedDetails);
    } catch (error) {
      console.error('Error extracting details:', error);
      res.status(500).json({ error: 'Error extracting details' });
    }
  });

  function extractDetails(text) {
     // Use regular expressions or custom logic to extract the necessary details
  const pnrPattern = /PNR: (\w+)/;
  const pnrMatch = text.match(pnrPattern);

  if (pnrMatch) {
    const pnr = pnrMatch[1];
    // Extract other details similarly
    return { pnr };
  } else {
    return { error: 'PNR not found' };
  }
  }

app.get("/", (req, res) => {
  res.send("Imam");
});
app.listen("3500", () => {
  console.log("server running at port 3500");
});
