var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var mysql = require('mysql2');
var path = require('path');
var connection = mysql.createConnection({
    host: '35.239.37.253',
    user: 'root',
    password: 'team096',
    database: 'ResearchPapers'
});

connection.connect;


var app = express();

// set up ejs view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));


/* GET home page, respond by rendering index.ejs */
app.get('/', function (req, res) {
    console.log(req.session);
    res.render('index', { title: 'Mark Attendance', user: req.session.user });
});
app.get('/success', function (req, res) {
    res.send({ 'message': 'Attendance marked successfully!' });
});

app.get('/results/:netid', function (req, res) {
    var netid = req.params.netid;
    var sql = `SELECT title, published_date FROM Paper WHERE title LIKE '%${netid}%' ORDER BY published_date`;
    console.log(sql);
    connection.query(sql, function (err, result) {
        if (err) {
            res.send(err)
            return;
        }
        console.log(result[0]);
        res.json(result);

    });
});
// this code is executed when a user clicks the form submit button
app.post('/mark', function (req, res) {
    var netid = req.body.netid;
    // var sql = `SELECT title, published_date FROM Paper WHERE title LIKE '*${netid}*' ORDER BY published_date`;
    res.redirect('/results/' + netid);
});

app.get('/dashboard', function (req, res) {
    var userId = req.query.id;

    var sql = `SELECT username FROM Users WHERE id = ${userId}`;
    // console.log(sql);
    connection.query(sql, function (err, results) {
        if (err) {
            res.send(err);
            return;
        }
        // console.log(results)
        var name = results[0].username;

        var sql2 = `
    SELECT u.*, p.*, au.name AS author_name 
    FROM UserPaper u 
    JOIN Paper p ON u.paperId = p.id 
    JOIN PaperAuthor a ON p.id = a.paperId 
    JOIN Author au ON au.id = a.authorId
    WHERE u.userId = ${userId}
    ORDER BY p.recent_add_date DESC`;
        // var sql2 = `SELECT * FROM UserPaper u JOIN Paper p ON u.paperId = p.id WHERE userId = ${userId}`;
        // var sql2 = `SELECT * FROM UserPaper WHERE userId = ${ userId } `;
        // console.log(sql2);
        connection.query(sql2, function (err, results) {
            if (err) {
                res.send(err);
                return;
            }
            // console.log(name, results)
            res.render('dashboard', { name: name, papers: results, user: req.session.user });
        });
    });
});

// TODO: prevent duplicate usernames
app.post('/signup', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var pass = req.body.pass;
    // console.log(name, email, pass);

    var sql = `INSERT INTO Users(username, email, password) VALUES('${name}', '${email}', '${pass}')`;

    // console.log(sql);
    connection.query(sql, function (err, result) {
        if (err) {
            res.send(err);
            return;
        }
        req.session.user = { id: result.insertId };
        res.redirect(`/dashboard?id=${result.insertId}`);
    });
});



app.post('/login', (req, res) => {
    var name = req.body.name;
    var pass = req.body.pass;

    var sql = 'SELECT * FROM Users WHERE username = ? AND password = ?';

    connection.query(sql, [name, pass], (err, results) => {
        if (err) {
            console.error('Error fetching user data:', err);
            res.status(500).send({ message: 'Error fetching user data', error: err });
            return;
        }
        // console.log(results)
        // if (results.length === 1) {
        if (results.length != 0) {
            req.session.user = results[0];
            res.redirect(`/dashboard?id=${req.session.user.id}`);
        } else {
            res.status(500).send({ message: 'Invalid username or password', error: err }); // temp
        }
    });
});

app.get('/logout', (req, res) => {
    console.log("logging out");
    req.session.user = null;
    res.redirect('/');
});

app.post('/insert-paper', function (req, res) {
    console.log(req.body, req.query, req.session);

    var id = req.body.id;
    var title = req.body.title;
    var abstract = req.body.abstract;
    var author_name = 'N/A';
    if (req.session && req.session.user) {
      author_name = req.session.user.username;
    }
    console.log(id, title, abstract, author_name);

    var sql = `INSERT INTO Paper(id, title, abstract, published_date) VALUES('${id}', '${title}', '${abstract}')`;

    connection.query(sql, function (err, result) {
      if (err) {
        res.status(500).send('Error inserting paper');
        return;
      }
      res.status(200).send('Paper inserted successfully');
    });
    res.status(500).send('Error inserting paper');
    return;
});


// app.get('/search', function (req, res) {
//   var netid = req.query.netid;
//   var rating = req.query.rating;
//   console.log(rating);
//   // var sql = `SELECT title, published_date, id FROM Paper WHERE title LIKE '%${netid}%' ORDER BY published_date`;
//   var sql = `SELECT title, published_date, id FROM Paper WHERE title LIKE '%${netid}%' ORDER BY recent_add_date`;
//   console.log(sql);
//   connection.query(sql, function (err, result) {
//     if (err) {
//       res.send(err)
//       return;
//     }
//     console.log(result[0]);
//     // res.json(result);
//     res.json({
//       papers: result,
//       user: req.session.user
//     });

//   });
// });

