import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  user: 'root',
  host: 'postgres',
  database: 'postgres',
  password: 'root',
  port: 5432,
});

const getBooking = (request, response) => {
    pool.query('SELECT * FROM booking', (error, results) => {
        if(error){
                throw error
        }
        response.status(200).json(results.rows);
    })
}

const getUsers = (request, response) => {
  pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const getUserById = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}
