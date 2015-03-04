var express = require("express");
var exec = require("child_process").exec;
var rss = require("rss");
var bpdk = require("./crawlers/bpdk");

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
    "bpdk": bpdk
};

app.get("/:profid", function(req, res) {
    if(profiles.hasOwnProperty(req.params.profid)) {
        var profile = profiles[req.params.profid];
        exec(profile.curl, function(err, stdout, stderr) {
            if(!err) {
                var data = profile.scrape(stdout);

                var feed = new rss({
                    title: profile.title,
                    description: profile.description,
                    site_url: profile.site_url,
                    image_url: profile.image_url,
                    ttl: 1 // minute (time-to-live)
                });

                data.forEach(function(item) {
                    feed.item(item);
                });

                res.send(feed.xml());
            }
        });
    } else {
        res.status(400).send("Invalid profile ID");
    }
});

var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port)
});