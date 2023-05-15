const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require("jsonwebtoken")
require("dotenv").config()
const app = express();
const PORT = process.env.PORT || 3000;



app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@simple-crud-2023.h8uagaz.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const verifyJwt = (req,res,next) => {
  const authorization = req.headers.authorization;
  if(!authorization){
    return res.status(401).send({error:true,message:"unauthorized access"})
  }
  const token  = authorization.split(' ')[2]
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRECT,(error,decoded) =>{
    if(error){
      return res.status(403).send({error:true,message:"unauthorized access"})
    }
    req.decoded = decoded
    next()
  })
}
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const servicesCollection = client.db("car-doctor").collection("services")
    const ordersCollection = client.db("car-doctor").collection("orders")
    //  jwt
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRECT,
        { expiresIn: "10h" }
      )
      console.log(token)
      res.send({ token })
    })
    //all services
    app.get('/services', async (req, res) => {
      const cursor = await servicesCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    //  single service
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const options = {
        projection: { title: 1, price: 1, service_id: 1, img: 1 },
      };
      const result = await servicesCollection.findOne(query, options)
      res.send(result)
    })

    // orders

    app.get('/orders', verifyJwt, async (req, res) => {
      const decoded = req.decoded
      console.log(decoded , req.query.email)
    if(decoded.email !== req.query?.email){
      return res.status(403).send({error:true,message:"fobiden access"})
    }
      let query = {}
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await ordersCollection.find(query).toArray()
      res.send(result)
    })

    app.post('/orders', async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order)
      res.send(result)
    })

    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = ordersCollection.deleteOne(query)
      res.send(result)
    })


    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("server is running sir vai mia")
})


app.listen(PORT, () => {
  console.log(`app is running on ${PORT}`)
})