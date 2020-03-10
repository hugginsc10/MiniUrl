require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl')
const app = express();

const uri = `mongodb+srv://admin:${process.env.DB_PASS}@url-database-ftief.mongodb.net/test?retryWrites=true&w=majority`

mongoose.connect(uri, {
  useNewUrlParser: true, useUnifiedTopology: true
})
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.log(err))

app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: false }))

app.get('/', async (req, res) => {
  const shortUrls = await ShortUrl.find()
  res.render('index', { shortUrls: shortUrls })
})
app.post('/shortUrls', async (req, res) => {
  await ShortUrl.create({ full: req.body.fullUrl })
  res.redirect('/')
})

app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
  if (shortUrl == null) return res.sendStatus(404)

  shortUrl.clicks++
  shortUrl.save()

  res.redirect(shortUrl.full);
})

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('/', async (req, res) => {
    const shortUrls = await ShortUrl.find()
    res.render('index', {
      shortUrls: shortUrls
    })
  })
}
app.listen(process.env.PORT || 5000);