/**
 * /tests/main.js
 */


import { logIn
       , logInTeacher
       , toggleActivation
       , logOut
       } from '../imports/api/methods/mint'
import { User
       , Teacher
       , Group
       } from '../imports/api/collections/mint'
import Points from '../imports/api/collections/points'

import assert from "assert";
import { random_id
       , random_lang
       , random_name
       , random_teacher
       } from './randoms'


// Flush test database

const collections = {
  Teacher
, User
, Group
}

const ids = {
  Teacher: 0
, User:    0
, Group:   0
, Points:  0
}

for (let name in collections) {
  // console.log(collectionName, ids[collectionName])
  const collection = collections[name]
  collection.remove({})
  ids[name] = collection.find({})
                        .fetch()
                        .map(doc => doc._id)
}


// Create random user and teachers

const username = random_name()
const native   = random_lang()
const teacher  = random_id({ length: 2, noNumbers: true })
const language = random_lang()
const d_code   = random_id({ length: 7 })


const user_data = {
  username
, native
, teacher
, language
, d_code
, restore_all: false
}


const second_language = {
  teacher:  random_id({ length: 2, noNumbers: true })
, language: random_lang()
}

const teacher_one = random_teacher(user_data)
const t1_code     = random_id({ length: 7 })
const teacher_two = random_teacher({...user_data, ...second_language})
const t2_code     = random_id({ length: 7 })


describe("New User", function () {

  it("starts with an empty collection of teachers"
  , async function () {
    assert.strictEqual(ids.Teacher.length, 0)
  });

  it("then creates a new teacher called " + teacher_one.id
  , async function () {
    let _id
    ids.Teacher.push( _id = Teacher.insert(teacher_one))
    assert.strictEqual(ids.Teacher.length, 1)
  });

  it("who teaches " + teacher_one.language + ","
  , async function () {
    const teacherDoc = Teacher.findOne({ _id: ids.Teacher[0] })
    console.log(teacherDoc)
    assert.deepEqual(teacher_one, teacherDoc)
  });

  it("and a second teacher called " + teacher_two.id
  , async function () {
    let _id
    ids.Teacher.push( _id = Teacher.insert(teacher_two))
    assert.strictEqual(ids.Teacher.length, 2)
  });

  it("who teaches " + teacher_two.language + "."
  , async function () {
    const teacherDoc = Teacher.findOne({ _id: ids.Teacher[1] })
    console.log(teacherDoc)
    assert.deepEqual(teacher_two, teacherDoc)
  });

  it("A new user named " + user_data.username + " now logs in..."
  , async function () {
    const callback = (error, data) => {
      console.log(data)
      // {
      // accountCreated: true,
      // groupCreated: true,
      // loggedIn: true,
      // status: 'JoinGroup_success',

      // user_id: 'Tn7rwN5yeAjNWb2nd',
      // group_id: 'NgiHNXQFmdSza7nQZ',
      // q_code: '3819',
      // q_color: '#33cc60',
      // view: 'Activity'

      // username: 'Ysepar',

      // teacher: 'YZ',

      // d_code: 'o7wljkU',
      // restore_all: false
      // }

      const { user_id, group_id } = data
      ids.User.push(user_id)
      ids.Group.push(group_id)

      assert.strictEqual(user_data.user_name, data.user_name)
      assert.strictEqual(user_data.teacher, data.teacher)
      assert.strictEqual(user_data.d_code, data.d_code)
      assert.strictEqual(user_data.restore_all, data.restore_all)

      assert.strictEqual(data.accountCreated, true)
      assert.strictEqual(data.groupCreated, true)
      assert.strictEqual(data.loggedIn, true)
      assert.strictEqual(data.status, "JoinGroup_success")
      assert.strictEqual(data.q_code, "3819")
      assert.strictEqual(data.view,   "Activity")

      assert.strictEqual(ids.User.length, 1)
      assert.strictEqual(ids.Group.length, 1)
    }

    logIn.call(user_data, callback)


  });

  it("... to the group with teacher " + teacher_one.id + "."
  , async function () {
    const group = Group.findOne({ _id: ids.Group[0] })
    console.log(group)
    const { logged_in, members } = group

    assert.equal(logged_in.length, 1)
    assert.equal(logged_in[0], user_data.d_code)
    assert.deepEqual(members, [ids.User[0], teacher_one.id])
  });

  it("Teacher " + teacher_one.id + " connects..."
  , async function () {
    const callback = (error, data) => {
      console.log(data)

      const { logged_in } = Teacher.findOne({ id: teacher })

      assert.strictEqual(logged_in.length, 1)
      assert.strictEqual(logged_in[0], t1_code)
      assert.strictEqual(data.id, teacher)
      assert.strictEqual(data.d_code, t1_code)
      assert.strictEqual(data.loggedIn, 1) // 1, not true
    }

    logInTeacher.call({
      id: teacher
    , d_code: t1_code
    }, callback)
  });

  it("... and joins our new user."
  , async function () {
    const callback = (error, data) => {
      console.log(data)

      assert.strictEqual(data.teacher_logged_in, true)

      const points = Points.find().fetch()
      console.log("No points are created yet:", points)
    }

    toggleActivation.call({
      _id: ids.Group[0]
    , d_code: t1_code
    , active: true
    }, callback)
  });

  it("The Teacher " +teacher_one.id+ " logs out and leaves all groups"
  , async function () {
    const callback = (error, data) => {
      console.log(data)

      const { logged_in } = Teacher.findOne({ id: teacher })

      assert.strictEqual(logged_in.length, 0)

      const groups = Group.find({ logged_in: t1_code })
                            .fetch()

      const { active } = Group.findOne({ _id: ids.Group[0] })
      assert.strictEqual(active, false)
    }

    logOut.call({
      id: teacher
    , d_code: t1_code
    }, callback)
  });

  it("*** Teacher " + teacher_one.id + " connects again ***"
  , async function () {
    const callback = (error, data) => {
      // console.log(data)
      const { logged_in } = Teacher.findOne({ id: teacher })

      assert.strictEqual(logged_in.length, 1)
      assert.strictEqual(logged_in[0], t1_code)
      assert.strictEqual(data.id, teacher)
      assert.strictEqual(data.d_code, t1_code)
      assert.strictEqual(data.loggedIn, 1) // 1, not true
    }

    logInTeacher.call({
      id: teacher
    , d_code: t1_code
    }, callback)
  });

  it("... and joins our new user for a second time..."
  , async function () {
    const callback = (error, data) => {
      // console.log(data)

      assert.strictEqual(data.teacher_logged_in, true)

      const points = Points.find().fetch()
      console.log("Still no points are created:", points)
    }

    toggleActivation.call({
      _id: ids.Group[0]
    , d_code: t1_code
    , active: true
    }, callback)
  });

  it("... but this time it is the new user who leaves"
  , async function () {
    const callback = (error, data) => {
      // console.log(error, data)
      // { id: 'ahwaN4CMgtJsuPf95', d_code: 'EEJxz9N' }
      const select = { _id: ids.Group[0] }
      const options = {
        logged_in: 1
      , active: 1
      }
      const { logged_in, active } = Group.findOne(select, options)


      assert.strictEqual(active, false)
      assert.deepEqual(logged_in, [])
    }

    logOut.call({
      id: ids.User[0]
    , d_code: user_data.d_code
    }, callback)
  });


});
