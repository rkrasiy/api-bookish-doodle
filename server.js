
import pg from 'pg';
import express from 'express';
const app = express();
const port = 3000;
app.get('/', (req, res)=>{
    res.send("API");
});

const client = new pg.Client({
  password: "root",
  user: "root",
  host: "postgres",
});


(async () => {
  await client.connect();

  app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
  });
})();