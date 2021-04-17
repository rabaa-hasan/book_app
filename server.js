'use strict';

const express = require('express'); 
require('dotenv').config(); 

const cors = require('cors'); 

const server = express();

const pg = require('pg');

server.set('view engine','ejs');
server.use(express.static('./public'))




const PORT = process.env.PORT || 3030;
const client = new pg.Client(process.env.DATABASE_URL);



server.set('view engine', 'ejs');

server.get('/', renderHomePage);

server.get('/searches/new', renderSearchPage);

server.post('/searches', createSearch);

server.get('/books/:id', renderDetails);

server.post('/books', addToDatabase);

server.put('/books/:id', updateDetails);

server.delete('/books/:id', deleteBook);


server.use(express.static(__dirname + '/public'));
server.set('view engine', 'ejs');

function renderHomePage(req, res) {
  let SQL = `SELECT * FROM books`;
  client.query(SQL)
    .then(results => {
      res.render('pages/index.ejs', {books: results.rows});
    })
    .catch(err => errorHandler(err, req, res));
}

function renderSearchPage (req, res) {
  res.render('pages/searches/show.ejs');
}

function createSearch (req, res) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if (req.body.search[1]==='title') { url += `+intitle:${req.body.search[0]}`; }

  if (req.body.search[1]==='author') { url += `+inauthor:${req.body.search[0]}`; }

  superagent.get(url)
    .then(results => {
      const bookArr = results.body.items.map(book => {
        return new Book(book);
      });
      res.render('pages/searches/show.ejs', {books: bookArr, edit: false});
    })
    .catch((err) => {
      errorHandler(err, req, res);
    });
}

function renderDetails (req, res) {
  let id = req.params.id;
  let values = [id];

  let book;
  let bookshelves;

  let SQL = `SELECT *
            FROM books
            WHERE id=$1`;
  let SQL2 = `SELECT DISTINCT bookshelf FROM books`;
  client.query(SQL, values)
    .then(result => {
      book = result.rows[0];
    })
    .then(() => {
      client.query(SQL2)
        .then(result => {
          console.log('result:', result.rows);
          bookshelves = result.rows;
          console.log('bookshelves:', bookshelves);
          res.render('pages/searches/show.ejs', {book: book, bookshelves: bookshelves, edit: true});
        });
    })
    .catch(err => errorHandler(err, req, res));
}

function addToDatabase (req, res) {
  let SQL = `INSERT INTO books
            (author, title, isbn, image_url, description)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`;
  const values = [req.body.author, req.body.title, req.body.isbn, req.body.image_url, req.body.description];

  client.query(SQL, values)
    .then(() => {
      res.redirect('/');
    })
    .catch(err => errorHandler(err, req, res));
}

function updateDetails (req, res) {
  let id = req.params.id;
  const { title, author, isbn, image_url, description, bookshelf} = req.body;

  let SQL = 'UPDATE books SET title=$1, author=$2, isbn=$3, image_url=$4, description=$5, bookshelf=$6 WHERE id = $7';
  let values = [title, author, isbn, image_url, description, bookshelf, id];

  client.query(SQL, values)
    .then(() => {
      res.redirect(`/books/${id}`);
    })
    .catch(err => errorHandler(err, req, res));
}

function deleteBook(req, res) {
  let id = req.params.id;
  let SQL = 'DELETE FROM books WHERE id=$1';
  let values = [id];
  client.query(SQL, values)
    .then(() => {
      res.redirect('/');
    })
    .catch(err => errorHandler(err, req, res));
}

function Books(object) {
    this.author = object.volumeInfo.authors;
    this.title = object.volumeInfo.title;
    this.isbn = object.volumeInfo.industryIdentifiers[1] ? object.volumeInfo.industryIdentifiers[1].type + object.volumeInfo.industryIdentifiers[1].identifier : 'NOT AVAILABLE';
    this.image = object.volumeInfo.imageLinks ? object.volumeInfo.imageLinks.smallThumbnail.replace(/^http:\/\//i, 'https://') : 'https://i.imgur.com/J5LVHEL.jpg';
    this.description = object.volumeInfo.description;
  }
  
  function errorHandler(err, req, res) {
    res.status(500).render('pages/error.ejs', {error: err});
  }
  

server.listen(PORT,()=>{
    console.log(`Listening on PORT ${PORT}`)
})
