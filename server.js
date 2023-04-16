
import pg from 'pg';
import express from 'express';
import cors from "cors";
const app = express();
const port = 8080;

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const client = new pg.Client({
    password: "root",
    user: "root",
    host: "postgres",
});

app.get("/booking", cors(corsOptions), function (req, res) {
    // const results = await client
    //     .query("SELECT * FROM employees")
    //     .then((payload) => {
    //         return payload.rows;
    //     })
    //     .catch(() => {
    //         throw new Error("Query failed");
    //     });
    console.log(req.origin)
    const results = { "json": "success" }
    res.json(results);
});


(async () => {
    await client.connect();

    app.listen(port, () => {
        console.log(`CORS-enabled web server listening on port 80`);
    });
})();