const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'test',
      database : 'test'
    }
  });

const app = express();

app.use(bodyParser.json());
app.use(cors());

const database = {
    users: [
        {
            id: '123',
            name: 'tony',
            password: 'cookies',
            email: 'ironman@gmail.com',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'batman',
            password: 'gotham',
            email: 'arkhamn@gmail.com',
            entries: 0,
            joined: new Date()
        }
    ],
    login: [
        {
            id: '987',
            hash: '',
            email: ''
        }
    ]
}

app.get('/', (req, res)=> {
    res.send(database.users);
})

app.post('/signin', (req, res) => {
    
    if (req.body.email === database.users[0].email && 
        req.body.password === database.users[0].password) {
            res.json(database.users[0]);
    } else {
        res.status(400).json('error logging in');
    }
})

app.post('/register', (req, res) => {
    const { email, name, password} = req.body;
    const hash = bcrypt.hashSync(password);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
           return trx('users')
           .returning('*')
           .insert({
               email: loginEmail,
               name: name,
               joined: new DataCue()
           })
        })
        .then(trx.commit)
    })
    .then(user => {
        res.json(user[0]);
    })
    .catch(err => res.status(400).json('unable to register'))
})

app.get('/profile/:id', (req, res) => {
    const { id} = req.params;
    db.select('*').from('users')
    .where({id  
    })
    .then(user => {
        if (user.length){
            res.json(user[0])
        } else {
            res.status(400).json('Not found')
        }
    })
    .catch(err => res.status(400).json('error getting user'))
})

app.post('/image', (req, res) => {
    const { id} = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries)[0];
    })
    .catch(err => res.status(400).json('unable to get entries'))
})

// bcrypt.hash("bacon", null, null, function(err, hash) {
//     // Store hash in your password DB.
// });


app.listen(3000, () => {
    console.log('app is running on port 3000')
})