// TODO: stored procedure
app.get('/search', function (req, res) {
    var netid = req.query.netid;
    var author = req.query.author;
    var rating = req.query.rating;
    console.log(rating);
    if (rating === "high") {
        rating = 1;
    } else if (rating === "medium") {
        rating = 2;
    } else if (rating === "low") {
        rating = 3;
    }
    // console.log(rating);

    connection.query('CALL CalculateAverageRating()', function (err, result) {
        if (err) {
            res.send(err);
            return;
        }

        var sql;
        if (rating === 'none') {
          if(author === 'none') {
            sql = `SELECT title, published_date, id FROM Paper WHERE title LIKE '%${netid}%' ORDER BY recent_add_date`;
          } 
          else {
            sql = `SELECT title, p.published_date, p.id FROM Paper p JOIN PaperAuthor pa ON p.id = pa.paperId JOIN Author a on a.id = pa.authorId WHERE p.title LIKE '%${netid}%' AND a.name = '${author}' ORDER BY recent_add_date`;
          }
        } else {
          if(author === 'none') {
            sql = `SELECT p.title, p.published_date, p.id, r.ratingStatus
            FROM Paper p
            JOIN Ratings r ON p.id = r.paperId
            WHERE p.title LIKE '%${netid}%'
            AND r.ratingStatus = '${rating}'
            ORDER BY p.recent_add_date`;
          }
          else {
            sql = `SELECT p.title, p.published_date, p.id, r.ratingStatus
             FROM Paper p
             JOIN Ratings r ON p.id = r.paperId
             JOIN PaperAuthor pa ON p.id = pa.paperId JOIN Author a on a.id = pa.authorId
             WHERE p.title LIKE '%${netid}%'
             AND r.ratingStatus = '${rating}'
             AND a.name = '${author}'
             ORDER BY p.recent_add_date`;
          }
        }

        console.log(sql);

        connection.query(sql, function (err, result) {
            if (err) {
                res.send(err);
                return;
            }

            console.log(result[0]);
            res.json({
                papers: result,
                user: req.session.user
            });
        });
    });
});


app.post('/save-paper', function (req, res) {
    var userId = req.body.userId;
    var paperId = req.body.paperId;

    var sql = `INSERT INTO UserPaper(userId, paperId) VALUES(${userId}, '${paperId}')`;
    // console.log(sql);

    connection.query(sql, function (err, result) {
        if (err) {
            res.status(500).send('Error saving paper');
            return;
        }
        res.status(200).send('Paper saved successfully');
    });
});

app.post('/remove-saved-paper', function (req, res) {
    var paperId = req.body.paperId;
    var userId = req.body.userId;

    const sql = `DELETE FROM UserPaper WHERE userId = ${userId} AND paperId = '${paperId}'`;
    // console.log(sql);

    connection.query(sql, (err, result) => {
        if (err) {
            return res.status(500).send('Error removing paper');
        }

        // FIXME: ?
        res.redirect('/');
        // res.redirect(`/dashboard?id=${userId}`);

    });
});

app.post('/delete-account', (req, res) => {
    const userId = req.session.user.id;
    const sql = `DELETE FROM Users WHERE id = ${userId} `;
    // console.log(sql);

    connection.query(sql, (err, result) => {
        if (err) {
            return res.status(500).send('Error deleting user');
        }

        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send('Error destroying session');
            }
            res.redirect('/');
        });
    });
});


app.post('/update-rating', (req, res) => {
    const { paperId, userId, rating } = req.body;

    var sql = `UPDATE UserPaper SET rating = ${rating} WHERE userId = ${userId} AND paperId = '${paperId}'`;
    // console.log(sql);

    connection.query(sql, function (err, result) {
        if (err) {
            res.status(500).send('Error updating rating');
            return;
        }
        res.status(200).send('Rating updated successfully');
    });
});

app.post('/update-notes', (req, res) => {
    const { paperId, userId, notes } = req.body;

    var sql = `UPDATE UserPaper SET notes = '${notes}' WHERE userId = ${userId} AND paperId = '${paperId}'`;
    // console.log(sql);

    connection.query(sql, function (err, result) {
        if (err) {
            res.status(500).send('Error updating notes');
            return;
        }
        res.status(200).send('Notes updated successfully');
    });
});



app.get('/api/attendance', function (req, res) {
    var sql = 'SELECT title, published_date FROM Paper ORDER BY published_date';
    connection.query(sql, function (err, results) {
        if (err) {
            console.error('Error fetching attendance data:', err);
            res.status(500).send({ message: 'Error fetching attendance data', error: err });
            return;
        }
        res.json(results);
    });
});

app.post('/api/attendance/modify/:id', function (req, res) {
    var id = req.params.id;
    var present = req.body.present; // Assuming 'present' is sent in the request body

    var sql = 'UPDATE attendance SET present = ? WHERE netid = ?';

    connection.query(sql, [present, id], function (err, result) {
        if (err) {
            console.error('Error modifying attendance record:', err);
            res.status(500).send({ message: 'Error modifying attendance record', error: err });
            return;
        }
        if (result.affectedRows === 0) {
            // No rows were affected, meaning no record was found with that ID
            res.status(404).send({ message: 'Record not found' });
        } else {
            res.send({ message: 'Attendance record modified successfully' });
        }
    });
});

app.delete('/api/attendance/delete/:id', function (req, res) {
    var id = req.params.id;

    var sql = 'DELETE FROM attendance WHERE netid = ?';

    connection.query(sql, [id], function (err, result) {
        if (err) {
            console.error('Error deleting attendance record:', err);
            res.status(500).send({ message: 'Error deleting attendance record', error: err });
            return;
        }
        if (result.affectedRows === 0) {
            // No rows were affected, meaning no record was found with that ID
            res.status(404).send({ message: 'Record not found' });
        } else {
            res.send({ message: 'Attendance record deleted successfully' });
        }
    });
});


app.listen(80, function () {
    console.log('Node app is running on port 80');
});