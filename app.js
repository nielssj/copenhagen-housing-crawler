var express = require("express");
var rss = require("rss");
var mongoose = require("mongoose");

var db = require("./data/database")(mongoose);
var models = require("./data/data_model")(mongoose);

/**
 * Created by niels on 2/26/15.
 *
 * TODO:
 *  - Cron-like loop in a separate process that polls continuously and stores results in MongoDB
 *  - Make these endpoints serve content from MongoDB
 *  - More crawlers
 *      - http://www.lejebolig.dk/  (Response HTTP, but otherwise ok API. Use cheerio.js to scrape)
 *      - http://minlejebolig.dk/
 *  - Statistics on historic data
 *
 *  Ideas (NICE-TO-HAVE)
 *  - Make cURL configurable in a generic way (i.e. multiple crawlers same search criteria)
 *  - Endpoints for sending generic applications with placeholders (e-mail or whatever POST mechanism the site offers)
 */

var app = express();

var profiles = {
    "bpdk": require("./crawlers/bpdk")
};

app.get("/:profid", function(req, res) {
    if(profiles.hasOwnProperty(req.params.profid)) {
        var profile = profiles[req.params.profid];
        models.Apartment.find({"_id": { "$regex": "bpdk-.+"}}, function(err, data) {
            if(!err) {
                var feed = new rss({
                    title: profile.title,
                    description: profile.description,
                    site_url: profile.site_url,
                    image_url: profile.image_url,
                    ttl: 1 // minute (time-to-live)
                });

                data.forEach(function(apartment) {
                    feed.item(apartment.feedItem);
                });

                res.send(feed.xml());
            } else {
                console.log("Failed to execute database query: " + err);
                res.status(500).send("Internal error");
            }
        })
    } else {
        res.status(400).send("Invalid profile ID");
    }
});

var startServer = function() {
    var server = app.listen(8080, function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log('Example app listening at http://%s:%s', host, port);
    });
};

db.connect(startServer());