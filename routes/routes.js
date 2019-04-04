const express = require('express');
const router = express.Router();
// node-postgres
const pg = require('pg');
const fetch = require('node-fetch');
// postgres://${username}:${password}@${localhost}/${database}
const connectionString = process.env.DB_CONN_STRING || "postgres://atf_user:1q2w3e4r5t@10.2.9.96/atf_demo";
// Connect to database
const pool = new pg.Pool({ connectionString });


let flag = true;

router.route('/route1').post(function(req, res) {
    pool.connect(function(err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        client.query('UPDATE atf SET name = \'atf_demo_1\' WHERE name = \'atf_demo\'', function(err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            fetch(`${process.env.API_BASE_URL}/1`, {
                method: 'POST',
                body: JSON.stringify({
                    data: 'atf_demo_1',
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            })
            .then(response => response.json())
            .then(json => res.send(json))
        })
    })
});

router.route('/route2').post(function(req, res) {
    const header = req.get('x-atf');
    req.body["request_id"] = Math.floor(Math.random() * 10000000);

    if (header) {
        fetch(`${process.env.API_BASE_URL}/2`, {
            method: 'POST',
            body: JSON.stringify(req.body),
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


router.route('/route3').post(function() {
    fetch(`${process.env.API_BASE_URL}/1`, {
        method: 'POST',
        body: JSON.stringify({
            data: 'atf_demo_1',
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(res => console.log(`Ответ от ${process.env.API_BASE_URL}/1: ${res}`))
    .catch(err => console.log(`Ошибка от ${process.env.API_BASE_URL}/1: ${err}`));

    fetch(`${process.env.API_BASE_URL}/2`, {
        method: 'POST',
        body: JSON.stringify({
            data: 'atf_demo_2',
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(res => console.log(`Ответ от ${process.env.API_BASE_URL}/2: ${res}`))
    .catch(err => console.log(`Ошибка от ${process.env.API_BASE_URL}/2: ${err}`));

    fetch(`${process.env.API_BASE_URL}/3`, {
        method: 'POST',
        body: JSON.stringify({
            data: 'atf_demo_3',
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(res => console.log(`Ответ от ${process.env.API_BASE_URL}/3: ${res}`))
    .catch(err => console.log(`Ошибка от ${process.env.API_BASE_URL}/3: ${err}`));

    res.send('')
});

router.route('/route4').post(function(req, res) {
    fetch(`${process.env.API_BASE_URL}/4`, {
        method: 'POST',
        body: JSON.stringify({
            data: 'atf_demo_4',
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(response => response.json())
    .then(json => {
        pool.connect(function(err, client, done) {
            if (err) {
                console.log("Can not connect to the DB" + err);
            }
            client.query(`INSERT INTO atf VALUES (4, ${json.data} )`, function(err) {
                done();
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                }
            })
        })
    });

    pool.connect(function(err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        client.query('SELECT id,name FROM atf ORDER BY id DESC LIMIT 1', function(err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }

            res.send(result.rows[0]);
        })
    })
});

module.exports = router;