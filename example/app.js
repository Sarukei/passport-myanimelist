const express = require("express");
const session = require("express-session");
const passport = require("passport");
const MyAnimeListStrategy = require("../lib").Strategy;

const app = express();

const MY_ANIME_LIST_CLIENT_ID = "--insert-myanimelist-client-id-here--";
const MY_ANIME_LIST_CLIENT_SECRET = "--insert-myanimelist-client-secret-here--";

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete MyAnimeList profile is serialized
//   and deserialized.
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// Use the MyAnimeListStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and MyAnimeList
//   profile), and invoke a callback with a user object.
passport.use(
  new MyAnimeListStrategy(
    {
      clientID: MY_ANIME_LIST_CLIENT_ID,
      clientSecret: MY_ANIME_LIST_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/myanimelist/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {
        // To keep the example simple, the user's MyAnimeList profile is returned to
        // represent the logged-in user.  In a typical application, you would want
        // to associate the MyAnimeList account with a user record in your database,
        // and return that user instead.
        return done(null, profile);
      });
    }
  )
);

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", passport.authenticate("myanimelist"));

// GET /auth/myanimelist/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.

app.get(
  "/auth/myanimelist/callback",
  passport.authenticate("myanimelist", {
    failureRedirect: "/",
    successRedirect: "/user",
  })
);

app.get("/user", ensureAuthenticated, (req, res) => {
  res.json(req.user);
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

app.listen(3000, (err) => {
  if (err) return console.error(err);
  console.log(`Listening at http://localhost:3000`);
});
