const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')

const {setUpDatabase, user1, user1Id} = require('./fixtures/db')

beforeEach(setUpDatabase)

test('Should signup a new user', async() => {
    const response = await request(app).post('/users').send({
        name: 'Zidrex',
        email: 'zidrexandag1@gmail.com',
        password: 'nodecourse'
    }).expect(201)

    //Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //assertion about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Zidrex',
            email: 'zidrexandag1@gmail.com'
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('nodecourse')

})

test('Shoul login existing user', async()=> {
    const response = await request(app).post('/users/login').send({
        email: user1.email,
        password: user1.password
    }).expect(200)

    const user = await User.findById(response.body.user._id)
    expect(response.body).toMatchObject({
        token: user.tokens[1].token
    })
})
test('Should not login non existing user', async()=> {
    await request(app).post('/users/login').send({
        email: user1.email,
        password: 'rtyertyerty'
    }).expect(400)
})

test('Should get profile for user', async() => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send()
        .expect(200)
})
test('Should not get profile for unauthenticated user', async() => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})
test('Should delete account for user', async() => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send()
        .expect(200)
    
    const user = await User.findById(user1._id)
    expect(user).toBeNull()
})
test('Should not delete for unauthenticated user', async() => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload user avatar', async() => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/covid.jpg')
        .expect(200)

    const user = await User.findById(user1Id)

    //runs algorithm to compare properties
    expect(user.avatar).toEqual(expect.any(Buffer))

})

test('should update user test fields', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send({
                name: 'Zid'
        }).expect(200)
    expect(response.body.name).toBe('Zid')
})
test('Should not update invalid user fields', async () => {

    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send({
            location: 'antipolo'
        }).expect(400)
})