var exec = require("child_process").exec;
var mongoose = require("mongoose");

var db = require("./data/database")(mongoose);
var bpdk = require("./crawlers/bpdk");
var models = require("./data/data_model")(mongoose);

/**
 * Created by niels on 3/5/15.
 *
 * Polls one or more housing sites continuously for listings
 */

var profiles = {
    "bpdk": bpdk
};

var pollLoop = function() {
    var profile = profiles["bpdk"];
    exec(profile.curl, function(err, stdout, stderr) {
        if(!err) {
            var entries = profile.apartments(stdout);
            entries.forEach(function(entry) {
                var uuid = profile.guid(entry);
                models.Apartment.findOne({ _id: uuid}, function(err, apartment) {
                    if(!err) {
                        if(apartment) {
                            // Already exists, update lastSeen
                            apartment.lastSeen = new Date();
                        } else {
                            // Doesn't exist create
                            var obj = profile.scrape(entry);
                            var apartment = new models.Apartment(obj);
                        }
                        apartment.save(function(err) {
                            if(err) {
                                console.log("Failed to save apartment: " + err);
                            }
                        });
                    } else {
                        console.log("Error retrieving apartment: " + err);
                    }
                });
            })
        } else {
            console.log("Retrieval using cURL failed: " + err);
        }
    });
};

db.connect(pollLoop);