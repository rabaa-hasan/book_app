'use strict';

const express = require('express'); 
require('dotenv').config(); 

const cors = require('cors'); 

const server = express();

server.set('view engine','ejs');
server.use(express.static('./public'))




const PORT = process.env.PORT || 3030;



server.use(express.static(__dirname + '/public'));
server.set('view engine', 'ejs');

server.get('/searches/new', (req,res) => {
    res.render('pages/searches/new.ejs');
  });
  server.post('/searches', (req, res) => {
    let bookSearch = req.body.bookSearch;
    let search = req.body.search;
    let url = `https://www.googleapis.com/books/v1/volumes?q=in${search}:${bookSearch}`;
    superagent.get(url)
      .then(returnData => {
        const bookArr = returnData.body.items.map(bookSearch => new Books(bookSearch));
        console.log(bookArr);
        res.render('pages/searches/show.ejs', {bookArr: bookArr});
      })
      .catch(error => {
        console.log(error);
        res.status(500).send('Sorry something whent wrong with bringing your books back, please pay the fee');
      });
  });

function Books(object) {
    this.author = object.volumeInfo.authors;
    this.title = object.volumeInfo.title;
    this.isbn = object.volumeInfo.industryIdentifiers[1] ? object.volumeInfo.industryIdentifiers[1].type + object.volumeInfo.industryIdentifiers[1].identifier : 'NOT AVAILABLE';
    this.image = object.volumeInfo.imageLinks ? object.volumeInfo.imageLinks.smallThumbnail.replace(/^http:\/\//i, 'https://') : 'https://i.imgur.com/J5LVHEL.jpg';
    this.description = object.volumeInfo.description;
  }
  

server.listen(PORT,()=>{
    console.log(`Listening on PORT ${PORT}`)
})
