import connectToDatabase from "../../lib/db";

let dbConnection;

export async function getDBConnection() {
  if (!dbConnection) {
    dbConnection = await connectToDatabase();
  }
  return dbConnection.db;
}
