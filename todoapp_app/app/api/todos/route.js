import connectToDatabase from "../../../lib/db";
import { NextResponse } from "next/server";
import { URL } from "url";
import { getDBConnection } from "../db";

async function updateTodoOrder(todoOrderCollection, status, order) {
  await todoOrderCollection.updateOne({ status }, { $set: { order } });
}

export async function GET(request) {
  const db = await getDBConnection();
  const todosCollection = db.collection("todos");
  const todoOrderCollection = db.collection("todo_order");

  const todos = await todosCollection.find({}).toArray();
  const todoOrder = await todoOrderCollection.find({}).toArray();
  const sortedTodos = [];

  for (const orderItem of todoOrder) {
    const orderedTodos = orderItem.order.map((id) =>
      todos.find((todo) => todo.id === id)
    );
    sortedTodos.push(...orderedTodos);
  }
  return NextResponse.json(sortedTodos, { status: 200 });
}

export async function POST(request) {
  async function createInitialTodoOrder(todoOrderCollection) {
    const initialStatusOrder = [
      { status: "Todo", order: [] },
      { status: "In Progress", order: [] },
      { status: "Done", order: [] },
    ];

    for (const statusOrder of initialStatusOrder) {
      const existingOrder = await todoOrderCollection.findOne({
        status: statusOrder.status,
      });
      if (!existingOrder) {
        await todoOrderCollection.insertOne(statusOrder);
      }
    }
  }
  const db = await getDBConnection();
  const todosCollection = db.collection("todos");
  const todoOrderCollection = db.collection("todo_order");

  const todosCount = await todosCollection.countDocuments();
  const todoOrder = await todoOrderCollection.find({}).toArray();
  console.log(todoOrder);
  if (todosCount === 0) {
    await createInitialTodoOrder(todoOrderCollection);
  }
  const newTodo = await request.json();

  const result = await todosCollection.insertOne(newTodo);

  return NextResponse.json(newTodo, { status: 201 });
}

export async function PUT(request) {
  const db = await getDBConnection();
  const todosCollection = db.collection("todos");

  const { id, _id, ...updatedTodo } = await request.json();
  await todosCollection.updateOne({ id }, { $set: updatedTodo });

  return NextResponse.json(updatedTodo, { status: 200 });
}

export async function DELETE(request, context) {
  try {
    const dbConnection = await connectToDatabase();
    const db = dbConnection.db;
    const todosCollection = db.collection("todos");
    const parsedUrl = new URL(request.url);
    const searchParams = parsedUrl.searchParams;
    const todoId = searchParams.get("todoId");

    await todosCollection.deleteOne({ id: todoId });
    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}


