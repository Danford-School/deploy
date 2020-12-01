//Full Stack Final Project
//Authors: Stephanie Beagle and Danford Compton 

const express = require('express'); 
const requestHandler = require('./requestHandler');
const request = require('request');
const fs = require('fs'); 
const path = require('path'); 
const router = express.Router();
const port = 3000; 
const app = express();
const url = "https://api.imgflip.com/get_memes";

// Code for using Pug. It will set off some errors it's just copy/pasted. 

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views")); 

app.get('/', (req, res) => {
  requestHandler.make_API_call(url) //see requestHandler.js 
  .then(response => {
  // res.json(response); // this prints the raw json data to the browser if you need that for testing 
   var length = response.data.memes.length; //24
   //console.log(length); 
   writeHomepage(length, response.data.memes);
  // This is for using pug 
   res.render('index'); 
   })
})

// Edit page redirect 
app.get('/makememe', (req,res) => {
  // todo: url parsing 
  //var imgurl; // need to retrieve imgurl from parsing code 
  //writeEditPage(imgurl); 
  res.render('index1'); 

}) 
//app.use("/", router); // more Pug stuff 
app.listen(port, () => console.log('App listening on port 3000'));


function writeEditPage(imgurl) {
  var pugtxt = "doctype html\nhtml\n\thead\n\t\tstyle\n\t\t\tinclude homepage.css\n\t\tscript.\n\t\t\tsrc=\"index.js\"\n\tbody\n\t\tdiv.header\n\t\t\th1.title Edit\n\t\th2.text Customize captions for your selected image";
  pugtxt += "\n\t\tdiv.container\n\t\t\timgsrc=\"https://i.imgflip.com/1c1uej.jpg\""; 
}
// takes the array of data from the JSON body & the length of the array as arguments
// and writes homepage.html with the corresponding data  
function writeHomepage(length, data) {

  var gotoURL = "/makememe/"

 // var html = '<!DOCTYPE html><html><head><link rel="stylesheet" href="homepage.css"><script>src="index.js"</script><meta charset="utf-8"/></head><body><table class = "grid" id = "table"><h1 class = "title">Meme Maker</h1><tr>'; //head of html file
  var pugtxt = "doctype html\nhtml\n\thead\n\t\tstyle\n\t\t\tinclude homepage.css\n\t\tscript.\n\t\t\tsrc=\"index.js\"\n\tbody\n\t\tdiv.header\n\t\t\th1.title Meme Maker\n\t\th2.text To get started, select an image from the gallery below!\n\t\ttable#table.grid\n\t\t\ttbody\n\t\t\t\ttr";
  for(var i = 0; i < length; i++) {
    if(i%4 === 0 && i!=0){ // Makes a row of 4, replace 4 with anything you want 
      //html += '</tr><tr>'; 
      pugtxt += "\n\t\t\t\ttr"
    }
    //html += '<td class = "meme_box"><img src="' + data[i].url + '"></td>';
   // pugtxt += "\n\t\t\t\t\ttd.meme_box a(href =\"" + gotoURL + data[i].template_id + "\")";
   // pugtxt += "\n\t\t\t\t\t\ta(href ='" + gotoURL + data[i].template_id + "')"; 
    pugtxt += "\n\t\t\t\t\ttd.meme_box"
    pugtxt += "\n\t\t\t\t\t\timg(src=\"" + data[i].url + "\")";
  }
  //html += '</tr>';
  //html += '</table>'; 
  //html += '</body></html>';
  //console.log(html); // just for testing if you want to 
  //write pugtxt to the index.pug file, it will overwrite the previous html on each run
  fs.writeFile(path.join(__dirname + 'views/index.pug'), pugtxt, err => {
   if(err) {
     console.error(err);
     return; 
   }
  })
} 

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

//app.listen(port, () => console.log('App listening on port 3000'));

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
