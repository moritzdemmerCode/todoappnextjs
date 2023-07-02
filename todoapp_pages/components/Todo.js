import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

const Todo = ({
                  todo,
                  provided,
                  removeTodo,
                  onEditTodo,
                  onPriorityChange,
              }) => {
    const handlePriorityChange = (newPriority) => {
        onPriorityChange(todo.id, newPriority);
    };

    const renderStars = () => {
        return (
            <div className="flex">
                {[1, 2, 3].map((value) => (
                    <button
                        key={value}
                        onClick={() => handlePriorityChange(value)}
                        className="text-yellow-400 hover:text-yellow-600"
                    >
                        <FontAwesomeIcon
                            icon={todo.priority >= value ? solidStar : regularStar}
                        />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            onDoubleClick={() => onEditTodo(todo)}
            className="bg-gray-100 p-4 my-2 rounded-lg shadow-md text-gray-800 relative hover:bg-gray-200 transition-colors duration-200 border border-gray-300"
        >
            <button
                onClick={() => removeTodo(todo.id, todo.status)}
                className="absolute right-1 top-1 bg-white p-1 rounded-xl text-gray-500 shadow-lg hover:text-gray-800 transition-colors duration-200"
            >
                <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 className="text-2xl mb-1 font-bold text-gray-700">
                {todo.title}
            </h2>
            <hr className="border-gray-300 mb-2" />
            <p className="text-gray-800 text-base">{todo.description}</p>
            <div className="mt-2">{renderStars()}</div>
        </div>
    );
};

export default Todo;