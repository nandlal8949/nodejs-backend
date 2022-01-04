const jwt = require('jsonwebtoken')
const Register = require('../model/registers')

const auth = async (request, response, next)=>{
    try {
        const token = request.cookies.jwt;
        // console.log('auth token', token);
        const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
        console.log('verify user ', verifyUser);
        const user = await Register.findOne({_id: verifyUser._id})
        console.log(user.firstname);

        request.token = token;
        request.user = user;
        next();

    } catch (error) {
        response.status(404).send(error)
    }
}

module.exports = auth;