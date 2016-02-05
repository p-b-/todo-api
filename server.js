var express = require('express');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
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
  var deletedJSON;

  db.todo.findById(deleteId).then(function(matchedTodo) {
    if (matchedTodo) {
      deletedJSON = matchedTodo.toJSON();
      return db.todo.destroy({
        where: {
          id: matchedTodo.id
        }
      });
    } else {
      return resp.status(404).json({
        "error": "no todo found with identifier: " + deleteId
      });
    }
  }).then(function(rowsDeleted) {
    if (rowsDeleted == 0) {
      return resp.status(404).json({
        "error": "could not delete todo with identifier: " +
          deleteId
      })
    } else {
      console.log('Deleted ' + rowsDeleted + ' rows');
      return resp.json(deletedJSON);
    }
  }).catch(function(e) {
    return resp.status(500).send();
  });
});
//  var matchedTodo = db.todo.
/*var matchedTodo = _.findWhere(todos, {
  id: deleteId
});

if (typeof matchedTodo === 'undefined') {
  return resp.status(400).json({
    "error": "no todo found with identifier: " + deleteId
  });
}

todos = _.without(todos, matchedTodo);
resp.json(matchedTodo);*/
//});

// PUT
app.put('/todos/:id', function(req, resp) {
  var updateId = parseInt(req.params.id, 10);

  var body = _.pick(req.body, 'description', 'completed');
  var attributes = {};

  if (body.hasOwnProperty('completed')) {
    attributes.completed = body.completed;
  }

  if (body.hasOwnProperty('description')) {
    attributes.description = body.description;
  }

  db.todo.findById(updateId).then(function(todo) {
    if (todo) {
      todo.update(attributes).then(function(todo) {
        resp.json(todo.toJSON());
      }, function(error) {
        resp.status(400).json(error);
      });
    } else {
      resp.status(404).send();
    }
  }, function(e) {
    res.status(500).send();
  });
});

app.post('/users', function(req, resp) {
  var body = _.pick(req.body, 'email', 'password');

  db.user.create(body).then(function(user) {
    resp.json(user.toPublicJSON());
  }, function(e) {
    resp.status(400).json(e);
  });
});

app.post('/users/login', function(req, resp) {
  var body = _.pick(req.body, 'email', 'password');

  db.user.authenticate(body).then(function(user) {
    resp.json.toPublicJSON(user);
  }, function(e) {
    resp.status(401).send();
  });

});

db.sequelize.sync({
  force: true
}).then(function() {
  app.listen(PORT, function() {
    console.log('Express listening on port ' + PORT + '!');
  });
});
