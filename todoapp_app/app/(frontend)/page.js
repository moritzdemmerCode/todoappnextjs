"use client";
import React, { useEffect, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import useTodoColumns from "../../hooks/useTodoColumns";
import AddTodoForm from "../components/AddTodoForm";
import TodoList from "../components/TodoList";
import Header from "../components/Header";
import EditTodoForm from "@/app/components/EditTodoForm";

const initialColumns = {
  Todo: [],
  "In Progress": [],
  Done: [],
};

const Home = () => {
  const [todos, setTodos] = useState([]);
  const [isAddTodoFormOpen, setIsAddTodoFormOpen] = useState(false);
  const [isEditTodoFormOpen, setIsEditTodoFormOpen] = useState(false);
  const [todoBeingEdited, setTodoBeingEdited] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const {
    columns,
    addTodoToColumn,
    removeTodoFromColumn,
    moveTodoWithinColumn,
    moveTodoToAnotherColumn,
  } = useTodoColumns(initialColumns);

  useEffect(() => {
    const fetchTodos = async () => {
      const response = await fetch("/api/todos", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      console.log(result);
      result.forEach((todo) => {
        addTodoToColumn(todo.id, todo.status);
      });
      setTodos(result);
    };

    fetchTodos();
  }, []);

  useEffect(() => {
    if (todos.length > 0) {
      updateTodoOrderInDatabase(columns);
    }
  }, [columns]);

  const handlePriorityChange = async (todoId, newPriority) => {
    const todoToChange = todos.find((todo) => todo.id === todoId);
    const updatedTodo = { ...todoToChange, priority: newPriority };
    await handleEditTodo(updatedTodo);
  };

  const updateTodoOrderInDatabase = async (columns) => {
    const response = await fetch("/api/todoOrder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columns }),
    });
    if (!response.ok) {
      console.error("Etwas ging beim Speichern des Todos schief!");
    }
  };
  const handleBeginEditingTodo = (todo) => {
    setIsEditTodoFormOpen(true);
    setTodoBeingEdited(todo);
  };

  const handleEditTodo = async (updatedTodo) => {
    await fetch("/api/todos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTodo),
    });
    setTodos((prevTodos) =>
      prevTodos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
    );
    setSnackbarMessage("Todo wurde erfolgreich aktualisiert.");

    setTimeout(() => {
      setSnackbarMessage("");
    }, 3000);
  };
  const updateTodoStatusAndOrder = async (todoId, newStatus) => {
    const updatedTodo = {
      ...todos.find((todo) => todo.id === todoId),
      status: newStatus,
    };
    await fetch("/api/todos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTodo),
    });
    setTodos((prevTodos) =>
      prevTodos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
    );
  };

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;

    const sourceColumnId = result.source.droppableId.replace("droppable-", "");
    const destinationColumnId = result.destination.droppableId.replace(
      "droppable-",
      ""
    );

    if (sourceColumnId === destinationColumnId) {
      moveTodoWithinColumn(
        result.draggableId,
        sourceColumnId,
        result.destination.index
      );
      await updateTodoStatusAndOrder(
        result.draggableId,
        sourceColumnId,
        result.destination.index
      );
    } else {
      moveTodoToAnotherColumn(
        result.draggableId,
        sourceColumnId,
        destinationColumnId,
        result.destination.index
      );
      setTodos((prevTodos) => {
        const updatedTodos = [...prevTodos];
        const todoIndex = updatedTodos.findIndex(
          (todo) => todo.id === result.draggableId
        );
        if (todoIndex > -1) {
          updatedTodos[todoIndex].status = destinationColumnId;
        }
        return updatedTodos;
      });
      await updateTodoStatusAndOrder(
        result.draggableId,
        destinationColumnId,
        result.destination.index
      );
    }
  };

  const handleRemoveTodo = async (todoId, columnId) => {
    await fetch(`/api/todos?todoId=${todoId}`, {
      method: "DELETE",
    });
    removeTodoFromColumn(todoId, columnId);
    setSnackbarMessage("Todo wurde erfolgreich entfernt.");

    setTimeout(() => {
      setSnackbarMessage("");
    }, 3000);
  };

  const handleAddTodo = async (newTodo) => {
    const response = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    });
    const createdTodo = await response.json();
    setTodos([...todos, createdTodo]);
    addTodoToColumn(createdTodo.id, "Todo");
    setSnackbarMessage("Todo wurde erfolgreich hinzugefügt.");

    setTimeout(() => {
      setSnackbarMessage("");
    }, 3000);
  };

  return (
      <div className="bg-gray-100 min-h-screen">
        <Header />
        <button
            onClick={() => setIsAddTodoFormOpen(true)}
            className="hover:bg-blue-700 fixed right-4 bottom-4 sm:right-8 sm:bottom-8 bg-blue-500 text-white p-5 rounded-full shadow-lg z-10"
        >
          +
        </button>
      {isAddTodoFormOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div className='absolute inset-0 bg-black bg-opacity-50'></div>
          <div className='relative bg-white rounded p-4 shadow-xl'>
            <AddTodoForm
              onAddTodo={handleAddTodo}
              onClose={() => setIsAddTodoFormOpen(false)}
            />
          </div>
        </div>
      )}
      {isEditTodoFormOpen && todoBeingEdited && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div className='absolute inset-0 bg-black bg-opacity-50'></div>
          <div className='relative bg-white rounded p-4 shadow-xl'>
            <EditTodoForm
              todo={todoBeingEdited}
              onEditTodo={handleEditTodo}
              onClose={() => setIsEditTodoFormOpen(false)}
            />
          </div>
        </div>
      )}
      {snackbarMessage && (
        <div
          className='fixed bottom-4 left-4 right-4 md:left-auto md:right-4 bg-green-500 text-white py-2 px-4 rounded shadow-md transition-opacity duration-300 z-10'
          style={{ opacity: snackbarMessage ? "1" : "0" }}
        >
          {snackbarMessage}
        </div>
      )}
        <div className="container mx-auto px-4 py-4">
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              {Object.keys(columns).map((columnId) => (
                  <TodoList
                      key={columnId}
                      todos={columns[columnId].map((todoId) =>
                          todos.find((todo) => todo.id === todoId)
                      )}
                      status={columnId}
                      removeTodo={handleRemoveTodo}
                      onEditTodo={handleBeginEditingTodo}
                      onPriorityChange={handlePriorityChange}
                  />
              ))}
            </div>
          </DragDropContext>
        </div>
    </div>
  );
};

export default Home;
