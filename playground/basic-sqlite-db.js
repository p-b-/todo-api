var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
  'dialect': 'sqlite',
  'storage': __dirname + '/basic-sqlite-db.sqlite'
});

var Todo = sequelize.define('todo', {
  description: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [1, 250]
    }
  },
  completed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
})

sequelize.sync({
  force: true
}).then(function() {
  Todo.create({
    description: 'Sing with Dash'
  }).then(function(todo) {
    console.log('Created ' + todo.description);
    return Todo.create({
      description: 'Play with Croc'
    });
  }).then(function(todo) {
    console.log('Created ' + todo.description);
    return Todo.findById(2);
  }).then(function(todo) {
    console.log('Found ' + todo.toJSON());
  }).catch(function(e) {
    log(e);
  });
});

/*sequelize.sync({
  force: true
}).then(function() {
  console.log('Everything is synced');

  Todo.create({
    description: 'Play with Dash',
    completed: false
  }).then(function(todo) {
    return Todo.create({
      description: 'Clean office'
    });
  }).then(function(todo) {
    //return Todo.findById(1)
    return Todo.findAll({
      where: {
        description: {
          $like: '%dash%'
        }
      }
    });
  }).then(function(todos) {

    if (todos) {
      todos.forEach(function(todo) {
        console.log(todo.toJSON());
      })
    } else {
      console.log('no todo found!');
    }
  }).catch(function(e) {
    console.log(e);
  });
});*/
