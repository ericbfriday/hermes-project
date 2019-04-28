require('dotenv').config()
let express = require('express');
const pool = require('../modules/pool');
var request = require('request'); // "Request" library
const router = express.Router();

var client_id = '7ae314124aac5c7de467d'; // Your client id
var client_secret = process.env.CLIENT_SECRET_PODBEAN; // Your secret
var redirect_uri = 'https://hermes-host.herokuapp.com/podbean/callback_podbean'; // Your redirect uri

// router.get('/callback_podbean', function (req, res){
//   console.log('get callback podbean was hit'),
//   res.redirect('https://hermes-host.herokuapp.com/#/info')
// })
// main authorization steeps this is where the user inputed information is sent along.

router.get('/token_check', function(req, res) {
    const queryText = `SELECT * FROM "current_user";`
    pool.query(queryText)
        .then((result) => {
            let userId = result.rows[0].current
            const queryText = `SELECT * FROM "storage" WHERE "user_id" = $1;`
            pool.query(queryText, [userId])
                .then((results) => {
                    if (results.rowCount > 0 && results.rows[0].podbean) {
                        res.send(true)
                    } else {
                        res.send(false)
                    }
                })
        })
})

router.get('/callback_podbean', function(req, res, next) {
    console.log('call back was hit', req.body)
        // your application requests refresh and access tokens
        // after checking the state parameter
    const queryText = `SELECT * FROM "current_user";`
    pool.query(queryText)
        .then((result) => {
            console.log(result.rows[0].current)
            let userId = result.rows[0].current
            var code = req.query.code || null;
            var authOptions = {
                url: 'https://api.podbean.com/v1/oauth/token', // I might need ot add post
                form: {
                    code: code, // this is the podbean response code.
                    redirect_uri: redirect_uri,
                    grant_type: 'authorization_code'
                }, // up to here I think this will work
                headers: {
                    'Authorization': 'Basic' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
                }, // I think this will work however it might need to be called something else/put in url diffrently.
                json: true
            };
            request.post(authOptions, function(error, response, body) {
                console.log('log body', body)
                let access_token = body.access_token
                    // let expires = body.expires_in
                checkStorage(access_token, userId) // this updates the database with the token.
                res.redirect('http://localhost:3000/#/connect')
                    // to DB
            })
        })
});

//podbean router when this router get's hit we are posting form our client to here(server)
router.post('/post_episode', function(req, res) {
        console.log('logging', req.body)
        let title = req.body.title;
        let status = req.body.status;
        let type = req.body.type;
        let content = req.body.description;
        let file = req.body.media;

        if (title, status, type, content, file) {
            const queryText = `SELECT * FROM "current_user";`
            pool.query(queryText)
                .then((data) => {
                    let userId = data.rows[0].current // function to get user ID.
                    const queryText = `SELECT * FROM "storage" WHERE "user_id" = $1;`
                    pool.query(queryText, [userId])
                        .then((results) => {
                            if (results.rows[0].podbean) {
                                let access_token = results.rows[0].podbean; //second pool query getting authorization token
                                var authOptions = {
                                    url: 'https://api.podbean.com/v1/episodes', // I might need to add method:post
                                    form: {
                                        access_token: access_token, // this is the podbean response code.
                                        title: title,
                                        content: content,
                                        status: status,
                                        type: type,
                                        media_key: file, //this might need to be posted with an alt post rout that we get back a media key
                                    }, // this is the stuff require to post a podcast.
                                    json: true
                                };
                                request.post(authOptions, function(error, response, body) {
                                    console.log('post podcast was hit? logging response', response)
                                    res.redirect('http://localhost:3000/#/home') //this is a local host for wordpress instead of / but for presentation we will have to use redirect
                                })
                            } else {
                                res.send(500) // error withgetting user id.
                            }
                        })
                })
        } else {
            res.send(500) // not every require field was filled.
        }
    }) // this is untested.

checkStorage = (access_token, userId) => { //checks if user has accounts
    const queryText = `SELECT * FROM "storage" WHERE "id"=$1;`
    pool.query(queryText, [userId]) //hardcoded
        .then((result) => {
            // add user if not in database
            if (!result.rows[0]) {
                postToStorage(access_token, userId) //if no account, create one
            } else {
                updateToStorage(access_token, userId) // if account update db
            }
        })
}

updateToStorage = (access_token, userId) => {

    const queryText = `UPDATE "storage" SET "podbean"=$1 WHERE "id"=$2;` //update access token by user id
    pool.query(queryText, [access_token, userId]).then(() => {
        console.log('access token added to database');
    }).catch(error => {
        console.log('there was an error adding access_token to database', error);
    })
}

postToStorage = (access_token, userId) => {
    const queryText = `INSERT INTO "storage" ("user_id", "podbean") VALUES ($1,$2)` //create access token by user id
    pool.query(queryText, [userId, access_token, ]).then(() => {
        console.log('access token added to database');
    }).catch(error => {
        console.log('there was an error adding access_token to database', error);
    })
}
module.exports = router;