//---- Require all modules -----
const express = require('express');
const app = express();
const hb = require ('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser= require('cookie-parser');
const cookieSession = require('cookie-session');
const db = require('./db');
const bcrypt = require('bcryptjs');
const bc = require('./hashedpass');

app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
    extended:false
}));
app.use(cookieSession({
    secret: 'Aint no mountain high enough',
    maxAge: 1000 * 60 * 60 * 24 * 14
}));

//----- Redirecting user form all pages -----
// ----- User Logged in | Have Cookie -----
app.get('/', (req, res) => {
    if (req.session.signid) {
        res.redirect("/thankyou");
    } else if (req.session.user) {
        res.redirect("/petition");
    } else {
        res.redirect("/intro");
    }
});

// ----- Intro -----
app.get('/intro', (req, res)=> {
    res.render('intro', {
        layout: 'main'
    });
});

// ----- Register/Signup! Route -----
app.get('/register', (req, res) => {
    res.render('welcome', {
        layout: 'main'
    });
});

app.post('/register', (req, res) => {
    //saves name, surname, email, password form user
    var first = req.body.first;
    var last = req.body.last;
    var email = req.body.email;
    var password = req.body.password;

    bc.hashPassword(password).then((hashedPassword) => {

        if (!first || !last || !email || !password) {
            res.render('welcome', {
                layout: 'main',
                error: true
            });

        } else {

            db.createLoginCredentials(first, last, email, hashedPassword)
            .then((user) => {

                console.log('about to set the session in registration', user);
                req.session.user = {
                    first: user.first,
                    last: user.last,
                    email:user.email,
                    id: user.id
                };
                console.log('just set this session',req.session.user);
                res.redirect('/profile')
            }).catch((err) => {
                console.log('this is a sign petition error: ', err);
            });
        }
    })
});

// ----- /login Route ----- Hashed Password ----- Comparing Password -----

app.get('/login', makeSureUserIsLoggedOut, (req, res) => {
    console.log(req.body);//this is the part where the users login
    res.render('login', {
        layout: "main"
    })
})

app.post('/login', (req, res) => {

    var email = req.body.email;
    var password = req.body.password;

    if (!email || !password) {
        res.render('login', {
            layout: 'main',
            error: true
        });

    } else {

        db.getUserInfo(email).then((userInfo) => {
            console.log("USERINFRO", userInfo);
            bc.checkPassword(password, userInfo.password).then((doesMatch) => {
                if (doesMatch) {
                    req.session.user = {
                        first: userInfo.first,
                        last: userInfo.last,
                        email: userInfo.email,
                        id: userInfo.id
                    };
                    res.redirect("/welcomeback");

                } else {
                    console.log("this is not your password");
                    res.render('login', {
                        layout: 'main',
                        newerror: true
                    });
                } console.log(req.session.user);

            }).catch(function(err) {
                console.log("this is not your email");
                res.redirect("/login");
                console.log(err);
            });
        }).catch(function(err) {
            console.log(err);
        });
    }
});

// ----- /petition: Name, Surname, Sign, Submit ----

app.get('/petition', makeSureUserIsLoggedIn,(req, res) => {
    res.render('sign', {
        layout: "main",
        first: req.session.user.first,
        last: req.session.user.last
    });
})

app.post('/petition',(req,res) => {
    var first = req.body.first;
    var last = req.body.last;
    console.log(first , last);
    var signature = req.body.signature;
    console.log(signature);
    var userid = req.session.user.id;

    if (!signature) {
        res.render('sign', {
            layout: "main",
            anothererror: true,
            first: req.session.user.first,
            last: req.session.user.last
        });
        console.log("is the if /petition working?");
    }else{
        console.log('i am in else /petition');
        db.signPetition (first, last, signature, userid).then(function(results) {
            console.log(results.rows[0].id);
            req.session.signid = results.rows[0].id;
            res.redirect('/thankyou')


        }).catch(function(err){
            console.log("petition sign error:", err);
        });

    }
});

// ----- /profile: age, city, homepage ----
app.get('/profile', makeSureUserIsLoggedIn,(req, res) => {
    res.render('profile',{
        layout: "main"
    });
})

