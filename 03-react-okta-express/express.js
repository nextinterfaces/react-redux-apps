const express = require('express');
const OktaJwtVerifier = require('@okta/jwt-verifier');
var cors = require('cors');

const oktaJwtVerifier = new OktaJwtVerifier({
    issuer: 'https://dev-977591.oktapreview.com/oauth2/default',
    assertClaims: {
        aud: 'api://default',
    },
});

/**
 * A simple middleware that asserts valid access tokens and sends 401 responses
 * if the token is not present or fails validation.  If the token is valid its
 * contents are attached to req.jwt
 */
function authenticationRequired(req, res, next) {

    const authHeader = req.headers.authorization || '';

    console.log('---- 0 ---- oktaJwtVerifier, headers: ', req.headers);

    const match = authHeader.match(/Bearer (.+)/);

    if (!match) {
        console.log('---- 1 ---- 401 oktaJwtVerifier');
        return res.status(401).end();
    }

    const accessToken = match[1];

    return oktaJwtVerifier.verifyAccessToken(accessToken)
        .then((jwt) => {
            console.log('---- 2 ---- oktaJwtVerifier');
            req.jwt = jwt;
            next();
        })
        .catch((err) => {
            console.log('---- 3 ---- oktaJwtVerifier');
            console.log('401 UNAUTHORIZED');
            res.status(401).send(err.message);
        });
}

const app = express();

/**
 * For local testing only!  Enables CORS for all domains
 */
app.use(cors());

/**
 * An example route that requires a valid access token for authentication, it
 * will echo the contents of the access token if the middleware successfully
 * validated the token.
 */
app.get('/secure', authenticationRequired, (req, res) => {
    res.json(req.jwt);
});

/**
 * Another example route that requires a valid access token for authentication, and
 * print some messages for the user if they are authenticated
 */
app.get('/api/messages', authenticationRequired, (req, res) => {
    res.json(
        {
            messages:
                [{
                    message: 'Hello, msg1'
                }, {
                    message: 'Hello, msg2'
                }, {
                    message: 'Hello, msg3'
                }]
        }
    );
});

app.listen(3001, () => {
    console.log('Serve Ready on port 3001');
});