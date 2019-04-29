require('dotenv').config();
const pool = require('../modules/pool');

/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const cors = require('cors');
const cookieParser = require('cookie-parser');
const router = express.Router();

/**
 * Store all of these items in the .env file
 */
const client_id = process.env.CLIENT_ID_WORDPRESS // '65413'; // Your client id
const client_secret = process.env.CLIENT_SECRET_WORDPRESS; // Your secret
const base_uri = process.env.NODE_ENV === 'production' ? process.env.PROD_URI : process.env.DEV_SERVER_URI;

const redirect_uri = base_uri + 'wordpress/callback_wordpress';

/**
 * EF Note:
 * You are making tons of more work for yourselves by tracking current user in the database.
 * It's also a really bad idea.
 * The current user is already tracked by session cookies. Look at the request object in the
 * debugger. If you browse through the object, you'll find the user id is already tracked and
 * provided on the client side! it's at `req.user.id;`.
 * ez pz.
 */

router.get('/token_check', function(req, res) {
    const userId = req.user.id; // set user id
    const queryText = `SELECT * FROM storage WHERE user_id = $1;`;
    pool.query(queryText, [userId]) // query to get the token and then send a bolien.
        .then((results) => {
            if (results.rowCount > 0 && results.rows[0].wordpress) {
                // TODO: Make a validation call to wordpress here to make sure the token is valid.
                // Also, check that all attributes are not null.
                res.send(true);
            } else {
                res.send(false);
            }
        });
});

/**
 * EF Note:
 * This endpoint is used to pass an `authorization code` from wordpress -> client -> your server.
 * From there, your server trades in that one-time-use `authorization code` for a full `access token`.
 * The `access token` lasts forever I believe (for this site, at least).
 * This is the basic flow of the OAuth 2 Authorization Grant practice. I've added lots of notes on it
 * to the code below. You almost certainly know a lot of it, but it's good practice for me to review it
 * by writing it down, so I'm doing it anyways.
 * More details here: [[https://oauth.net/2/grant-types/authorization-code/]].
 */
router.get('/callback_wordpress', function callbackWordpress(req, res) {
    /**
     * The `authorization code` has to be sent to our client application from wordpress.com. In this grant flow,
     * they do that by passing the code as a query parameter.
     */
    const code = req.query.code || null;
    if (code === null || typeof(code) === 'undefined') res.status(500).send('There was an error in the Wordpress callback. No code was found.');
    const userId = req.user.id || null;
    if (!userId === null || typeof(userId) === 'undefined') res.status(500).send('There was an error in the Wordpress callback. No user ID was found.');

    /**
     * EF Note:
     *
     * I'm 95% sure you haven't seen a http call constructed in the way I'm about to do it. The basic outline
     * is that we'll:
     * 1) Set the basic options for the call.
     * 2) Define the callback (the function that's executed on the response from the WordPress API).
     * 3) Create an instance of the `Request` object that we'll be using to send our POST request.
     * 4) Modify the `Request` object so that it transmits the information we need as `form-data`.
     * 5) Then we have a little bit of weird Node magic that occurs. I'll explain that at the end.
     *
     * Details are at each step below.
     */

    // 1) We set the basic information for the call. It's going to be a POST request to the oauth token request URI.
    const options = {
        method: 'POST',
        uri: 'https://public-api.wordpress.com/oauth2/token',
    };

    // 2) Define the callback that we'll use when the server gives us back the `access_key` or error.
    // Notice that this is mostly error handling. We could probably clean that up by creating a generic
    // error handling function, but we'll ignore that for now as we have ~deadlines~ to meet
    // (just like the real world).
    const accessTokenCallback = function(error, response, body) {
        let errorInstance = null;
        const parsedBody = body ? JSON.parse(body) : body;
        const errorDetected = error || parsedBody.error;
        if (error || parsedBody.error) {
            errorInstance = new Error(error || parsedBody.error);
        };
        if (parsedBody.access_token) {
            // EF Note: checkStorage should probably be returning a Promise, and then we tailor the response based on success
            // with the DB operation, but that can wait...
            checkStorage(parsedBody.access_token, userId, parsedBody.blog_id, parsedBody.blog_url);
            // EF Note: I have no idea where you actually want the client redirected to.
            res.redirect('/#/connect');
        } else {
            res.status(500).send(errorInstance);
        }
    }

    /**
     * 3) This is where it's probably different than you've seen it before. We set a variable to reference
     * the request.post call with the two parameters we're feeding in. _However_ it doesn't actually make the
     * HTTP call until the next event loop. We leverage this to allow us to modify the request in the next code block.
     */
    const accessTokenRequestInstance = request.post(options, accessTokenCallback);

    /**
     * 4) Here is where we actually set the request to properly encode the data as `multipart/form-data`. This
     * is an encoding that allows us to send the results of `HTML form`s to servers when those forms contain
     * files.
     */
    const form = accessTokenRequestInstance.form();
    form.append('client_id', client_id);
    form.append('redirect_uri', redirect_uri);
    form.append('client_secret', client_secret);
    form.append('grant_type', 'authorization_code');
    form.append('code', code);

    /**
     * 5) Now, you're probably going to look at me with a funny expression and say, "WTF, why is this all out of
     * order and how the heck are we supposed to use the request.post(..) if we're changing stuff after the fact?"
     * I get it.
     * Let's take a close look at step 3. In step 3 we create a variable that references the `Request` object returned
     * by request.post(..) call. Notice that I'm saying it's referencing the `Request` object returned.... not the result
     * of the HTTP POST request. _The HTTP POST call is not made at the instantiation (creation) of the `Request` object_.
     * This means that you can modify the request object (in our case the variable `accessTokenRequestInstance`) by calling
     * it's internal methods and settiing various attributes. We do this with the `accessTokenRequestInstance.form()` call
     * and `form.append(..)` calls. All of this happens within the callback fn of `router.get('/callback_wordpress', callback(..))`.
     * Once it's done executing that callback, then the `Request` object (which now has all of the definitions/attributes from
     * the `form()` method and various `append(..)` calls) will actually execute the HTTP call as we'd expect.
     */
});

