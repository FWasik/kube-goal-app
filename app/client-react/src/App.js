import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';

const fetchTasks = async () => {
  const response = await fetch('/api/tasks');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const addTask = async (newTask) => {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: newTask }),
  });

  if (!response.ok) {
    throw new Error('Failed to add task');
  }
  return response.json();
};

function App() {
  const [title, setTitle] = useState('');
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, isError } = useQuery(['tasks'], fetchTasks);

  const mutation = useMutation(addTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    },
  });

  const handleAddTask = () => {
    if (title.trim()) {
      mutation.mutate(title);
      setTitle('');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching tasks</div>;

  return (
    <div className="app">
      <h1>Goal App</h1>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task"
      />
      <button onClick={handleAddTask}>Add Task</button>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;