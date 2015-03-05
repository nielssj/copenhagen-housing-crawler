/**
 * Created by niels on 3/4/15.
 */


module.exports = function (mongoose) {  //passing mongoose object to constructor (this anonymous method)

    // middleware for automatically updating timestamps ("created" and "modified")
    var updateTimeStamps = function(next, done) {
        if (!this.firstSeen) this.firstSeen= new Date;
        this.lastSeen = new Date;
        next(); done();
    };

    // Custom length validator for strings
    var strLength = function(max) {
        return [
            function (v) {
                if (v) {
                    return v.length < max;
                }
                return true;
            },
            "Only " + max + " characters are allowed"
        ];
    };

    var Apartment = mongoose.Schema({
        _id: { type: String, validate: strLength(128), required: true},
        firstSeen: { type: Date, required: true },
        lastSeen: { type: Date, required: true },
        feedItem: {
            date: { type: Date, required: true },
            guid: { type: String, validate: strLength(128), required: true},
            title: { type: String, validate: strLength(512), required: true },
            url: { type: String, validate: strLength(512), required: true},
            description: { type: String, validate: strLength(4096)},
            custom: [
                { "image": { type: String, validate: strLength(512) } }
            ]
        },
        size: Number,
        rent: Number,
        roomCount: Number,
        municipality: { type: String, validate: strLength(128) },
        address: { type: String, validate: strLength(512) },
        source: { type: String, required: true}
    });
    Apartment.pre('validate', true, updateTimeStamps);


    return {
        Apartment: mongoose.model("apartment", Apartment)
    };
};