var spicedPg = require('spiced-pg');
var db = spicedPg('postgres:postgres:postgres@localhost:5432/signatures');
var dbUrl = process.env.DATABASE_URL || spicedPg('postgres://auqewdkenwgrnx:fbfcb875c3929ccd1165b6003b6300a45bcd38c60ae2050b57c1a2c9a89adbfe@ec2-107-22-211-182.compute-1.amazonaws.com:5432/d893nc9os19vta')

// ----- signPetition -----
module.exports.signPetition = function(first, last, signature, userid) {

    const query = 'INSERT INTO signatures (signature, userid) VALUES ($1,$2) RETURNING id'
    const params = [ signature, userid ]

    return db.query(query, params)
};

// ----- getSignatures -----
module.exports.getSignatures = function() {

    const query = `SELECT users.first, users.last, homepage, city, age
                    FROM signatures
                    LEFT JOIN users
                    ON users.id = signatures.userid
                    LEFT JOIN user_profiles
                    ON signatures.userid = user_profiles.userid`
    const params = [ ]

    return db.query(query)
}

// ----- getSignature -----
module.exports.getSignature = function (id) {
    const query = 'SELECT signature FROM signatures WHERE id = $1'
    const params = [ id ]

    return db.query(query, params)
}

// ----- get user info -----
module.exports.getUserInfo = function(email) {
    return db.query(

        `SELECT * FROM users WHERE email = $1` , [email]

    ).then(function(results) {
        console.log("results from getUserInfo", results.rows);
        return results.rows[0];
    }).catch(function(err) {
        console.log(err);
    });
};

// ---- create login cretentials -----
module.exports.createLoginCredentials = function(first, last, email, password) {
    return db.query(

        'INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
        [first, last, email, password]

    ).then((results) => {
        return results.rows[0];
    }).catch((err) => {
        console.log(err);
    });
};

// ----- saveProfileInfo -----
module.exports.saveProfileInfo = function(age, city, homepage, userid) {
    return db.query (

        'INSERT INTO user_profiles (age, city, homepage, userid) VALUES ($1, $2, $3, $4)',
        [age, city, homepage, userid]

    ).then((results) => {
        return true

    }).catch((err) => {
        console.log(err);
    });
};

// ----- getInformationByCities -----
module.exports.getInformationByCities = function (city) {

    const query = `SELECT users.first, users.last, user_profiles.homepage, user_profiles.age
                    FROM signatures
                    LEFT JOIN users
                    ON users.id = signatures.userid
                    LEFT JOIN user_profiles
                    ON user_profiles.userid = signatures.userid
                    WHERE user_profiles.city = $1`
    const params = [ city ]

    return db.query(query, params)
}

// ---- updateProfile -----
module.exports.updateProfile = function (first, last, email, age, homepage, city, userid) {

    return db.query (
        'UPDATE users SET first = $1, last = $2 , email = $3 WHERE id = $4',
        [first, last, email, userid]

    ).then(() => {
        return db.query (
            'UPDATE user_profiles SET age = $1, city = $2, homepage = $3 WHERE userid = $4',
            [age, city, homepage, userid]
        )
    }).catch((err)=> {
        console.log("there is an error in update profile", err);
    });
}

// ----- prepopulate the imput fileds with the data -----
// ----- keepUserInfoOnProfileEdit -----
module.exports.keepUserInfoOnProfileEdit = function (userid) {

    const query = `
        SELECT users.first, users.last, users.email, user_profiles.age, user_profiles.city, user_profiles.homepage
        FROM users
        LEFT JOIN user_profiles
        ON users.id = user_profiles.userid
        WHERE users.id = $1`
    const params = [ userid ]

    return db.query(query, params).then((results) => {
        return results.rows[0];
    }).catch((err) => {
            console.log(err);
    });
};
