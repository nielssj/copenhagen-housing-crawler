var mongoose = require("mongoose");

var db = require("./data/database")(mongoose);
var bpdk = require("./crawlers/bpdk")();
var models = require("./data/data_model")(mongoose);

/**
 * Created by niels on 3/5/15.
 *
 * Polls one or more housing sites continuously for listings
 */

var POLL_FREQUENCY = 60000; // ms (1 minute)

var profiles = {
    "bpdk": bpdk
};

var poll = function(profile) {
    console.log("Polling \"" + profile.title + "\" ...");
    profile.apartments(function(err, entries) {
        if(!err) {
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
                            apartment = new models.Apartment(obj);
                            console.log("New apartment!");
                        }
                        apartment.save(function(err) {
                            if(err) {
                                console.log("Failed to save apartment to database: " + err);
                            }
                        });
                    } else {
                        console.log("Error looking up apartment in database: " + err);
                    }
                });
            })
        } else {
            console.log("Retrieval of apartments failed: " + err);
        }
    });
};

var pollAll = function() {
    Object.keys(profiles).forEach(function(pk) {
        var profile = profiles[pk];
        poll(profile);
    });
};

var startPolling = function() {
    pollAll();
    setInterval(pollAll, POLL_FREQUENCY);
};

db.connect(startPolling);