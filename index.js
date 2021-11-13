const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8ppmn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db('drone-store');
    const productsCollection = database.collection('products');
    const ordersCollection = database.collection('orders');

    // get api for products
    app.get('/drones', async (req, res) => {
      const cursor = await productsCollection.find({}).toArray();
      res.send(cursor);
    });
    // get api of products for specific id
    app.get('/drones/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = await productsCollection.findOne(query);
      res.send(cursor);
    });
    // post api of order
    app.post('/orders', async (req, res) => {
      const orders = req.body;
      const result = await ordersCollection.insertOne(orders);
      res.json(result);
    });
    // get api for order
    app.get('/orders', async (req, res) => {
      const cursor = await ordersCollection.find({}).toArray();
      res.send(cursor);
    });
    // delete api for order
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    });
    // post api for products
    app.post('/products', async (req, res) => {
      const products = req.body;
      const result = productsCollection.insertOne(products);
      res.json(result);
    });
    // delete api for products
    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Running the server!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
