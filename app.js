// storing dependencies in variables
var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');
var url = require('url');

var port = 9999;
var app = express();

var DOWNLOAD_DIR = './';

// WIKIPEDIA SCRAPER: access by going to 'localhost:2100/wikipedia'
app.get('/wikipedia', function(req, res) {

  var url = "https://en.wikipedia.org/wiki/Phyllotaxis";

  // let's make the http request to the url above using the 'request' dependency
  request(url, function(error, response, html) {

    // only execute if there's no error
    if( !error ){

      // we can use the dependency 'cheerio' to traverse the DOM and use jQuery-like selectors and functions
      var $ = cheerio.load(html);

      // let's create a javascript object to save our data in
      var wiki_data = {
        title: '',
        img: '',
        paragraph: ''
      };

      // all the content we are looking for are inside a div with the id 'content', let's filter so that the data we are working with is without unnecessary data
      $('#content').filter(function(){

        // we can access the properties of our javascript object by writing the name of the object 'dot' and then the name of the property
        wiki_data.title = $(this).find('h1').text();
        wiki_data.img = $(this).find('img').attr('src');
        wiki_data.paragraph = $(this).find('p').first().text();

      });

      // send the data we've stored in our object back to the browser
      res.send(wiki_data);

      fs.writeFile('./data/wiki_output.js', "var wiki_output = " + JSON.stringify(wiki_data), function(error){
        console.log("File is written successfully!");
      });
    }
  });
});

app.get('/wikihow', function(){
  var keywords = ["love", "cry", "hug"];
  var urls = [];

  for(word in keywords) {

    http.get("https://www.wikihow.com/wikiHowTo?search=" + word, function(response) {
      response.on('data', function(chunk){
        var $ = cheerio.load(chunk);

        $('a.result_link').each(function(index, element){
          urls[index] = $(this).attr('href');
        });
      });

    });

    }

  if(urls.length > 0) {
    for(url in urls) {

    }
  }

});







// IMDB SCRAPER: access by going to 'localhost:2100/imdb'
app.get('/imdb', function(req, res) {

  var words = [];
  var myWords = cheerio.load(fs.readFileSync('MyActivity.html'));

  myWords.find('.content-cell a').each(function(i, elem){
    if(myWords(this).text().includes("definition")) {

      data = {
        word: myWords(this).text(),
        description: ''
      };

      words[i] = data;

    }

  });

  for(word in words) {
    http.get("https://www.merriam-webster.com/dictionary/" + words[i].word, function(res) {
      var $ = cheerio.load(res);
      $('#dictionary-entry-1').text();
    });

    }

  // var url = "https://www.imdb.com/chart/top";



  // let's make the http request to the url above using the 'request' dependency
  request(url, function(error, response, html) {

    // only execute if there's no error
    if(!error){

      // we can use the dependency 'cheerio' to traverse the DOM and use jQuery-like selectors and functions
      var $ = cheerio.load(html);

      // all the content we are looking for are inside a div with the class 'lister', let's filter so that the data we are working with is without unnecessary data
      $('.postbody').filter(function(){

        // there are a lot of 'tr' elements and for each of the 'tr' element we want to execute a function
        $(this).find('p').each(function(index, element) {

          for(var i = 0; i > names.length; i++) {

            var result = $(this).text().split(names[i]);

            if(result[0] === "PHOEBE") {
              phoebe_data.push(result[1]);
            } else if(result[0] === "JOEY") {
              joey_data.push(result[1]);
            } else if(result[0] === "RACHEL") {
              rachel_data.push(result[1]);
            }

          }


        });
      });

      // send the data we've stored in our array back to the browser
      res.send(imdb_data);

      // save the data we've stored in our object on our machine
      fs.writeFile('./data/imdb_output.js', "var imdb_output = [" + imdb_data + "]" , function(error){
        console.log("File is written successfully!");
      });

    }
  });
});

// INSTAGRAM SCRAPER: access by going to 'localhost:2100/instagram'
app.get('/instagram', function(req, res){

  // try any hashtags and see the results, make sure to write INSIDE the quotation marks
  var hashtag = 'police';
  var url = 'https://instagram.com/explore/tags/'+ hashtag +'/?__a=1';

  // let's make the http request to the url above using the 'request' dependency
  request(url, function(error, response, html) {

    // only execute if there's no error
    if(!error) {

      // we can use the dependency 'cheerio' to traverse the DOM and use jQuery-like selectors and functions
      var $ = cheerio.load(html);

      // the url actually gives back already a ready to use JSON object so we just want that raw text
      var instagram_data = JSON.parse($.text());
      var instagram_urls = [];

      for(var i = 0; i < instagram_data.graphql.hashtag.edge_hashtag_to_media.edges.length; i++) {
        instagram_urls[i] = instagram_data.graphql.hashtag.edge_hashtag_to_media.edges[i].node.display_url;

        download_file_curl(instagram_data.graphql.hashtag.edge_hashtag_to_media.edges[i].node.display_url);

        // fs.createWriteStream('./data/'+[i]+'.jpg', instagram_data.graphql.hashtag.edge_hashtag_to_media.edges[i].node.display_url, function(err){
        //   console.log('File is written successfully!');
        // });
      }

      // send the data we've stored in our array back to the browser
      res.send(instagram_urls);

      // save the data we've stored in our object on our machine
      fs.writeFile('instagram_output.js', "var instagram_output = [" + instagram_data + "]" , function(error){
        console.log("File is written successfully!");
      });
    }
  });
});

var download_file_curl = function(file_url) {
  // extract the file name
  var file_name = url.parse(file_url).pathname.split('/').pop();
  // create an instance of writable stream
  var file = fs.createWriteStream(DOWNLOAD_DIR + file_name);
  // execute curl using child_process' spawn function
  var curl = spawn('curl', [file_url]);
  // add a 'data' event listener for the spawn instance
  curl.stdout.on('data', function(data) { file.write(data); });
  // add an 'end' event listener to close the writeable stream
  curl.stdout.on('end', function(data) {
    file.end();
    console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);
  });
  // when the spawn child process exits, check if there were any errors and close the writeable stream
  curl.on('exit', function(code) {
    if (code != 0) {
      console.log('Failed: ' + code);
    }
  });
};


app.get('/twitch', function(req, res){
  request('https://www.youtube.com/watch?v=28HABZJ358g', function(error, response, html){

    res.send(html);

  });
});

app.get('/guten', function(req, res) {

  var url = 'https://www.gutenberg.org/browse/scores/top';

  request(url, function(error, response, html) {
    if (!error) {

      var guten_data = []

      var $ = cheerio.load(html);

      $('h2#books-last1 + ol').filter(function() {
        $(this).find('a').each(function(i, element) {

          // guten_data[i] = $(this).text();
          guten_data[i] = "'" + $(this).attr('href') + "'";

        });
      });

      res.send(guten_data);
      fs.writeFile('guten_output.js', "var guten_output = [" + guten_data + "]", function(error){
        console.log("file is written successfully");
      });

    }
  });

});

app.listen(port);
console.log('Magic happens on port ' + port);
exports = module.exports = app;
