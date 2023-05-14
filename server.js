const express = require('express')
const app = express()
const port = process.env.PORT || 80

var bodyParser = require('body-parser')

        app.use(bodyParser.urlencoded({ extended: false }))
        app.use(bodyParser.json())

app.use(express.static('public'));

app.get('/', (req, res) => res.sendfile(__dirname+'/index.html'))

app.get('/login.html', (req, res) => res.sendfile(__dirname+'/login.html'))
app.get('/newcase.html', (req, res) => res.sendfile(__dirname+'/newcase.html'))
app.get('/viewdata.html', (req, res) => res.sendfile(__dirname+'/viewdata.html'))

app.listen(port, () => console.log(`Insurance app listening on port ${port}!`))
