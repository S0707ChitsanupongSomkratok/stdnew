const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3000;

const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "thsv63.hostatom.com",
    user: "google_student",
    password: "orapimwit",
    database: "google_student",
    port: 3306
});

db.connect((err) => {
    if (err) throw err;
    console.log("MySQL Connected");
});


const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/form1', (req, res) => {
    res.render('form1.ejs');
});

app.get('/form41', (req, res) => {
    res.render('form41.ejs');
});

app.get('/form42', (req, res) => {
    res.render('form42.ejs');
});


app.get('/form43', (req, res) => {
    res.render('form43.ejs');
});

app.post("/register", (req, res) => {

    const data = req.body;
    const room = data.room;   // m41
    const classs = data.class; // 4

    // นับจำนวนผู้สมัครในห้องเดียวกัน
    const sqlCount = "SELECT COUNT(*) AS total FROM stdnew WHERE room = ?";

    db.query(sqlCount, [room], (err, result) => {

        if (err) {
            console.log(err);
            return res.send("เกิดข้อผิดพลาด");
        }

        const number = result[0].total + 1;

        let id;

        if (room === "m1") {
            id = 1000 + number;
        }
        else if (room === "m41") {
            id = 4100 + number;
        }
        else if (room === "m42") {
            id = 4200 + number;
        }
        else if (room === "m43") {
            id = 4300 + number;
        }

        const sqlInsert = `
        INSERT INTO stdnew (
            id, room, class, prefix, firstname, lastname,
            bd, mb, yb, pin,
            sold, sd1, sd2, spro,
            housenum, moo, village,
            district1, district2, province,
            zipcode, tel,
            fn, fo, ftel,
            mn, mo, mtel,
            shomefm, moneyfm, skill
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `;

        const values = [

            id,
            data.room,
            data.class,
            data.prefix,
            data.firstname,
            data.lastname,

            data.bd,
            data.mb,
            data.yb,
            data.pin,

            data.sold,
            data.sd1,
            data.sd2,
            data.spro,

            data.housenum,
            data.moo,
            data.village,

            data.district1,
            data.district2,
            data.province,

            data.zipcode,
            data.tel,

            data.fn,
            data.fo,
            data.ftel,

            data.mn,
            data.mo,
            data.mtel,

            data.shomefm,
            data.moneyfm,
            data.skill
        ];

        db.query(sqlInsert, values, (err) => {

            if (err) {
                console.log(err);
                return res.send("บันทึกข้อมูลไม่สำเร็จ");
            }

            // res.send("สมัครสำเร็จ เลขที่สมัครของคุณคือ : " + id);
            res.redirect('/print/' + id);
        });

    });

});

app.get("/print/:id", (req,res)=>{

const id = req.params.id

const sql = "SELECT * FROM stdnew WHERE id = ?"

db.query(sql,[id],(err,result)=>{

const student = result[0]

res.render("form_print",{student})

})

})

app.listen(PORT, () => {
    console.log(`Server is running on port localhost:${PORT}`);
});