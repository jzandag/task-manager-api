const express = require('express')
require('./db/mongoose.js')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const PORT = process.env.PORT

// app.use((req,res, next)=> {
//     console.log(req.method, req.path);
//     if(req.method === 'GET')
//         res.send('get request disable')
//     else
//         next()
// })

// app.use((req,res, next) => {

//     res.status(500).send('Under maintenance')
// })

//automatically parse incoming body
app.use(express.json())

//routes implementation
app.use(userRouter)
app.use(taskRouter)

app.listen(PORT , ()=> {
    console.log('Server running on port', PORT);
})

