var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, resp) {
  resp.send('Todo API Root');
});

// GET /todos?completed=true&q=house
app.get('/todos', function(req, resp) {
  var query = req.query;
  var where = {};

  if (query.hasOwnProperty('completed')) {
    where.completed = (query.completed === 'true');
  }
  if (query.hasOwnProperty('q') && query.q.length > 0) {
    where.description = {
      'like': '%' + query.q + '%'
    };
  }
  db.todo.findAll({
    where: where
  }).then(function(todosFound) {
    resp.json(todosFound);
  }, function(error) {
    resp.status(404).json(error);
  });
});

app.get('/todos/:id', function(req, resp) {
  var findId = parseInt(req.params.id, 10);

  db.todo.findById(findId).then(function(matchedTodo) {
    if (matchedTodo) {
      resp.json(matchedTodo.toJSON());
    } else {
      resp.status(404).send();
    }
  }, function(e) {
    resp.status(500).send();
  });
  /*var matchedTodo = _.findWhere(todos, {
    id: findId
  });

  if (matchedTodo) {
    resp.json(matchedTodo);
  } else {
    resp.status(404).send();
  }*/
});

// POST /todos

app.post('/todos', function(req, resp) {
  var body = _.pick(req.body, 'description', 'completed');

  db.todo.create(body).then(function(todo) {
    return resp.json(todo.toJSON());
  }, function(e) {
    return resp.status(400).json(e);
  });

});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, resp) {
  var deleteId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {
    id: deleteId
  });

  if (typeof matchedTodo === 'undefined') {
    return resp.status(400).json({
      "error": "no todo found with identifier: " + deleteId
    });
  }

  todos = _.without(todos, matchedTodo);
  resp.json(matchedTodo);
});

// PUT
app.put('/todos/:id', function(req, resp) {
  var updateId = parseInt(req.params.id, 10);
  var matchedTodo = _.findWhere(todos, {
    id: updateId
  });

  var body = _.pick(req.body, 'description', 'completed');
  var validAttributes = {};

  if (!matchedTodo) {
    resp.status(404).send()
  }

  if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    validAttributes.completed = body.completed;
  } else if (body.hasOwnProperty('complete')) {
    return res.status(400).send();
  } else {
    // Never provided attribute, no problem here
  }

  if (body.hasOwnProperty('description') && _.isString(body.description) &&
    body.description.trim().length > 0) {
    validAttributes.description = body.description;
  } else if (body.hasOwnProperty('description')) {
    return res.status(400).send();
  } else {
    // everything o
  }
  _.extend(matchedTodo, validAttributes);

  resp.json(matchedTodo);
});

db.sequelize.sync(
  /*{
    force: true
  }*/
).then(function() {
  app.listen(PORT, function() {
    console.log('Express listening on port ' + PORT + '!');
  });
});
