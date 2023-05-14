const express = require('express');
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const cors = require('cors');
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

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    
    const servicesCollection = client.db("car-doctor").collection("services")

     app.get('/services' , async (req,res) => {
        const cursor = await servicesCollection.find()
        const result = await cursor.toArray()
        res.send(result)
     } )

    //  single service
    
    app.get('/services/:id' , async (req,res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const options = {
            projection: {  title: 1, price: 1 , service_id:1},
          };
      
        const result = await servicesCollection.findOne(query,options)
        res.send(result) 
    })
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/" , (req,res) => {
    res.send("server is running sir vai mia")
})


app.listen(PORT, () => {
    console.log(`app is running on ${PORT}`)
})