const express = require('express')
const cors=require('cors')
const PORT = 3000;
const app = express()
const bodyParser = require('body-parser');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors())

const postRoutes=require('./routes/postRoutes')
app.use('/',postRoutes)

app.listen(PORT, (err) => {
    if (err) throw err;
    else {
        console.log("Server runs on " + PORT)
    }
})
