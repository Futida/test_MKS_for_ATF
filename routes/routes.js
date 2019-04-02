const express = require('express');
const router = express.Router();
// node-postgres
const pg = require('pg');
const fetch = require('node-fetch');

// config postgres
const configDB = require('../constants/configDB');
// Connect to database
const pool = new pg.Pool(configDB.config);

let flag = true;

router.route('/route1').post(function(req, res) {

    pool.connect(function(err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        client.query('UPDATE atf SET name = \'test1\' WHERE name = \'test\'', function(err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            fetch('https://randomuser.me/api')
            .then(res => res.json())
            .then((json) => {
                if (json.results) {
                    res.status(200);
                    res.json(json.results[0]);
                }
            })
        })
    })
});

router.route('/route2').post(function(req, res) {

    const header = req.get('x-atf');

    if (header) {
        fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            body: JSON.stringify({
                title: 'foo',
                body: 'bar',
                userId: 1
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        .then(response => response.json())
        .then(json => res.send(json))
    } else {
        res.status(400).send('Нет нужного заголовка');
    }

});


router.route('/route3').post(function(req, res) {

    if (res.statusCode === 200) {
        fetch('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            body: JSON.stringify({
                title: 'foo',
                body: 'bar',
                userId: 1
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        .then(response => response.json())
        .then(json => res.send(json))
    } else {
        res.status(400).send('Нет нужного заголовка');
    }

});

router.route('/route4').post(function(req, res) {

    if (flag) {
        flag = false;
        return res.json({ message: 'ok' });
    }

    fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify({
            title: 'foo',
            body: 'bar',
            userId: 1
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(response => response.json())
    .then(json => {
        res.send(json);
    });

});

module.exports = router;