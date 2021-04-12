'use strict';

const express = require('express'); 
require('dotenv').config(); 

const cors = require('cors'); 

const server = express();

server.set('view engine','ejs');
server.use(express.static('./public'))

const PORT = process.env.PORT || 3030;

server.listen(PORT,()=>{
    console.log(`Listening on PORT ${PORT}`)
})
