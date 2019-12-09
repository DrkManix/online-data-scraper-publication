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

// GUARDIAN SCRAPER: access by going to 'localhost:9999/guardian'
app.get('/guardian', function(req, res) {

  var url = "https://www.nytimes.com/search?query=police";

  // let's make the http request to the url above using the 'request' dependency
  request(url, function(error, response, html) {

    // only execute if there's no error
    if( !error ){

      // we can use the dependency 'cheerio' to traverse the DOM and use jQuery-like selectors and functions
      var $ = cheerio.load(html);

      var item_output = [];
      $('li[data-testid="search-bodega-result"]').filter(function(){
            // we can access the properties of our javascript object by writing the name of the object 'dot' and then the name of the property
            item_output.push( { title: $(this).find('h4').text(),
                                img: $(this).find('img').attr('src') } )
          });

      // send the data we've stored in our object back to the browser
      res.send(item_output);

      fs.writeFile('guardian_output.js', "var guardian_output = " + JSON.stringify(  item_output ), function(error){
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

      for ( var i = 0; i < instagram_data.graphql.hashtag.edge_hashtag_to_media.edges.length; i++ ) {
        instagram_urls[i] = instagram_data.graphql.hashtag.edge_hashtag_to_media.edges[i].node.display_url;

        download_file_curl(instagram_data.graphql.hashtag.edge_hashtag_to_media.edges[i].node.display_url);

        // fs.createWriteStream([i]+'.jpg', instagram_data.graphql.hashtag.edge_hashtag_to_media.edges[i].node.display_url, function(err){
        //    console.log('File is written successfully!');
        //  });
      }

      // send the data we've stored in our array back to the browser
      res.send(instagram_urls);

      // save the data we've stored in our object on our machine
      fs.writeFile('instagram_output.js', "var instagram_output = [" + JSON.parse($.text()) + "]" , function(error){
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


app.get('/guten', function(req, res) {

  var url = 'https://www.gutenberg.org/browse/scores/top';

  request(url, function(error, response, html) {
    if (!error) {

      var guten_data = []

      var $ = cheerio.load(html);

      $('h2#books-last1 + ol').filter(function() {
        $(this).find('a').each(function(i, element) {

          // guten_data[i] = $(this).text();
          guten_data[i] = $(this).attr('href');

        });
      });

      res.send(guten_data);
      fs.writeFile('guten_output.js', "var guten_output = [" +  JSON.stringify( guten_data ) + "]", function(error){
        console.log("file is written successfully");
      });

    }
  });

});

app.listen(port);
console.log('Magic happens on port ' + port);
exports = module.exports = app;
