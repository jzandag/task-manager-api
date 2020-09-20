const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const user1Id = new mongoose.Types.ObjectId()
const user1 = {
    _id: user1Id,
    name: 'Zidrex',
    email: 'zidrexandag10@gmail.com',
    password: 'nodecourse',
    tokens: [{
        token: jwt.sign({_id: user1Id}, process.env.JWT_SECRET)
    }]
}

const user2Id = new mongoose.Types.ObjectId()
const user2 = {
    _id: user2Id,
    name: 'Dess',
    email: 'dess@gmail.com',
    password: 'nodecourse',
    tokens: [{
        token: jwt.sign({_id: user2Id}, process.env.JWT_SECRET)
    }]
}

const task1 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'From db',
    isComplete: true,
    owner: user1Id
}

const task2 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'From db 2nd',
    isComplete: false,
    owner: user1Id
}
const task3 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'From db 3rd',
    isComplete: false,
    owner: user2Id
}

const setUpDatabase = async( ) => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(user1).save()
    await new User(user2).save()
    await new Task(task1).save()
    await new Task(task2).save()
    await new Task(task3).save()
}

module.exports = {
    setUpDatabase,
    user1Id, user1, user2,
    task1,task2, task3
}
