/**
 * Module Dependencies
 */

const util = require("util"),
  OAuth2Strategy = require("passport-oauth2"),
  InternalOAuthError = require("passport-oauth2").InternalOAuthError;

/**
 * `Strategy` constructor.
 *
 * The MyAnimeList authentication strategy authenticates requests by delegating to
 * MyAnimeList using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`       OAuth ID to myanimelist
 *   - `clientSecret`   OAuth Secret to verify client to myanimelist
 *   - `callbackURL`    URL that myanimelist will redirect to after auth
 *
 * Examples:
 *
 *     passport.use(new MyAnimeListStrategy({
 *         clientID: process.env.MAL_CLIENT_ID,
 *         clientSecret: process.env.MAL_CLIENT_SECRET,
 *         callbackURL: `https://example.net/auth/myanimelist/callback`,
 *         state: true,
 *         pkce: "plain",
          
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {{object}} options
 * @param {{function}} verify
 */

function Strategy(options, verify) {
  options = options || {};

  // NOTE: Currently, only the plain method is supported.
  // https://myanimelist.net/apiconfig/references/authorization#obtaining-oauth-2.0-access-tokens

  options.pkce = options.pkce || "plain";

  // Default options.state to true as MyAnimeList supports PKCE

  // passport-oauth handles this and generates a unique state identification for the request
  // This identification is then saved in Session (by default) and compared when response arrives
  // NOTE: that now this requires you to use express-session (or a similar) session plugin
  // Optionally you can use your own state store. See passport-oauth2 for more information.

  // "Note: state: true must also be enabled alongside PKCE, since the verifier needs to be persisted in the session between requests."
  // https://medium.com/passportjs/pkce-support-for-oauth-2-0-e3a77013b278
  options.state = options.state || true;

  options.tokenURL = options.URL || "https://myanimelist.net/v1/oauth2/token";
  options.authorizationURL =
    options.authorizationURL || "https://myanimelist.net/v1/oauth2/authorize";

  OAuth2Strategy.call(this, options, verify);

  this.name = "myanimelist";

  // Use Authorization Header (Bearer with Access Token) for GET requests. Used to get User's profile.
  this._oauth2.useAuthorizationHeaderforGET(true);
}

/**
 * Inherits from the 'OAuth2Strategy'
 */

util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from MyAnimeList
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `myanimelist`
 *   - `id`               the user's MyAnimeList ID
 *   - `displayName`      the user's username
 *   - `joinedAt`					the user's join date
 *
 *
 * @param {{string}} accessToken
 * @param {{function}} done
 */

Strategy.prototype.userProfile = function (accessToken, done) {
  this._oauth2.get(
    `https://api.myanimelist.net/v2/users/@me`,
    accessToken,
    function (err, body, res) {
      if (err) {
        return done(
          new InternalOAuthError("Failed to fetch user profile.", err)
        );
      }

      try {
        const json = JSON.parse(body);

        const profile = { provider: "myanimelist" };

        profile.id = json.id;
        profile.displayName = json.name;

        if (json.picture) {
          profile.picture = json.picture;
        }

        if (json.location) {
          profile.location = json.location;
        }
        profile.joinedAt = json.joined_at;

        profile._raw = body;
        profile._json = json;

        done(null, profile);
      } catch (e) {
        return done(e);
      }
    }
  );
};

module.exports = Strategy;
