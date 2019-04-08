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

function createHeaders(r) {
    const { headers } = r;
    const key = Object.keys(headers).filter(header => header === 'testidheader');
    if (key && key.length) {
        return {
            "Content-type": "application/json; charset=UTF-8",
            "testIdHeader": headers[key],
        }
    } else {
        return {
            "Content-type": "application/json; charset=UTF-8",
        }
    }
}

router.route('/route1').post(function(req, res) {
    const headers = createHeaders(req);
    let { user, status } = req.body;

    status = status === 'a' ? 'ACTIVE' : status === 'b' ? 'BLOCKED' : '';

    pool.connect(function(err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        client.query(`UPDATE atf SET status='${status}' WHERE \"user\"='${user}'`, function(err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            fetch(`${process.env.API_BASE_URL}/1`, {
                method: 'POST',
                body: JSON.stringify({
                    user: "demo_user",
                    status: "b",
                }),
                headers
            })
            .then(response => response.json())
            .then(() => {
                res.status(200).send('');
            })
        })
    })
});

router.route('/route2').post(function(req, res) {
    const headers = req.headers;
    const key = Object.keys(headers).filter(header => header === 'x-atf');

    if (key && !key.length) {
        res.status(400).send({
            errorCode: "LOGIC_ERROR",
            cause: "Отсутствует заголовок x-atf"
        });
    } else {
        const header = req.get('x-atf');
        const headers = createHeaders(req);
        req.body["request_id"] = Math.floor(Math.random() * 10000000);

        if (header === '1223') {
            fetch(`${process.env.API_BASE_URL}/2`, {
                method: 'POST',
                body: JSON.stringify(req.body),
                headers
            })
            .then(response => response.json())
            .then(json => res.send(json))
        } else {
            res.status(400).send({
                errorCode: "LOGIC_ERROR",
                cause: "Значение заголовка x-atf некорректно",
            });
        }
    }
});


router.route('/route3').post(function(req) {
    const headers = createHeaders(req);

    fetch(`${process.env.API_BASE_URL}/1`, {
        method: 'POST',
        body: JSON.stringify({
            user: "demo_user",
            status: "b"
        }),
        headers
    })
    .then(res => console.log(`Ответ от ${process.env.API_BASE_URL}/1: ${res}`))
    .catch(err => console.log(`Ошибка от ${process.env.API_BASE_URL}/1: ${err}`));

    fetch(`${process.env.API_BASE_URL}/2`, {
        method: 'POST',
        body: JSON.stringify({
            id: "25",
            user: "demo_user",
            request_id: "123456"
        }),
        headers
    })
    .then(res => console.log(`Ответ от ${process.env.API_BASE_URL}/2: ${res}`))
    .catch(err => console.log(`Ошибка от ${process.env.API_BASE_URL}/2: ${err}`));

    fetch(`${process.env.API_BASE_URL}/3`, {
        method: 'POST',
        body: JSON.stringify({
            data: 'atf_demo_3',
        }),
        headers
    })
    .then(res => console.log(`Ответ от ${process.env.API_BASE_URL}/3: ${res}`))
    .catch(err => console.log(`Ошибка от ${process.env.API_BASE_URL}/3: ${err}`));

    res.send('')
});

router.route('/route4').post(function(req, res) {
    const headers = createHeaders(req);
    const { user, account_id } = req.body;
    const currentTime = Math.round(new Date().getTime() / 1000);

    pool.connect(function(err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        client.query(`SELECT time FROM atf WHERE account_id=${account_id}`, function(err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            const timeFromTable = (result.rows[0] / 1000);

            if (currentTime - timeFromTable > process.env.CACHETIME) {
                flag = true
            }
        })
    });

    if (flag) {
        fetch(`${process.env.API_BASE_URL}/4`, {
            method: 'POST',
            body: JSON.stringify({
                user,
                account_id
            }),
            headers
        })
        .then(response => response.json())
        .then((json) => {
            pool.connect(function(err, client, done) {
                if (err) {
                    console.log("Can not connect to the DB" + err);
                }
                client.query(`UPDATE atf SET data=${json.data}, time=${new Date().getTime()} WHERE account_id=${account_id}`, function(err) {
                    done();
                    if (err) {
                        console.log(err);
                        res.status(400).send(err);
                    } else {
                        flag = false;
                    }

                })
            })
        });
    }

    pool.connect(function(err, client, done) {
        if (err) {
            console.log("Can not connect to the DB" + err);
        }
        client.query(`SELECT "user" as user, account_id, params, data FROM atf WHERE account_id=${account_id}`, function(err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(400).send(err);
            }
            res.send(result.rows[0]);
        })
    });
});

module.exports = router;