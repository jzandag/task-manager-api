const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const User = require('../src/models/user')

const {setUpDatabase, user1, user2, task1, task2, task3} = require('./fixtures/db')

beforeEach(setUpDatabase)

test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send({ description: 'From test'})
        .expect(201)

    const task = await Task.findById(response.body.task._id)

    expect(task).not.toBeNull()
})

test('Should get task for current user only', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send({

        })
        .expect(200)

    expect(response.body.length).toEqual(2)
        
})

test('Should not delete task from other users', async () => {
    const user = await User.findById(user2._id)
    await request(app)
        .delete(`/tasks?id=${task1._id}`)
        .set('Authorization', `Bearer ${user.tokens[0].token}`)
        .send({
            user: {
                _id: user._id
            }
        }).expect(404)
    
    const task = await Task.findById(task1._id)
    expect(task).not.toBeNull()
})


//
// User Test Ideas
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated

//
// Task Test Ideas
//
// Should not create task with invalid description/completed
// Should not update task with invalid description/completed
// Should delete user task
// Should not delete task if unauthenticated
// Should not update other users task
// Should fetch user task by id
// Should not fetch user task by id if unauthenticated
// Should not fetch other users task by id
// Should fetch only completed tasks
// Should fetch only incomplete tasks
// Should sort tasks by description/completed/createdAt/updatedAt
// Should fetch page of tasks