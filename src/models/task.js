const mongoose = require('mongoose')
const validator = require('validator')

const taskSchema = mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    }, 
    isComplete: {
        type: Boolean,
        default: false,
        required: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    }
}, {
    timestamps: true
})

taskSchema.methods.toJSON = function (){
    const task = this
    const taskObj = task.toObject()

    delete taskObj._id

    return taskObj
}

const Task = mongoose.model('tasks', taskSchema)

module.exports = Task