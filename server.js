
import pg from 'pg';
import express from 'express';
const app = express();
const port = 8080;

app.get('/', (req, res) => {
    res.send("API");
});

const client = new pg.Client({
    password: "root",
    user: "root",
    host: "postgres",
});

app.get("/booking", async (req, res) => {
    // const results = await client
    //     .query("SELECT * FROM employees")
    //     .then((payload) => {
    //         return payload.rows;
    //     })
    //     .catch(() => {
    //         throw new Error("Query failed");
    //     });
    const results = { "json": "success" }
    res.setHeader("Content-Type", "application/json");
    res.status(200);
    res.send(JSON.stringify(results));
});


(async () => {
    await client.connect();

    app.listen(port, () => {
        console.log(`Server is listening at http://localhost:${port}`);
    });
})();