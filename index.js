const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const { query } = require('express');
const { send } = require('process');
const port = process.env.PORT || 5000;
require('dotenv').config()

const app = express();

//middleware

app.use(cors());
app.use(express.json());



// const mongoUrl = `mongodb+srv://${process.env.MONGO_USER_NAME}:${process.env.MONGO_PASSWORD}@organicfoodcluster.sphrf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// const client = new MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const uri = `mongodb+srv://${process.env.MONGO_USER_NAME}:${process.env.MONGO_PASSWORD}@organicfoodcluster.sphrf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {

        await client.connect()
        const itemCollection = client.db("organicFood").collection("items")
        const baseApiUrl = '/organicFood';


        app.get(`${baseApiUrl}/items`, async (req, res) => {
            const query = {}
            const cursor = itemCollection.find(query);
            const items = await cursor.toArray()
            res.send(items)
        })

        app.post(`${baseApiUrl}/items/addItems`, async (req, res) => {

            const newItem = req.body;
            const insertNewItem = itemCollection.insertOne(newItem)
            res.send("item Added");


        })



        app.get(`${baseApiUrl}/items/:id`, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await itemCollection.findOne(query);
            res.send(item)

        })



        app.get('/', async (req, res) => {
            res.send('This is express server')
        })



    } catch (error) {

    } finally {
        // await client.close()
    }
}

run().catch(console.dir)






app.listen(port, () => {
    console.log("Express is listening in port", port);

})



