# passport-myanimelist

[Passport](http://passportjs.org/) strategy for authenticating with [MyAnimeList](https://myanimelist.net/)
using the OAuth 2.0 API.

## Install

    $ npm install passport-myanimelist

## Usage

#### Configure Strategy

The MyAnimeList authentication strategy authenticates users via a MyAnimeList user account and OAuth 2.0 token(s). A MyAnimeList API client ID, secret and redirect URL must be supplied when using this strategy. The strategy also requires a `verify` callback, which receives the access token and an optional refresh token, as well as a `profile` which contains the authenticated MyAnimeList user's profile. The `verify` callback must also call `cb` providing a user to complete the authentication.

```javascript
var MyAnimeListStrategy = require("passport-myanimelist").Strategy;

passport.use(
  new MyAnimeListStrategy(
    {
      clientID: "id",
      clientSecret: "secret",
      callbackURL: "callbackURL",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ id: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'myanimelist'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/myanimelist',
      passport.authenticate('myanimelist'));

    app.get('/auth/myanimelist/callback',
      passport.authenticate('myanimelist', { failureRedirect: '/login', successRedirect : '/' }));

## Examples

For a complete, working example, refer to the [example](https://github.com/Sarukei/passport-myanimelist/tree/main/example).

## Credits

- [Sarukei](http://github.com/Sarukei)
- [Jared Hanson](http://github.com/jaredhanson) (passport-oauth2)

## License

[The MIT License](http://opensource.org/licenses/MIT)
