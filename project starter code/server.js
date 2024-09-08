import express from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util.js';
import { URL } from 'url'; // For validating the URL

// Init the Express application
const app = express();

// Set the network port
const port = process.env.PORT || 8082;

// Use the body parser middleware for post requests
app.use(bodyParser.json());

// @TODO1 IMPLEMENT A RESTFUL ENDPOINT
// GET /filteredimage?image_url={{URL}}
// This endpoint will filter an image from a public URL.
app.get('/filteredimage', async (req, res) => {
  const imageUrl = req.query.image_url;

  if (!imageUrl) {
    return res.status(400).send('image_url is required');
  }

  try {
    new URL(imageUrl);
  } catch {
    return res.status(400).send('Invalid URL');
  }

  try {
    const filteredImagePath = await filterImageFromURL(imageUrl);
    res.sendFile(filteredImagePath, async (err) => {
      if (err) {
        res.status(500).send('Error in sending file');
      } else {
        await deleteLocalFiles([filteredImagePath]);  
      }
    });
  } catch (error) {
    res.status(422).send({ message: 'Unable to process image', error });
  }
});

// Root Endpoint
// Displays a simple message to the user
app.get('/', async (req, res) => {
  res.send('try GET /filteredimage?image_url={{}}');
});

// Start the Server
app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log('press CTRL+C to stop server');
});