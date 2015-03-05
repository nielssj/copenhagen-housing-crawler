/**
 * Created by niels on 3/5/15.
 */

module.exports = function (mongoose) {
  return {
      connect: function(openCallback) {
          var db = mongoose.connection;
          mongoose.connect("mongodb://localhost:27017/housing");

          if(openCallback) {
              db.once('open', openCallback);
          }
      }
  }
};