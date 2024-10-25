import mongoose from "mongoose";

export const dbConnect = async (mongoUrl, dbName) => {
  try {
    await mongoose.connect(`${mongoUrl}/${dbName}`);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};
