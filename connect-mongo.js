const mongoose = require("mongoose");

// Connection URI
const uri = "mongodb://localhost:27017/room-booking-system";

// Connect to MongoDB
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Successfully connected to MongoDB");

    // Display available collections
    mongoose.connection.db
      .listCollections()
      .toArray()
      .then((collections) => {
        console.log("Available collections:");
        collections.forEach((collection) =>
          console.log(`- ${collection.name}`)
        );

        // Close the connection
        console.log("Closing connection...");
        mongoose.connection.close();
      });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
