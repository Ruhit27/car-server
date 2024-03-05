const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const data = require('./baller.json')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cookieParser = require('cookie-parser');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;;

app.use(cors({
    origin :["http://localhost:5173" ],
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send(data)
})


// const uri = `mongodb+srv://${process.env.user}:${process.env.pass}@todays-date.r1b2kle.mongodb.net/?retryWrites=true&w=majority&appName=todays-date`;
const uri = `mongodb+srv://john:123@todays-date.r1b2kle.mongodb.net/?retryWrites=true&w=majority&appName=todays-date`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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

        const serviceCollection = client.db('Car').collection('services')
        const bookingsCollection = client.db('Car').collection('bookings')

    //    auth related api

    app.post('/jwt', async (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.access_token, { expiresIn: '1h' });
    
        console.log("Generated token:", token); // Add this to check the token output
    
        res.cookie('token', token, {
            httpOnly: true,
            secure: false, // Consider setting this to true if you're using HTTPS
            sameSite: 'none' // Adjust according to your requirements
        }).send({ success: true });
    });

        // service related api
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/services/:id', async (req, res) => {
            
                const id = req.params.id;
                const query = { _id: id}
                const option = {projection  : {title :1,price :1,img:1}}
                const result = await serviceCollection.findOne(query,option)
                res.send(result)
            
        })

        // bookings related api
        app.post('/bookings',async(req,res)=>{
            const book = req.body;
            // console.log(book)
            const result = await bookingsCollection.insertOne(book)
            res.send(result)

        })

        app.get('/bookings',async(req,res)=>{
            const result = await bookingsCollection.find().toArray()
            res.send(result)
        })

        app.get('/bookings/:email', async (req, res) => {
            const email = req.params.email;
            console.log('tok tokeennn',req.cookies.token)
            // console.log(email);
            // Correct the query syntax here
            const query = { "order.email": email };
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        });

        app.delete('/bookings/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id : new ObjectId(id) }
            const result = await bookingsCollection.deleteOne(query)
            res.send(result)
        })
        

       

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})