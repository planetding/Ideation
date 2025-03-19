"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';



const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Home() {
  const [user, setUser] = useState(null);
  const [need, setNeed] = useState('');
  const [currentSolution, setCurrentSolution] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [heuristicId, setHeuristicId] = useState('');
  const [categories, setCategories] = useState([]);
  const [heuristics, setHeuristics] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [pastTasks, setPastTasks] = useState([]);
  const [selectedIdea, setSelectedIdea] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchPastTasks(user.id);
        fetchCategories();
        fetchHeuristics(user.id);
      }
    };
    fetchUser();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    setCategories(data);
  };

  const fetchHeuristics = async (userId) => {
    const { data } = await supabase
      .from('heuristics')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`);
    setHeuristics(data);
  };

  const fetchPastTasks = async (userId) => {
    const { data } = await supabase
      .from('tasks')
      .select('*, ideas(*)')
      .eq('user_id', userId);
    setPastTasks(data);
  };

  const generateIdeas = async (parentIdeaId = null) => {
    const { data: taskData } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        need,
        current_solution: currentSolution,
        category_id: categoryId
      })
      .select('id')
      .single();

    const heuristic = heuristics.find(h => h.id === parseInt(heuristicId));
    const prompt = `Given the need "${need}" and current solution "${currentSolution}" in category "${categories.find(c => c.id === parseInt(categoryId)).name}", apply the heuristic "${heuristic.name}" with examples like "combine solutions" or "remove redundancy." Suggest 3 innovative ideas.`;

    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    const generatedIdeas = data.choices[0].message.content
      .split('\n')
      .filter(line => line.trim())
      .slice(0, 3);

    const ideasToInsert = generatedIdeas.map(idea => ({
      task_id: taskData.id,
      idea_text: idea,
      heuristic_used: heuristic.name,
      iteration_parent_id: parentIdeaId
    }));
    await supabase.from('ideas').insert(ideasToInsert);

    setIdeas([...ideas, ...ideasToInsert]);
    setNeed('');
    setCurrentSolution('');
  };

  const rateIdea = async (ideaId, rating, comment) => {
    await supabase
      .from('ideas')
      .update({ rating, comment })
      .eq('id', ideaId);
    fetchPastTasks(user.id); // Refresh
  };

  const exportIdeas = () => {
    const pdfContent = ideas.map(i => `${i.idea_text} (Rating: ${i.rating || 'N/A'})`).join('\n');
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ideas.txt'; // Use a library like jsPDF for real PDF
    a.click();
  };

  if (!user) return <div><a href="/login">Login</a> | <a href="/register">Register</a></div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Idea Generator</h1>
      <button onClick={() => supabase.auth.signOut()}>Logout</button>

      <h2>New Task</h2>
      <input
        placeholder="Need (Goal of Innovation)"
        value={need}
        onChange={(e) => setNeed(e.target.value)}
      />
      <input
        placeholder="Current Solution"
        value={currentSolution}
        onChange={(e) => setCurrentSolution(e.target.value)}
      />
      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
        <option value="">Select Category</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      <select value={heuristicId} onChange={(e) => setHeuristicId(e.target.value)}>
        <option value="">Select Heuristic</option>
        {heuristics.map(h => (
          <option key={h.id} value={h.id}>{h.name} {h.is_custom ? '(Custom)' : ''}</option>
        ))}
      </select>
      <button onClick={() => generateIdeas()}>Generate Ideas</button>

      <h2>Generated Ideas</h2>
      {ideas.map(idea => (
        <div key={idea.id}>
          <p>{idea.idea_text} (Heuristic: {idea.heuristic_used})</p>
          <input
            type="number"
            min="1"
            max="5"
            onBlur={(e) => rateIdea(idea.id, parseInt(e.target.value), idea.comment)}
            defaultValue={idea.rating}
          />
          <input
            placeholder="Comment"
            onBlur={(e) => rateIdea(idea.id, idea.rating, e.target.value)}
            defaultValue={idea.comment}
          />
          <button onClick={() => { setSelectedIdea(idea); setNeed(idea.idea_text); }}>Iterate</button>
        </div>
      ))}
      {ideas.length > 0 && <button onClick={exportIdeas}>Export Ideas</button>}

      <h2>Past Tasks</h2>
      {pastTasks.map(task => (
        <div key={task.id}>
          <p>Need: {task.need}, Solution: {task.current_solution}</p>
          <ul>
            {task.ideas.map(idea => (
              <li key={idea.id}>{idea.idea_text} - Rating: {idea.rating || 'N/A'}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
} 
