const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const findUser = users.find(user => user.username === username);

  if (!findUser) {
    response.status(404).json({ error: 'Especified username does not exist on the database.' })
  }

  request.user = findUser;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const findIfUserNameAvaible = users.some(user => user.username === username);

  if (findIfUserNameAvaible) {
    return response.status(400).json({ error: 'Username already taken' })
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

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const findTodoIndex = user.todos.findIndex(todo => todo.id === id);

  if (findTodoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  const oldTodo = user.todos[findTodoIndex];
  user.todos[findTodoIndex] = {
    ...oldTodo,
    title,
    deadline
  }

  return response.json(user.todos[findTodoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findTodoIndex = user.todos.findIndex(todo => todo.id === id);

  if (findTodoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  const oldTodo = user.todos[findTodoIndex];
  user.todos[findTodoIndex] = {
    ...oldTodo,
    done: true
  }

  return response.json(user.todos[findTodoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findTodoIndex = user.todos.findIndex(todo => todo.id === id);

  if (findTodoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  user.todos.splice(findTodoIndex, 1);

  return response.status(204).send();
});

module.exports = app;