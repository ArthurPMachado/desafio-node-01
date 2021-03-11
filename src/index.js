const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: 'User not found' });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists' });
  }
  
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const addTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(addTodo);

  return response.status(201).json(addTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { username } = request.user;

  const findUser = users.find((user) => user.username === username);

  const todoExists = findUser.todos.some((todo) => todo.id === id);

  if(!todoExists) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  const findTodo = findUser.todos.find((todo) => todo.id === id);

  findTodo.title = title;
  findTodo.deadline = new Date(deadline);

  return response.status(201).json(findTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.user;

  const findUser = users.find((user) => user.username === username);

  const todoExists = findUser.todos.some((todo) => todo.id === id);

  if(!todoExists) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  const findTodo = findUser.todos.find((todo) => todo.id === id);

  findTodo.done = true;
  
  return response.status(201).json(findTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.user;

  const findUser = users.find((user) => user.username === username);

  const todoExists = findUser.todos.some((todo) => todo.id === id);

  if(!todoExists) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  const findTodo = findUser.todos.find((todo) => todo.id === id);

  findUser.todos.splice(findUser.todos.indexOf(findTodo), 1);

  return response.status(204).send();
});

module.exports = app;
