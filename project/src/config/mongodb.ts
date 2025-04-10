import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = import.meta.env.VITE_MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db("parentalControl");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export const collections = {
  users: "users",
  devices: "devices",
  screenTime: "screenTime",
  locations: "locations"
};