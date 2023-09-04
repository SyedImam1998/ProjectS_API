const flights = 
[
    {
      "Flight_ID": "FL001",
      "Airline": "Airline A",
      "Origin": "JFK",
      "Destination": "LAX",
      "Departure_Date_Time": "2023-09-10 08:00 AM",
      "Arrival_Date_Time": "2023-09-10 12:00 PM",
      "Flight_Duration": "4 hours",
      "Seat_Availability": 150,
      "Price_At_Time": 510, 
      "Capture_Date": "2023-08-23",
      "Seat_Class": "Economy",
      "Direct_Flight": true
    },
    {
      "Flight_ID": "FL002",
      "Airline": "Airline B",
      "Origin": "LHR",
      "Destination": "JFK",
      "Departure_Date_Time": "2023-09-12 10:00 AM",
      "Arrival_Date_Time": "2023-09-12 03:00 PM",
      "Flight_Duration": "5 hours",
      "Seat_Availability": 120,
      "Price_At_Time": 580, 
      "Capture_Date": "2023-08-23",
      "Seat_Class": "Business",
      "Direct_Flight": true
    },
    {
      "Flight_ID": "FL003",
      "Airline": "Airline C",
      "Origin": "CDG",
      "Destination": "DXB",
      "Departure_Date_Time": "2023-09-13 06:00 AM",
      "Arrival_Date_Time": "2023-09-13 04:00 PM",
      "Flight_Duration": "10 hours",
      "Seat_Availability": 200,
      "Price_At_Time": 310, 
      "Capture_Date": "2023-08-23",
      "Seat_Class": "First Class",
      "Direct_Flight": false
    }
  ]
  

module.exports = {
  flights: flights,
};
