module.exports= function (db) {
    return {
      requireAuthentication: function (req, resp, next) {
        console.log('Requiring authentication: '+req.url)
        var token = req.get('Auth');
        console.log('Token: '+token);

        db.user.findByToken(token).then(function (user) {
          console.log('Finding user by token');
          req.user = user;
          console.log('User: '+JSON.stringify(user));
          next();
        }, function (e) {
          console.error('Failed to get user: '+e);
          resp.status(401).send();
        });
      }
    };
}
