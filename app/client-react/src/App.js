import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import './App.css';

const fetchGoals = async () => {
  const response = await fetch('/api/goals');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const addGoal = async (newGoal) => {
  const response = await fetch('/api/goals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: newGoal }),
  });

  if (!response.ok) {
    throw new Error('Failed to add goal');
  }
  return response.json();
};

const deleteGoal = async (goalId) => {
  const response = await fetch(`/api/goals/${goalId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete goal');
  }
  return response.json();
};

function App() {
  const [title, setTitle] = useState('');
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading, isError } = useQuery(['goals'], fetchGoals);

  const addMutation = useMutation(addGoal, {
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
    },
  });

  const deleteMutation = useMutation(deleteGoal, {
    onSuccess: () => {
      queryClient.invalidateQueries(['goals']);
    },
  });

  const handleAddGoal = () => {
    if (title.trim()) {
      addMutation.mutate(title);
      setTitle('');
    }
  };

  const handleDeleteGoal = (goalId) => {
    deleteMutation.mutate(goalId);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching goals</div>;

  return (
    <div className="app">
      <h1>Goal App</h1>
      <div className="input-container">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a goal"
        />
        <button onClick={handleAddGoal}>Add goal</button>
      </div>
      <table className="goal-table">
        <thead>
          <tr>
            <th>Goal</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {goals.map((goal) => (
            <tr key={goal.id}>
              <td>{goal.title}</td>
              <td>
                <button className="delete-button" onClick={() => handleDeleteGoal(goal.id)}>
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
