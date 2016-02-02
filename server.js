var express=require('express');
var bodyParser=require('body-parser');
var app = express();
var PORT = process.env.PORT || 3000;

// var todos = [{
//   id: 1,
//   description: 'Feed Dash',
//   completed: false
// },{
//   id: 2,
//   description: 'Play with Dash',
//   completed: false
// },{
//   id: 3,
//   description: 'Walk Dash',
//   complete: true
// },{
//   id: 4,
//   description: 'Give dash treats',
//   complete: false
// }
// ];

var todos=[];
var todoNextId= 1;

app.use(bodyParser.json());

app.get('/', function (req,resp) {
  resp.send('Todo API Root');
});

app.get('/todos', function(req,resp) {
  resp.json(todos);
});

app.get('/todos/:id', function (req,resp) {
  //resp.json(todos[req.params.id]);
  var findId=parseInt(req.params.id,10);
  var foundIndex=-1;
  for(i=0;i<todos.length;i++) {
    if (todos[i].id==findId) {
      foundIndex=i;
      break;
    }
  }
  if (foundIndex!=-1) {
    resp.json(todos[foundIndex]);
  }
  else {
    resp.status(404).send();
  }
});

// POST /todos

app.post('/todos', function(req,resp) {
  var body= req.body;

  if (typeof body.description === 'string' && body.description.length>0 ) {
    if (typeof body.completed !== 'boolean') {
      body.completed=false;
    }
    body.id=todoNextId++;
    todos.push(body);
    resp.json(body);
  }
  else {
    resp.status(404).send();
  }
});

app.listen(PORT, function () {
  console.log('Express listening on port '+PORT+'!');
});
