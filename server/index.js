const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const app = express();
const PORT = 5001;
const { encrypt, decrypt } = require("./encryption");

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "passwordmanager",
});

app.post("/addpassword", (req, res) => {
    const { userId, email, password, website } = req.body;
    const encryptedPass = encrypt(password);

    db.query(
        "INSERT INTO passwords (password, website_name, email, iv, userId) VALUES (?,?,?,?,?)",
        [encryptedPass.password, website, email, encryptedPass.iv, userId],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send("Success");
            }
        }
    );
});

app.get("/showpasswords/:userId", (req, res) => {
    const userId = req.params.userId;
    db.query(
        "SELECT * FROM passwords WHERE userId = ?",
        [userId],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        }
    );
});

app.post("/decryptpassword", (req, res) => {
    res.send(decrypt(req.body));
});

// LOGIN / REGISTER MASTER ACCOUNT

app.post("/register", (req, res) => {
    const { email, password } = req.body;
    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Server error");
            }
            if (results.length > 0) {
                return res.status(400).send("Account already exists.");
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            db.query(
                "INSERT INTO users (email, master_password) VALUES (?, ?)",
                [email, hashedPassword],
                (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).send("Error creating account");
                    } else {
                        res.send("Account creation success");
                    }
                }
            );
        }
    );
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.query(
        "SELECT userId, master_password from users WHERE email = ?",
        [email],
        async (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send("Server error");
            }
            if (results.length === 0) {
                return res
                    .status(404)
                    .send("Account does not exist. Please sign up first.");
            }

            const passwordMatch = await bcrypt.compare(
                password,
                results[0].master_password
            );
            if (passwordMatch) {
                res.json({
                    message: "Login success",
                    userId: results[0].userId,
                });
            } else {
                res.status(400).send("Invalid password");
            }
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server is running in port ${PORT}`);
});
