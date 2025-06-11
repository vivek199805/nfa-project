import { Account, Client, Databases  } from "appwrite";
import dotenv from "dotenv";
dotenv.config();
const endpoint = process.env.APPWRITE_URL;

if (!endpoint) {
  throw new Error("Appwrite endpoint is not defined.");
}
const client = new Client()
  .setEndpoint(process.env.APPWRITE_URL) // e.g., 'https://cloud.appwrite.io/v1'
  .setProject(process.env.APPWRITE_PROJECT_ID);

  const databases = new Databases(client);

    const account = new Account(client);

  export { databases, account };


