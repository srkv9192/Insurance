const express = require('express')
const app = express()
const port = process.env.PORT || 80

var bodyParser = require('body-parser')

        app.use(bodyParser.urlencoded({ extended: false }))
        app.use(bodyParser.json())

app.get('/', (req, res) => res.sendfile(__dirname+'/index.html'))

app.listen(port, () => console.log(`Insurance app listening on port ${port}!`))
