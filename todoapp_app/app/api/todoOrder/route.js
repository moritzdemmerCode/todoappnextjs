import { NextResponse } from "next/server";
import { getDBConnection } from "../db";
export async function POST(request) {
  try {
    const db = await getDBConnection();
    const todoOrderCollection = db.collection("todo_order");
    const collection = await todoOrderCollection.find({}).toArray();

    const { columns } = await request.json();

    const columnPromises = Object.keys(columns).map(async (status) => {
      console.log(status, columns[status]);
      const updated = await todoOrderCollection.updateOne(
        { status },
        { $set: { order: columns[status] } }
      );
    });

    console.log("Adding");

    await Promise.all(columnPromises);


    return NextResponse.json(null, {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      {
        status: 500,
      }
    );
  }
}

