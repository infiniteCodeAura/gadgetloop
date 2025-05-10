import mongoose from "mongoose";
const username = process.env.uName;
const password = process.env.password;
const dbName = process.env.dbname;

export const connectDb = async () => {
  try {
    const connect = await mongoose.connect(
      `mongodb+srv://${username}:${password}@cluster0.kmhoabs.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`
    );
    console.log("Database connected. ");
  } catch (error) {
    console.log(error);
  }
};
