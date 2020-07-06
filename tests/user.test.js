const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user.js');
const {userOneId, userOne, setupDatabase} = require('./fixtures/db');


beforeEach(setupDatabase);

test('Should sign up a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Admin',
        email: 'demkha@mail.ru',
        password: 'popooo777!'
    }).expect(201);
    //Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull();
   
    //Assertions about the response
    expect(response.body).toMatchObject({
        user:{
            name: 'Admin',
            email: 'demkha@mail.ru'
        },
        token: user.tokens[0].token
    })

    //Assertions about password
    expect(user.password).not.toBe('popooo777!')
});

test('Should not signup user with invalid name/email/password', async () => {
    const response = await request(app)
                        .post('/users')
                        .send({
                            name: 123,
                            email: 'test',
                            password: 'password'
                        }).expect(400)
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login non-existing user', async () =>{
    await request(app).post('/users/login').send({
        email: 'test@gmail.com',
        password: 'somepass1234!'
    }).expect(400);
})

test('Should get profile for user', async () => {
    await request(app)
            .get('/users/me')
            .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
            .send()
            .expect(200);
});

test('Should not get profile for unauthenciated user', async () => {
    await request(app)
            .get('/users/me')
            .send()
            .expect(401)
});

test('Should delete user profile', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const user = await User.findById(userOneId);
    expect(user).toBeNull();
})

test('Should not delete unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401) 
})

test('Should not update user if unauthenticated', async () => {
    await request(app)
          .patch('/users/me')
          .send()
          .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200);
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    const response = await request(app)
                    .patch('/users/me')
                    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
                    .send({
                        name: 'Administrator'
                    }).expect(200);
    const updatedUser = await User.findById(userOneId);
    expect(updatedUser.name).toBe('Administrator');      
})

test('Should not update user with invalid name/email/password', async () =>{
    const response = await request(app)
                        .patch('/users/me')
                        .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
                        .send({ 
                            name: 11,
                            email: 'test',
                            password: 'password'
                        }).expect(400)
})

test('Should not update invalid user fields', async () => {
    await request(app)
                    .patch('/users/me')
                    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
                    .send({
                        location: 'Baku'
                    }).expect(400);
})