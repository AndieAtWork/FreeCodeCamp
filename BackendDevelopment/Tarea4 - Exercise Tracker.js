const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// conexión MongoDB
mongoose.connect(process.env.MONGO_URI)
// schema
const userSchema = new mongoose.Schema({
  username: String
})
// model
const User = mongoose.model('User', userSchema)
const exerciseSchema = new mongoose.Schema({
  description: String,
  duration: Number,
  date: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})
const Exercise = mongoose.model('Exercise', exerciseSchema)

app.get("/api/users", async function (req, res) {
  try {
    const users = await User.find()
    res.json(users)

  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }

});

app.post("/api/users", async function (req, res) {
  try {
    const username = req.body.username
    const user = new User({
      username: username
    })
    await user.save()

    res.json({
      username: user.username,
      _id: user._id
    })

  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }

});

app.post("/api/users/:_id/exercises", async function (req, res) {
  try {
    const userId = req.params._id;
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      })
    }
    
    var username = user.username;
    var description = req.body.description;
    var duration = req.body.duration;
    var date;
    if (req.body.date) {
      date = new Date(req.body.date);
    } else {
      date = new Date();
    }
    date = date.toDateString();

    const exercise = new Exercise({
      description: description,
      duration: parseInt(duration),
      date: date,
      userId: user._id
    })

    await exercise.save()

    res.json({
      username: username,
      description: description,
      duration: parseInt(duration),
      date: date,
      _id: userId
    })

  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
});

app.get("/api/users/:_id/logs", async function (req, res) {
  try {
    var userId = req.params._id;

    const user = await User.findById(userId)
    if (!user) {
      return res.json({
        error: "User not found"
      })
    }

    // query params
    const from = req.query.from
    const to = req.query.to
    const limit = req.query.limit
    
    // filtro base
    let filter = {
      userId: userId
    }

    // filtro de fechas
    if (from || to) {
      filter.date = {}
      if (from) {
        filter.date.$gte = new Date(from)
      }
      if (to) {
        filter.date.$lte = new Date(to)
      }
    }

    // LOGS 6a07be9d6f5ca6750d36da1a
    // {
    //   userId: '6a07be9d6f5ca6750d36da1a',
    //   date: {
    //     '$gte': 1990-01-02T00:00:00.000Z,
    //     '$lte': 1990-01-04T00:00:00.000Z
    //   }
    // }

    // query mongoose
    let query = Exercise.find(filter)

    // limit opcional
    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const exercises = await query

    const log = exercises.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date
    }))

    // respuesta final
    res.json({
      username: user.username,
      count: log.length,
      _id: user._id,
      log: log
    })

  } catch (err) {
    res.status(500).json({
      error: err.message
    })
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