app.post('/profile', (req, res) => {
    console.log('inside post/profile', req.session); //why are we loging this here?
    var age = req.body.age
    var city = req.body.city
    var homepage = req.body.homepage
    var userid = req.session.user.id
    //making a query to get all profile info from database
    db.saveProfileInfo(age, city, homepage, userid).then(function(){
        console.log('profile succesfuly saved,redirection to ');
        res.redirect('/about')
    })

});

// ---- /about this project page ******
app.get('/about', (req,res)=> {
    res.render ('about', {
        layout: "main"
    });
});

// ---- /profile - Edit ----
app.get('/profile_edit', (req, res) => {

    console.log('hello');
    db.keepUserInfoOnProfileEdit(req.session.user.id).then(results => {
        console.log(results);
        res.render ('profile_edit', {
            layout: "main",
            user: results
        });
    }).catch(err => {
        console.log('keepUserInfoOnProfileEdit err');
        console.log(err);
    });
});

app.post('/profile_edit', (req, res) => {
    console.log(req.body);

    var first = req.body.first
    var last = req.body.last
    var email = req.body.email
    var age = req.body.age
    var city = req.body.city
    var homepage = req.body.homepage
    var userid = req.session.user.id
    var password = req.body.password;

    db.updateProfile(first, last, email, age, city, homepage, userid)
    .then(results => {
        console.log("RESULTS UPDATED:", results);

        if (password != '') {
            bc.hashPassword(password).then((hashedPassword) => {

                db.updateHash(hashedPassword, userid).then((results) => {
                    console.log('hashed password updated');
                }).catch(err => {
                    console.log(err);
                });
            });
        }
        res.redirect("/intro");
    });
});

// ----- Signatures Page ----
app.get('/signatures', makeSureUserIsLoggedIn,(req, res) => {

    db.getSignatures ().then(function(data){
        console.log(data);
        res.render('signatures', {
            layout: "main",
            signatures: data.rows
        })
    })
})

// ----- Thank You Page /w Signature -----
app.get('/thankyou',makeSureUserIsLoggedIn, (req, res) => {
    db.getSignature(req.session.signid).then(function(data){
        console.log(req.session.signid);
        console.log(data.rows[0]);
        res.render('thankyou', {
            layout: "main",
            signature: data.rows[0].signature
        })
    })
})

app.post('/petition', (req,res) => {
    res.redirect('/thankyou');
});

// ----- /signature/:city -----
app.get('/signatures/:city', (req, res) => {
    db.getInformationByCities(req.params.city).then(function(results){
        console.log(results.rows);
        res.render('signatures', {
            layout: "main",
            signatures: results.rows
        })
    }).catch(err => {
        console.log(err);
    })
})

// ---- Logged out Redirect ----
app.get('/logout', (req, res) => {
    req.session= null;
    res.redirect('/register')
})

function userLogout (req) {
    if (!req.session.user) {
        res.redirect('/');
    }
}

function makeSureUserIsLoggedOut(req, res, next) {
    if (req.session.user) {
        res.redirect('/petition')
    } else {
        next();
    }
}

function makeSureUserIsLoggedIn(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login')
    } else {
        next();
    }
}

// ---- /welcome back Route ----
app.get('/welcomeback', makeSureUserIsLoggedIn,(req, res) => {
    res.render('welcomeback', {
        layout: "main",
        first: req.session.user.first,
        last: req.session.user.last
    });
})

app.post('/welcomeback',(req,res) => {
    var first = req.body.first;
    var last = req.body.last;
    console.log(first , last);
    var signature = req.body.signature;
    console.log(signature);
    var userid = req.session.user.id;

    if (!signature) {
        res.render('welcomeback', {
            layout: "main",
            anothererror: true,
            first: req.session.user.first,
            last: req.session.user.last
        });

    }else{
        console.log('i am in else /petition');
        db.signPetition (first, last, signature, userid).then(function(results) {
            console.log(results.rows[0].id);
            req.session.signid = results.rows[0].id;
            res.redirect('/thankyou')


        }).catch(function(err){
            console.log("petition sign error:", err);
        });
    }
});

//*******************************************************************************
app.listen(process.env.PORT || 8080, () => {
    console.log('listening');
})
