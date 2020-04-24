const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const sharp = require('sharp');

const auth = require('../middleware/auth')
const User = require('../models/user')

const {sendWelcomeMsg , sendConfirmMsg} = require('../emails/account')

const multer = require('multer') 
const upload = multer({
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter(req, file, cb){

        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload image file'))
        }
        cb(undefined, true)
    }
})

router.post('/users',async (req,res)=> {
    const user = new User(req.body)

    const updates = Object.keys(req.body)
    const allowed = ['name', 'email', 'password', 'age']

    const isValid = updates.every((e) => allowed.includes(e))

    if(!isValid)
        return res.status(400).send({ error: 'Invalid updates'})

    try {
        await user.save()
        const token = await user.generateAuthToken()
        sendWelcomeMsg(user.email, user.name)
        res.status(201).send({user,token});
    } catch (error) {
        res.status(500).send(error);
    }
})

router.post('/users/login', async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/logoutAll',auth, async (req,res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        //await User.findByIdAndUpdate(req.user.id, {tokens: []})
        res.status(200).json({success: 'Logout all devices successful'})
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(tk => tk.token !== req.token)
        await req.user.save()
        res.send()
    } catch (error) {
        req.status(500).send('error')
    }
})

router.get('/users/me', auth,async (req,res) => {
    res.send(req.user)
})
router.get('/users/:id', async (req,res) => {

    try {
        const user = await User.findById(req.params.id)
        if(!user)
            return result.status(404).send('User not found')
        res.send(user)
    } catch (error) {
        res.status(500).end(error) 
    }
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowed = ['name', 'email', 'password', 'age']

    const isValid = updates.every((e) => allowed.includes(e))

    if(!isValid)
        return res.status(400).send({ error: 'Invalid updates'})

    try {
        // to eturn the updated user
        console.log('hey');
        updates.forEach( update => {
            req.user[update] = req.body[update]
        })
        await req.user.save()   

        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/users/me', auth, async(req, res) => {
    try {
        await req.user.remove() 
        sendConfirmMsg(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async(req,res) =>{
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req,res, next) => {
    res.status(400).send({error: error.message})
    next()
})
router.delete('/users/me/avatar', auth, async(req,res) =>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req,res, next) => {
    res.status(400).send({error: error.message})
    next()
})
router.get('/users/:id/avatar', async (req,res) => {
    try {
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)

    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router