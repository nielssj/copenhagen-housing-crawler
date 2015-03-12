/**
 * Created by niels on 2/27/15.
 */

var exec = require("child_process").exec;
var async = require("async");

module.exports = function() {
    var obj = {
        title: "BoligPortal.dk",
        description: "~199 DKK/month, 85.000 postings/year",
        site_url: "http://www.boligportal.dk/",
        image_url: "http://www.ofir.dk/Shared/services/logos/DK/39606-large.jpg",
        location: "http://www.boligportal.dk/api/soeg_leje_bolig.php",
        curl: "curl 'http://www.boligportal.dk/api/soeg_leje_bolig.php' -H 'Cookie: __gads=ID=fe0706e8ba9307db:T=1424960204:S=ALNI_MbPDbgKZ58DJbhiBviLEwLXv0GVtA; __gfp_64b=ccAXIwN_4d2y6xp7k5tUuU3tJwPzGDV2OndOw2_wcAL.27; sc.ASP.NET_SESSIONID=undefined; sc.Status=5; _cb_ls=1; PHPSESSID=m0dt94nub7kgvlr6kmq2upelb0; loginToken=7b65384f0dbccab9f978765386126e50; frontpageAppUpsell=hide; cookiesDirective=1; sidsteAnnonceIndenKoeb=2167804; __atssc=pinterest%3B3; mbox=check#true#1425575953|session#1425575892956-595173#1425577753; __utmt=1; bpkap=3529488487; __atuvc=9%7C8%2C3%7C9; __atuvs=54f88fdc3bbd2343000; __utma=208684557.1852443293.1425575898.1425575898.1425575898.1; __utmb=208684557.5.9.1425575901651; __utmc=208684557; __utmz=208684557.1425575898.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); surveySearchList=hide; _chartbeat2=C2FkBRCFHmxnCq10EI.1424960208538.1425575903980.11000011' -H 'Origin: http://www.boligportal.dk' -H 'Accept-Encoding: gzip,deflate' -H 'Accept-Language: en-US,en;q=0.8,da;q=0.6' -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.94 Safari/537.36' -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' -H 'Accept: application/json, text/javascript, */*; q=0.01' -H 'Referer: http://www.boligportal.dk/lejebolig/soeg_leje_bolig.php' -H 'X-Requested-With: XMLHttpRequest' -H 'Connection: keep-alive' --data 'serviceName=getProperties&data=<query>' --compressed",
        query: {
            "amtId": "4",
            "huslejeMin": "0",
            "huslejeMax": "12000",
            "stoerrelseMin": "50",
            "stoerrelseMax": "0",
            "postnrArr": [
                1000,
                1500,
                1800,
                2000,
                2100,
                2150,
                2200,
                2300,
                2400,
                2450,
                2500
            ],
            "boligTypeArr": [
                "0"
            ],
            "lejeLaengdeArr": [
                "4"
            ],
            "page": "1",
            "limit": "50",
            "sortCol": "3",
            "sortDesc": "1",
            "visOnSiteBolig": 0,
            "almen": -1,
            "billeder": -1,
            "husdyr": -1,
            "mobleret": -1,
            "delevenlig": -1,
            "fritekst": "",
            "overtagdato": "",
            "emailservice": "",
            "kunNyeste": false,
            "muListeMuId": "",
            "fremleje": -1
        },
        format: "json",

        // Scrape unique ID only from source
        guid: function(aptm_src) {
            return "bpdk-" + aptm_src.jqt_adId;
        },
        // Scrape an apartment from source
        scrape: function (aptm_src) {
            var size = aptm_src.jqt_size.m2;
            var rent = aptm_src.jqt_economy.rent;
            return {
                _id: "bpdk-" + aptm_src.jqt_adId,
                feedItem: {
                    guid: aptm_src.jqt_adId,
                    title: size + "m2 - " + rent + "kr. - " + aptm_src.jqt_headline,
                    date: parseInt(aptm_src.jqt_creationDate),
                    description: aptm_src.jqt_adtext,
                    url: aptm_src.jqt_adUrl,
                    custom: [
                        { "image": aptm_src.jqt_images }
                    ]
                },
                size: size,
                /* TODO: Scrape some more meta-data
                 roomCount: Number,
                 municipality: { type: String, validate: util.strLength(128) },
                 address: { type: String, validate: util.strLength(512) },*/
                rent: parseInt(rent),
                source: JSON.stringify(aptm_src)
            };
        }
    };

    // Parse and extract relevant apartment sources from response
    obj.apartments = function(callback) {
        obj.query.page = 1;
        var curlp1 = obj.curl.replace("<query>", JSON.stringify(obj.query));
        var limit = obj.query.limit;
        exec(curlp1, function(err, stdout, stderr) {
            if(!err) {
                var json = JSON.parse(stdout);
                var count = json.pageControl.jqt_count;
                console.log("Total number of properties found by query: " + count);

                // If my properties found than query limit ...
                if(count > limit) {
                    apartments = json.properties;
                    req_count = Math.ceil(count / limit);
                    console.log("Assuming page count is: " + req_count);
                    async.times(req_count - 1,
                        // Make X requests
                        function(i, next) {
                            var page = i + 2;
                            obj.query.page = page;
                            var curl = obj.curl.replace("<query>", JSON.stringify(obj.query));
                            console.log("\tPolling page " + page);
                            exec(curl, function(err, stdout, stderr) {
                                if(!err) {
                                    json = JSON.parse(stdout);
                                    console.log("\tFound additional " + json.properties.length + " on page " + page);
                                    apartments = apartments.concat(json.properties);
                                } else {
                                    console.log("Polling of page " + page + " failed");
                                }
                                next();
                            });
                        },
                        // Invoke callback with final result
                        function(err) {
                            console.log("Finally returning full set of " + apartments.length + " apartments");
                            callback(null, apartments);
                        }
                    );
                } else {
                    // Otherwise, just return result of initial query
                    callback(null, json.properties);
                }
            } else {
                callback(err);
            }
        });
    };

    return obj;
};