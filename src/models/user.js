const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(val){
            if(val.includes('password'))
                throw new Error('Passowrd easy')
        }
    }, 
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value){
            if(!validator.isEmail(value))
                throw new Error('Email invalid')
        }
    },  
    age: {
        type: Number,
        default: 18,
        min: 18,
        required: false,
        validate(value){
            if(value < 0)
                throw new Error('Age must be positive')
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'tasks',
    localField: '_id',
    foreignField: 'owner'
})
userSchema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString()}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat( {token})
    await user.save()
    
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if(!user)
        throw new Error('No user with such email')

        const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch)
        throw new Error('Wrong password')

    return user
}

//Hash the plain text password before saving
userSchema.pre('save', async function(next) {
    const user = this
    if(user.isModified('password'))
        user.password = await bcrypt.hash(user.password, 8)
    
    next()
})

userSchema.pre('remove', async function(next) {
    const user = this

    await Task.deleteMany({ owner: user._id})

    next()
})

const User = mongoose.model('users',userSchema)

module.exports = User