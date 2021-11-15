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
    const usersCollection = database.collection('users');
    const reviewsCollection = database.collection('reviews');

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
    // get api for orders of login user
    app.get('/myOrders', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log(query);
      const cursor = ordersCollection.find(query);
      const result = await cursor.toArray();
      console.log(result);
      res.send(result);
    });
    // post api for users
    app.post('/users', async (req, res) => {
      const user = req.body;
      const cursor = await usersCollection.insertOne(user);
      res.send(cursor);
    });
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      console.log('put', user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    // post api for review
    app.post('/review', async (req, res) => {
      const review = req.body;
      const cursor = await reviewsCollection.insertOne(review);
      res.send(cursor);
    });
    // get api for review
    app.get('/reviews', async (req, res) => {
      const cursor = await reviewsCollection.find({}).toArray();
      res.send(cursor);
    });
    // update status
    app.put('/updateStatus/:id', (req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body.status;
      const result = ordersCollection.find({});
      console.log(result);
      const filter = { _id: ObjectId(id) };
      ordersCollection
        .updateOne(filter, {
          $set: { status: updatedStatus },
        })
        .then((result) => {
          res.send(result);
        });
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
