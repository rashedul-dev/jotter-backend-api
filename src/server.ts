import mongoose from "mongoose";
import app from "./app";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 5000;

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Database connected successfully");

    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();
