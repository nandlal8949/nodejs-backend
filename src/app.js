require('dotenv').config();
const express = require('express');
const path = require('path');
require('./db/conn');
const Register = require('./model/registers')
const app = express();
const hbs = require('hbs');
const bycript = require('bcrypt');
const cookieparser = require('cookie-parser');
const port = process.env.PORT || 8000;
const auth = require('./middleware/auth');
const async = require('hbs/lib/async');
const req = require('express/lib/request');

app.use(cookieparser()); //cookie parser
app.use(express.json()); //change in json
app.use(express.urlencoded({ extended: false })) //form data received 

const staticPath = path.join(__dirname, './public');
app.use(express.static(staticPath));

const templetesPath = path.join(__dirname, '../templetes/views');
const partialPath = path.join(__dirname, '../templetes/partials')

// console.log(process.env.SECRET_KEY);



app.set('view engine', 'hbs'); // setting for hbs files next render
app.set('views', templetesPath); //change path views to templets  
hbs.registerPartials(partialPath); //register partial files 

app.get('/', (request, response) => {
    response.render('index');
})

app.get('/register', (request, response) => {
    response.render('register')
})

//login check and login 
app.get('/login', (request, response) => {
    response.render('login')
})


//secret page
app.get('/secret', auth, (request, response) => {
    //get cookie
    // console.log('My JSON COOKIES = ', request.cookies);
    response.render('secret');
})

//logout page
app.get('/logout', auth, async (request, response) => {
    try {

        // console.log('all tokens ',request.user.tokens);
        // remove single token in database
        // request.user.tokens = request.user.tokens.filter((removeToken)=>{
        //     return removeToken.token !== request.token; 
        // })

        //remove all token in database
        request.user.tokens = []

        response.clearCookie('jwt'); // cookie name 
        console.log('Logout Successfully', request.user);
        await request.user.save();
        response.render('login')

    } catch (error) {
        response.status(401).send(error);
    }
})


app.post('/login', async (request, response) => {

    try {
        const loginData = await Register.findOne({ email: request.body.email });
        if (!loginData) {
            response.status(404).send('Not Found Email')
        }
        const isMatch = await bycript.compare(request.body.password, loginData.password);

        const token = await loginData.generateAuthToken();
        // console.log('Login Token ', token);

        response.cookie('jwt', token, { // cookies add 
            expires: new Date(Date.now() + 100000),
            httpOnly: true,
            // secure: true, 
        })

        if (isMatch) {
            // console.log(loginData);
            response.status(200).render('index');

        } else {
            response.status(404).send('Password incorrect Found')
        }
    } catch (error) {
        response.status(500).send(error);
    }

})


// password bcrypt 
// const bcrypt = require('bcrypt');

// const securePassword = async(pass)=>{
//     const hash = await bcrypt.hash(pass, 10)
//     console.log(hash);

//     const passCompare = await bcrypt.compare(pass, hash);
//     console.log(passCompare);
// }

// securePassword('myPassword');


app.post('/register', async (request, response) => {
    // console.log(request.body);
    try {


        if (request.body.password === request.body.confirmpassword) {

            const employeeData = new Register({
                firstname: request.body.firstname,
                lastname: request.body.lastname,
                email: request.body.email,
                gender: request.body.gender,
                phone: request.body.phone,
                age: request.body.age,
                password: request.body.password,
                confirmpassword: request.body.confirmpassword,
            })

            const token = await employeeData.generateAuthToken();

            response.cookie('jwt', token, {
                expires: new Date(Date.now() + 30000), httpOnly: true
            }); // cookie store 


            // const addData = await Register.insertMany(employeeData);
            const addData = await employeeData.save();
            response.status(201).render('index');
            // console.log(addData);


        } else {
            response.status(404).send('Password not Match');
        }


    } catch (error) {
        response.status(500).send(error);
    }

})


// const jwt = require('jsonwebtoken');

// const createToken = async ()=>{
//     const token = await jwt.sign({_id: "61d3127ecc692616c67790b9"}, 'jsonprivatekythirtytwocharactor', {expiresIn: "2 minutes"});
//     console.log(token);

//     const verify = jwt.verify(token, 'jsonprivatekythirtytwocharactor');
//     console.log(verify);
// }

// createToken();



app.listen(port, () => {
    console.log('Mongoose Connect Successfully');
})


// https://bootsnipp.com/snippets/dlZAN 