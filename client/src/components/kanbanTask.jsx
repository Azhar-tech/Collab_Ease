const KanbanTask = ({ task }) => {
    const [{ isDragging }, drag] = useDrag({
      type: "TASK",
      item: { id: task.id },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    });
  
    return (
      <div
        ref={drag}
        className={`p-2 bg-white rounded shadow mb-2 ${isDragging ? "opacity-50" : ""}`}
      >
        {task.name}

      </div>
    );
  };
  

  

// models

