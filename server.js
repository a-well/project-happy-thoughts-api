import express from "express"
import cors from "cors"
import mongoose from "mongoose"

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const port = process.env.PORT || 8080;
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())

const ThoughtSchema = new mongoose.Schema({
  message: {
    type: String,
    minlength: 2,
    maxlength: 140,
    required: true,
    trim: true
  },
  hearts: {
    type: Number,
    default: 0
  },
  name: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: () => new Date()
  }
})

const Thought = mongoose.model("Thought", ThoughtSchema)

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!")
})

app.get("/thoughts", async (req, res) => {
  try {
    const thoughtsToReturn = await Thought.find().sort({ createdAt: -1 }).limit(20)

    res.status(200).json(thoughtsToReturn)
  } catch (error) {
    console.log(error)
    res.status(400).json({
      success: false,
      body: { 
        message: error 
      }
    })
  }
})

app.post("/thoughts", async (req, res) => {
  const {message, name } = req.body
  try {
    const newThought = await new Thought({ message, name }).save()
    res.status(201).json({success: true, res: newThought})
  } catch (e) {
    console.log(e)
    res.status(400).json({ success: false, response: e })
  }
})

app.post('/thoughts/:thoughtId/like', async (req, res) => {
  // Hämta ut vilket id vi vill likea
  const thoughtId = req.params.thoughtId

  // Hämta ut den thoughten med det idt
  let thoughtToLike
  try { 
    const filter = {_id: thoughtId}
    const update = { $inc : {'hearts': 1} }

    thoughtToLike = await Thought.findOneAndUpdate(filter, update, {
      returnOriginal: false
    })

    if (!thoughtToLike) {
      res.json({
        success: false,
        error: 'Like failed. No such thought ID in the database. Try /thoughts to list available thoughts'
      })
      return
    }
  
    // skicka tillbaka thoughten i responsen
    res.json(thoughtToLike)
  } catch (error) {
    console.log(error)

    res.json({
      success: false,
      error: error
    })
  }
})


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})