const express = require('express')

const router = express.Router()
const Task = require('../models/task')

const auth = require('../middleware/auth')

router.post('/tasks', auth, async (req,res)=> {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    const updates = Object.keys(req.body)
    const allowed = [ "description", "isComplete"]

    const isValid = updates.every( (u)=> allowed.includes(u) )

    if(!isValid)
        res.status(400).send({error: "Invlid fields"})

    try {
        console.log(task);
        await task.save()
        res.status(201).send({task, token: req.token});
    } catch (error) {
        res.status(500).send(error);
    }
})

router.get('/tasks', auth, async (req,res) => {
    const match = {}
    const sort = {}
    if(req.query.isComplete){
        match.isComplete = req.query.isComplete === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1
    }
    try {
        //const tasks = await Task.find({ owner: req.user._id})
        await req.user.populate({
            path: 'tasks', 
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (error) {
        res.status(500).send(error)   
    }
})
router.get('/tasks/:id', auth, async (req,res) => {
    try {
        //const task = await Task.findById(req.params.id)
        const task = await Task.findOne({ _id: req.params.id , owner: req.user._id})
        if(!task)
            res.status(404).send('Task not Found')
        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.patch('/tasks/:id', auth, async (req,res) => {
    const updates = Object.keys(req.body)
    const allowed = [ "description", "isComplete"]

    const isValid = updates.every( (u)=> allowed.includes(u) )

    if(!isValid)
        res.status(400).send({error: "Invlid updates"})

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id})
        //const task = await Task.findById(req.params.id)
        //const task = await req.user.populate('')
        if(!task)
            return res.status(404).send('no task found')

        updates.forEach((u) => task[u] = req.body[u])
        await task.save()
        res.status(200).send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/tasks/:id', auth, async (req,res) => {

    try {
        //const task = await Task.findByIdAndDelete(req.params.id)
        await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id})
        // if(!task)
        //     return res.status(404).send({error: 'Task not found'})
        // res.send(task)
        res.send()
    } catch (error) {
        res.status(500).send('Bad request')
    }
})

module.exports = router

//{
// 	"name": "Zymielle",
// 	"email": "zymielle@gmail.com",
// 	"password": "business"
// }
