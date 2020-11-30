//Full Stack Final Project
//Authors: Stephanie Beagle and Danford Compton 

const express = require('express'); 
const requestHandler = require('./requestHandler');
const path = require('path');
const fs = require('fs'); 
const port = 3000; 
const app = express();
const url = 'https://api.imgflip.com/get_memes'; 
const request = require('request'); 
const posturl = 'api.imgflip.com/caption_image?'
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


app.get('/', (req, res) => {
  requestHandler.make_API_call(url) //see requestHandler.js 
  .then(response => {
  // res.json(response); // this prints the raw json data to the browser if you need that for testing 
   var length = response.data.length; //24
   var html = '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body><table class = "grid" id = "table"><tr>'; //head of html file
   for(var i = 0; i < length; i++) {
     if(i%5 === 0 && i!=0){
       html += '</tr><tr>'; 
     }
     html += '<td class = "meme_box"><img src="' + response.data[i].image + '"></td>';
   }
   //console.log(html); 
   html += '</tr>'; 
   html += '</table>'; 
   html += '</body></html>';
   //write html to the homepage.html file, it will overwrite the previous html on each run
   fs.writeFile(path.join(__dirname + '/homepage.html'), html, err => {
    if(err) {
      console.error(err);
      return; 
    }
  }); 
  //this is supposed to serve the html page in the browser but I can't seem to make it work just yet
  res.sendFile(path.join(__dirname +'/homepage.html'));
  })
  .catch(error => {
    res.send(error)
  })
})

//this is to retrieve saved memes from the database
//it needs the username and password
app.get('/dbsaved', async (req, res) => { 
  try { 
    const client = await pool.connect();
    const result = await client.query(`SELECT saved_urls FROM userStorage WHERE user_name = ${req.name} AND user_password = ${req.password}`); 
    const results = { 'results': (result) ? result.rows : null}; 
   //below is for testing, we need to send the results somewhere
    //res.render('pages/db', results); 
    client.release();
  } catch (err) { 
    console.error(err);
    res.send("Error " + err); 
  }
})

//this is to add a user to the database
//it needs the username and password
app.get('/dbadduser', async (req, res) => { 
  try { 
    const client = await pool.connect();
    const result = await client.query(`INSERT INTO userStorage(user_name, user_password) VALUES (${req.name}, ${req.password}`); 
    const results = { 'results': (result) ? result.rows : null}; 
   //below is for testing, we need to send the results somewhere
    //res.render('pages/db', results); 
    client.release();
  } catch (err) { 
    console.error(err);
    res.send("Error " + err); 
  }
})

//this is to add a meme in a user's saved memes. 
//it needs the url of the created meme, username, and password
app.get('/dbaddmeme', async (req, res) => { 
  try { 
    const client = await pool.connect();
    const result = await client.query(`UPDATE userStorage SET saved_urls = ${req.url} || saved_urls WHERE user_name = ${req.name} AND user_password = ${req.password}`); 
    const results = { 'results': (result) ? result.rows : null}; 
   //below is for testing, we need to send the results somewhere
    //res.render('pages/db', results); 
    client.release();
  } catch (err) { 
    console.error(err);
    res.send("Error " + err); 
  }
})

//this will delete the user and their saved items from the database 
//it needs the username and password
app.get('/dbremoveuser', async (req, res) => { 
  try { 
    const client = await pool.connect();
    const result = await client.query(`DELETE FROM userStorage WHERE user_name = ${req.name} AND user_password = ${req.password}`); 
    const results = { 'results': (result) ? result.rows : null}; 
   //below is for testing, we need to send the results somewhere
    //res.render('pages/db', results); 
    client.release();
  } catch (err) { 
    console.error(err);
    res.send("Error " + err); 
  }
})

//this will delete a saved meme from a user's collection
//it needs the url of the created meme, username, and password
app.get('/dbdeletememe', async (req, res) => { 
  try { 
    const client = await pool.connect();
    const result = await client.query(`UPDATE userStorage SET saved_urls = array_remove(saved_urls, ${req.url}) WHERE user_name = ${req.name} AND user_password = ${req.password}`); 
    const results = { 'results': (result) ? result.rows : null}; 
   //below is for testing, we need to send the results somewhere
    //res.render('pages/db', results); 
    client.release();
  } catch (err) { 
    console.error(err);
    res.send("Error " + err); 
  }
})

app.listen(port, () => console.log('App listening on port 3000'));

//when fed a search term and the array of names with urls, this should send back an array of names and urls that match
var searchMemes = function (theData, searchParameter) { 
  var results;   
  for(var i = 0; i < theData.length; i++) { 
    if(theData[i]['name'].includes(searchParameter) ) { 
        results.push(theData[i]); 
    }
  }
  return results; 
}

//when fed the path of a specific image (with full path) this will download said image to your computer. 
const download = (url, path, callback) => { 
  request.head(url, (err, res, body) => {
    request(url) 
      .pipe(fs.createWriteStream(path))
      .on('close', callback)
  })
}

//this is the post to create a new meme based on a template. It needs the id# of the meme, the bottom text and the top text
function makePost(id, text0, text1) {
  postSuccessHandler = null;

  //made data
  postData = {
    template_id: id,
    username: "Danfjord",
    password: "4FullStack",
    text0: text0,
    text1: text1,
  };

  //create post
  postConfig = {
    url: posturl,
    form: postData,
  };

  //change this when we know where we are sending info
  postSuccessHandler = function (err, httpResponse, body) { 
    console.log(body)
  }

  //this actually does the thing. 
  request.post(postConfig, postSuccessHandler); 
}

