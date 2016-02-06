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
});

var User = sequelize.define('user', {
  email: {
    type: Sequelize.STRING
  }
});

Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync({
  force: false
}).then(function() {
  User.findById(1).then(function(user) {
    console.log('Executing finding users todos promise');
    user.getTodos({
      where: {
        completed: false
      }
    }).then(function(todos) {
      console.log('Executing foreach for users todos');
      todos.forEach(function(todo) {
        console.log('Found users todo: ' + JSON.stringify(todo));
      })
    })
  }).then(function() {


    console.log('finding by status');

    /*  var findStatus = false;
    User.findById(1).then(function(user) {
      console.log('Executing finding users completed todos promise');
      var where = {
        userId: user.id,
        completed: findStatus
      };

      Todo.findAll({
        where: where
      }).then(function(todos) {
        console.log('Executing foreach for completed todos');
        todo = undefined;
        todos.forEach(function(todo) {
          console.log('Todo with status: ' + findStatus +
            ' ' +
            JSON.stringify(todo));
        })
      });
})*/

  })

  // User.create({
  //   email: 'paul@example.com'
  // }).then(function(user) {
  //   return Todo.create({
  //     description: 'Clean kitchen'
  //   });
  // }).then(function(todo) {
  //   return User.findById(1).then(function(user) {
  //     user.addTodo(todo);
  //   })
  // })
});
