require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const employeeSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        uppercase: true,
    },
    lastname: {
        type: String,
        required: true,
        uppercase: true,
    },
    email: {
        type: String,
        required: true,
        // unique: true
    },
    gender: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        // required: true,
        // unique: true,
        // min: 6000000000,
        // max: 9999999999
    },
    age: {
        type: Number,
        // required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmpassword: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

//generate token
employeeSchema.methods.generateAuthToken = async function () {
    try {
        // console.log(process.env.SECRET_KEY);
        const token = await jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (error) {
        console.log(error);
    }
}


//define pre method for bcrypt 
employeeSchema.pre("save", async function (next) {
    if (this.isModified('password')) {
        // console.log('Old Password is -', this.password);
        this.password = await bcrypt.hash(this.password, 10);
        // console.log('New Password is', this.password);
        this.confirmpassword = await bcrypt.hash(this.password, 10);
    }
    next();
})


const Register = new mongoose.model('Register', employeeSchema);

module.exports = Register;