router.post('/post_episode', function(req, res) {
    const title = req.body.title;
    const status = req.body.status;
    const type = req.body.type;
    const content = req.body.content;
    const featured_media = req.body.featured_media;
    const userId = !req.user ? null : req.user.id;
    if (!userId) res.status(500).send('There was an error in the Wordpress callback. No user ID was found.');

    const queryText = `SELECT * FROM "storage" WHERE "user_id" = $1;`
    pool.query(queryText, [userId])
        .then((results) => {
            debugger;
            if (results.rowCount > 0 && results.rows[0].wordpress) {
                const access_token = results.rows[0].wordpress;
                const blogurl = results.rows[0].blog_url;
                const blogid = results.rows[0].blog_id;

                const options = {
                    method: 'POST',
                    'auth': {
                        'bearer': access_token
                    },
                    url: `https://public-api.wordpress.com/rest/v1.2/sites/${blogid}/posts/new`,
                };

                const postNewBlog = request.post(options, function(error, wpResponse, body) {
                    /**
                     * Whatever you have planned after a successful/failed post to wordpress should be done here.
                     */
                    if (error) throw new Error(error);

                    console.log(body);
                    res.redirect(base_uri + 'success');
                });

                const form = postNewBlog.form();
                form.append('title', title);
                form.append('status', status);
                form.append('content', content);
                form.append('type', type);
                form.append('featured_media', featured_media);
            } else {
                res.status(500).send('Error getting user wordpress info from database.');
            }
        })
        .catch(err => {
            console.log('Error in post_episode: ' + err);
            res.status(500).send(err);
        });
})

checkStorage = (access_token, userId, blogId, blogurl) => {
    // EF Note: for some reason the select command wasn't working with double quotes. IDK.
    const queryText = `SELECT * FROM storage WHERE user_id = $1;`
    pool.query(queryText, [userId]) //hardcoded
        .then((result) => {
            // add user if not in database
            if (!result.rowCount > 0) {
                postToStorage(access_token, userId, blogId, blogurl) //if no account, create one
            } else {
                updateToStorage(access_token, userId, blogId, blogurl) // if account update db
            }
        })
};
updateToStorage = (access_token, userId, blogId, blogurl) => {
    const queryText = `UPDATE "storage" SET "wordpress"=$1, "blog_id"=$3, "blog_url"=$4 WHERE "user_id"=$2;` //update access token by user id
    pool.query(queryText, [access_token, userId, blogId, blogurl])
        .then(() => {
            console.log('Access token updated in database. User ID: ' + userId);
        }).catch(error => {
            console.log('There was an error adding access_token to database', error);
        });
};

postToStorage = (access_token, userId, blogId, blogurl) => {
    const queryText = `INSERT INTO "storage" ("user_id", "wordpress", "blog_id", "blog_url") VALUES ($1,$2, $3, $4)` //create access token by user id
    pool.query(queryText, [userId, access_token, blogId, blogurl])
        .then(() => {
            console.log('Access token added to database. User ID: ' + userId);
        }).catch(error => {
            console.log('There was an error adding access_token to database', error);
        });
};
module.exports = router;