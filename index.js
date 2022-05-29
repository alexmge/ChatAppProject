const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const mongoose = require('mongoose');
const connectionString = process.env.CONNECTION_STRING;

//import readUser function
const { readUser } = require('./models/user');

var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// set up handlebars view engine
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//connect to the database
mongoose.connect(connectionString, {
    "useNewUrlParser": true,
    "useUnifiedTopology": true
}).
    catch(error => {
        console.log('Database connection refused' + error);
        process.exit(2);
    })

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
    console.log("DB connected")
});

app.get('/', function (req, res) {
    res.redirect('loginpage');
});

//get home
app.get('/home', function (req, res) {
    res.render('home.handlebars');
});

app.get('/loginpage', function (req, res) {
    res.render('login');
});

app.post('/login', async function (req, res) {
    var username = req.body.loginName;
    var password = req.body.loginPassword;
    var user = await readUser({ username: username });
    console.log(user);
    if (user) {
        if (bcrypt.compareSync(password, user.password)) {
            res.redirect('/home');
        } else {
            res.render('login', { error: 'Wrong password' });
        }
    } else {
        res.render('login', { error: 'Wrong username' });
    }
});

app.post('/register', async (req, res) => {

    //check if a user with this username already exists using readUser
    var get_users = await readUser({ username: req.body.username });
    console.log(get_users);
    if (get_users) {
        res.render('login', {user_taken: true, active_register: true});
    } else {
        req.body.password = bcrypt.hashSync(req.body.password, 10);
        db.collection("users").insertOne(req.body);
        console.log("Data sent via post");
        console.table(req.body);
        res.redirect('home');
    }
});

app.listen(port, () => console.log(`Project app listening on port ${port}!`))