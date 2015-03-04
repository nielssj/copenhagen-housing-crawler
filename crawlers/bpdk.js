/**
 * Created by niels on 2/27/15.
 */

module.exports = {
    title: "BoligPortal.dk",
    description: "~199 DKK/month, 85.000 postings/year",
    site_url: "http://www.boligportal.dk/",
    image_url: "http://www.ofir.dk/Shared/services/logos/DK/39606-large.jpg",
    location: "http://www.boligportal.dk/api/soeg_leje_bolig.php",
    curl: "curl 'http://www.boligportal.dk/api/soeg_leje_bolig.php' -H 'Cookie: __gads=ID=fe0706e8ba9307db:T=1424960204:S=ALNI_MbPDbgKZ58DJbhiBviLEwLXv0GVtA; __gfp_64b=ccAXIwN_4d2y6xp7k5tUuU3tJwPzGDV2OndOw2_wcAL.27; sc.ASP.NET_SESSIONID=undefined; sc.Status=5; _cb_ls=1; sidsteAnnonceIndenKoeb=2167804; __atssc=pinterest%3B2; PHPSESSID=m0dt94nub7kgvlr6kmq2upelb0; loginToken=7b65384f0dbccab9f978765386126e50; bpkap=3529488487; frontpageAppUpsell=hide; __atuvc=3%7C8; __utma=208684557.885613122.1424960515.1424960515.1424960515.1; __utmc=208684557; __utmz=208684557.1424960206.1.1.utmcsr=pinterest.com|utmccn=(referral)|utmcmd=referral|utmcct=/; _chartbeat2=C2FkBRCFHmxnCq10EI.1424960208538.1424976642942.1; cookiesDirective=1' -H 'Origin: http://www.boligportal.dk' -H 'Accept-Encoding: gzip,deflate' -H 'Accept-Language: en-US,en;q=0.8,da;q=0.6' -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.94 Safari/537.36' -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' -H 'Accept: application/json, text/javascript, */*; q=0.01' -H 'Referer: http://www.boligportal.dk/lejebolig/soeg_leje_bolig.php' -H 'X-Requested-With: XMLHttpRequest' -H 'Connection: keep-alive' --data 'serviceName=getProperties&data=%7B%22amtId%22%3A%224%22%2C%22huslejeMin%22%3A%220%22%2C%22huslejeMax%22%3A%2212000%22%2C%22stoerrelseMin%22%3A%2250%22%2C%22stoerrelseMax%22%3A%220%22%2C%22postnrArr%22%3A%5B1500%2C1800%2C2000%2C2100%2C2150%2C2200%2C2300%2C2400%2C2450%2C2500%5D%2C%22boligTypeArr%22%3A%5B%220%22%5D%2C%22lejeLaengdeArr%22%3A%5B%224%22%5D%2C%22page%22%3A%221%22%2C%22limit%22%3A%2215%22%2C%22sortCol%22%3A%223%22%2C%22sortDesc%22%3A%221%22%2C%22visOnSiteBolig%22%3A0%2C%22almen%22%3A-1%2C%22billeder%22%3A-1%2C%22husdyr%22%3A-1%2C%22mobleret%22%3A-1%2C%22delevenlig%22%3A-1%2C%22fritekst%22%3A%22%22%2C%22overtagdato%22%3A%22%22%2C%22emailservice%22%3A%22%22%2C%22kunNyeste%22%3Afalse%2C%22muListeMuId%22%3A%22%22%2C%22fremleje%22%3A-1%7D' --compressed",
    format: "json",
    scrape: function (json_string) {
        var json = JSON.parse(json_string);
        var items = [];
        json.properties.forEach(function(property) {
            var size = property.jqt_size.m2;
            var rent = property.jqt_economy.rent;
            items.push({
                guid: property.jqt_adId,
                title: size + "m2 - " + rent + "kr. - " + property.jqt_headline,
                date: parseInt(property.jqt_creationDate),
                description: property.jqt_adtext,
                url: property.jqt_adUrl,
                custom: [
                    { "image": property.jqt_images }
                ]
            });
        });
        return items;
    }
};