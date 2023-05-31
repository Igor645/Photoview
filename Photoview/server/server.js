const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();

const uri = 'mongodb+srv://marticigor45:admin@picturegallery.7ewmy9r.mongodb.net/PictureGallery';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const port = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.listen(3000, () => console.log('Server running on port 3000'));

app.get('/api/pictures', async (req, res) => {
  try{
  await client.connect();
  const collection = client.db('PictureGallery').collection('Pictures');

  const pageData = await collection.find({}).toArray();
  res.json(pageData);
  }
  catch(err){
    console.log(err);
      res.status(500).send('Internal server error');
  }
});

app.get('/api/searchPictures/:galleryId', async (req, res) => {
  const galleryId = Number(req.params.galleryId);
  try {
    await client.connect();
    const collection = client.db('PictureGallery').collection('Pictures');

    const pictures = await collection.find({galleries: galleryId}).toArray();
    res.json(pictures);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

app.get('/api/galleries', async (req, res) => {
  try{
  await client.connect();
  const galleries = client.db('PictureGallery').collection('Galleries');
  const pageData = await galleries.find({}).toArray();
  res.json(pageData);
  }
  catch(err){
    console.log(err);
      res.status(500).send('Internal server error');
  }
});

app.get('/api/galleries/pictureSearch/:galleryId', async (req, res) => {
  const galleryId = Number(req.params.galleryId);
  try {
    await client.connect();
    const collection = client.db('PictureGallery').collection('Pictures');

    // Find the document with the specified characterId
    const query = {
      galleries: { $elemMatch: { $eq: galleryId } }
    };    
    
    const result = await collection.findOne(query);
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

app.get('/api/pictures/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  await client.connect();
  const collection = client.db('PictureGallery').collection('Pictures');
  // Find the picture that matches the ID
  const picture = await collection.findOne({pictureId: id});

  if (picture) {
    res.json(picture);
  } else {
    res.status(404).json({ error: 'Picture not found' });
  }
});

app.put('/api/pictures/:pictureId/addToGallery/:galleryId', async (req, res) => {
  await client.connect();
  const collection = client.db('PictureGallery').collection('Pictures');
  const { pictureId, galleryId } = req.params;

  // Find the picture by its ID
  const picture = await collection.findOne({ pictureId: Number(pictureId) });

  if (!picture) {
    return res.status(404).json({ error: 'Picture not found' });
  }

  // Convert the galleryId to a number and add it to the galleries array
  picture.galleries.push(Number(galleryId));

  // Update the picture in the collection
  await collection.updateOne({ pictureId: Number(pictureId) }, { $set: picture });

  return res.json({ success: true, message: 'Gallery added to picture successfully' });
});

app.post('/api/Pictures/add', async (req, res) => {
  try {
    var picture = req.body;
    await client.connect();
    const collection = client.db('PictureGallery').collection('Pictures');

    const count = await collection.countDocuments();
    picture.pictureId = count + 1;
    // Insert the new picture into the collection
    const result = await collection.insertOne(picture);
    
    // Return the pictureId along with the result
    res.json({ pictureId: picture.pictureId, result });

  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

app.post('/api/Galleries/add', async (req, res) => {
  try {
    var gallery = req.body;
    await client.connect();
    const collection = client.db('PictureGallery').collection('Galleries');

    const count = await collection.countDocuments();
    gallery.galleryId = count + 1;
    // Insert the new picture into the collection
    const result = await collection.insertOne(gallery);
    
    // Return the pictureId along with the result
    res.json({ galleryId: gallery.galleryId, result });

  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  }
});

app.delete('/api/deletePictures/:pictureId', async (req, res) => {
  try {
    const pictureId = parseInt(req.params.pictureId);

    await client.connect();
    const picturesCollection = client.db('PictureGallery').collection('Pictures');
    const galleriesCollection = client.db('PictureGallery').collection('Galleries');

    // Find the picture by pictureId
    const picture = await picturesCollection.findOne({ pictureId });

    if (!picture) {
      return res.status(404).json({ error: 'Picture not found' });
    }

    // Check if the picture is the only one with each galleryId
    const galleryIdsToDelete = [];
    const { galleries } = picture;
    for (const galleryId of galleries) {
      const count = await picturesCollection.countDocuments({
        pictureId: { $ne: pictureId },
        galleries: galleryId
      });

      if (count === 0) {
        galleryIdsToDelete.push(galleryId);
      }
    }

    // Delete the picture
    await picturesCollection.deleteOne({ pictureId });

    // Decrement pictureIds that are larger than the deleted pictureId
    await picturesCollection.updateMany(
      { pictureId: { $gt: pictureId } },
      { $inc: { pictureId: -1 } }
    );

    // Delete the galleries with no other pictures
    for (const galleryId of galleryIdsToDelete) {
      await galleriesCollection.deleteOne({ galleryId: galleryId });

      await galleriesCollection.updateMany(
        { galleryId: { $gt: galleryId } },
        { $inc: { galleryId: -1 } }
      );

      // Decrement galleryIds in pictures' galleries arrays that are larger than the deleted galleryId
      await picturesCollection.updateMany(
        { galleries: { $gt: galleryId } },
        { $inc: { "galleries.$": -1 } }
      );
    }

    res.sendStatus(204);
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal server error');
  } finally {
    await client.close();
  }
});
