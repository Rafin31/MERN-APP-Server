const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const crypto = require('crypto')
const { query } = require('express');
const { send } = require('process');
const port = process.env.PORT || 5000;
require('dotenv').config()

const app = express();

//middleware

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.MONGO_USER_NAME}:${process.env.MONGO_PASSWORD}@organicfoodcluster.sphrf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//JWT Token

function jwtTokenVerify(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ Response: 'Unauthorized Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ Response: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}



const run = async () => {
    try {

        await client.connect()
        const itemCollection = client.db("organicFood").collection("items")
        const baseApiUrl = '/organicFood';


        app.post(`${baseApiUrl}/login`, async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
            // res.send('Test')
        })


        app.get(`${baseApiUrl}/items`, async (req, res) => {
            const query = {}
            const cursor = itemCollection.find(query).sort({ "_id": -1 });
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

        app.delete(`${baseApiUrl}/items/:id`, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const item = await itemCollection.deleteOne(query);
            res.send("Item Deleted")
        })

        app.put(`${baseApiUrl}/items/:id`, async (req, res) => {

            const updatedItemId = req.params.id;
            const item = req.body
            const filter = { _id: ObjectId(updatedItemId) }
            const option = { upsert: false }
            const updatedInfo = {
                $set: {
                    quantity: item.quantity
                }
            }
            const result = await itemCollection.updateOne(filter, updatedInfo, option)
            res.send("Successful")

        })

        app.get(`${baseApiUrl}/myItems`, jwtTokenVerify, async (req, res) => {

            const decodedEmail = req.decoded.email;
            const userEmail = req.query.email;
            if (decodedEmail) {
                const query = { authorEmail: userEmail }
                const cursor = itemCollection.find(query)
                const result = await cursor.toArray()
                res.send(result);
            } else {
                res.status(403).send({ message: 'forbidden access' })
            }

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



