const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3000;

const mysql = require("mysql2");

const db = mysql.createPool({
    host: "thsv63.hostatom.com",
    user: "google_student",
    password: "orapimwit",
    database: "google_student",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true, // ช่วยรักษาการเชื่อมต่อให้ไม่หลุดง่าย
    keepAliveInitialDelay: 10000
});

// ไม่ต้องใช้ db.connect() แล้วครับ Pool จะเชื่อมต่อให้เองเมื่อมีการ Query
console.log("MySQL Pool Created");

// เวลาใช้งานในจุดอื่นๆ ของ server.js ใช้ db.query() เหมือนเดิมได้เลย ไม่ต้องแก้เยอะ



const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/formall', (req, res) => {
    res.render('formall.ejs');
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

    
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear() + 543;
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    
    const fullDate = `${d}-${m}-${y}-${h}:${min}`;
    const datere = `${y - 543}-${m}-${d}`;


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
            shomefm, moneyfm, skill, timere, datere
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
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
            data.skill,

            fullDate,
            datere
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

    });

});


app.get("/card/:id", (req,res)=>{

        const id = req.params.id

        const sql = "SELECT * FROM stdnew WHERE id = ?"

        db.query(sql,[id],(err,result)=>{

        const student = result[0]

        res.render("cardstdnew",{student})

    });

});

app.get('/searchprint', (req, res) => {
    res.render('searchprint');
});

app.get('/searchcard', (req, res) => {
    res.render('searchcard');
});

app.get("/showstdnew", (req, res) => {

    const sql = "SELECT * FROM stdnew ORDER BY room, id";

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.send("database error");
        }

        const grouped = {
            m1: [],
            m41: [],
            m42: [],
            m43: []
        };

        result.forEach(std => {

            if (grouped[std.room]) {
                grouped[std.room].push(std);
            }

        });

        res.render("showstdnew", {
            data: grouped
        });

    });

});

app.get('/test', (req, res) => {
    res.render('test');
});

// หน้าสำหรับแสดงฟอร์มแก้ไข (ดึงข้อมูลเก่ามาโชว์)
app.get('/edit/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM stdnew WHERE id = ?';
    
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        // ส่งข้อมูลแถวแรก (result[0]) ไปที่ไฟล์ ejs
        res.render('edit', { std: result[0] }); 
    });
});

app.post('/update/:id', (req, res) => {

    const id = req.params.id;

    const {
        room, class: class_val, prefix, firstname, lastname,
        bd, mb, yb, housenum, moo, village, district1, district2,
        province, zipcode, tel, pin,
        fn, fo, ftel,
        mn, mo, mtel,
        sold, sd1, sd2, spro,
        shomefm, moneyfm, skill
    } = req.body;

    const sql = `
    UPDATE stdnew SET
        room = ?,
        class = ?,
        prefix = ?,
        firstname = ?,
        lastname = ?,
        bd = ?,
        mb = ?,
        yb = ?,
        housenum = ?,
        moo = ?,
        village = ?,
        district1 = ?,
        district2 = ?,
        province = ?,
        zipcode = ?,
        tel = ?,
        pin = ?,
        fn = ?,
        fo = ?,
        ftel = ?,
        mn = ?,
        mo = ?,
        mtel = ?,
        sold = ?,
        sd1 = ?,
        sd2 = ?,
        spro = ?,
        shomefm = ?,
        moneyfm = ?,
        skill = ?
    WHERE id = ?
    `;

    const values = [
        room, class_val, prefix, firstname, lastname,
        bd, mb, yb,
        housenum, moo, village,
        district1, district2, province, zipcode,
        tel, pin,
        fn, fo, ftel,
        mn, mo, mtel,
        sold, sd1, sd2, spro,
        shomefm, moneyfm, skill,
        id
    ];

    db.query(sql, values, (err) => {

        if (err) {
            console.log(err);
            return res.send("เกิดข้อผิดพลาดในการแก้ไขข้อมูล");
        }

        res.redirect('/showstdnew');

    });

});

app.get('/delete/:id', (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM stdnew WHERE id = ?";

    db.query(sql, [id], (err) => {

        if (err) {
            console.log(err);
            return res.send("ลบข้อมูลไม่สำเร็จ");
        }

        res.redirect('/stdor');

    });

});

app.get("/showday/:date", (req, res) => {

    const date = req.params.date;

    const sql = "SELECT * FROM stdnew WHERE datere = ? ORDER BY room, id";

    db.query(sql, [date], (err, result) => {

        if (err) {
            console.log(err);
            return res.send("database error");
        }

        const grouped = {
            m1: [],
            m41: [],
            m42: [],
            m43: []
        };

        result.forEach(std => {

            if (grouped[std.room]) {
                grouped[std.room].push(std);
            }

        });

        res.render("showday", {
            data: grouped,
            date: date
        });

    });

});

app.get('/stdor', (req, res) => {
    const sql = "SELECT * FROM stdnew ORDER BY room, id";

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);
            return res.send("database error");
        }

        const grouped = {
            m1: [],
            m41: [],
            m42: [],
            m43: []
        };

        result.forEach(std => {

            if (grouped[std.room]) {
                grouped[std.room].push(std);
            }

        });

        res.render("stdor", {
            data: grouped
        });

    });

});

app.get('/admin', (req, res) => {
    res.render('admin.ejs');
})

app.listen(PORT, () => {
    console.log(`Server is running on port localhost:${PORT}`);
});