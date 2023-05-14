const express = require('express')
const app = express()
const port = process.env.PORT || 80

var bodyParser = require('body-parser')

        app.use(bodyParser.urlencoded({ extended: false }))
        app.use(bodyParser.json())

        app.post('/login', function(req, res){
            // if username = admin, password = admin
            if(req.body.username == "admin" && req.body.password == "admin")
                res.json({'message' : 'success'});
            else
                res.json({'message': 'failure'});
        })

var mongoose = require('mongoose');

mongoose.connect('');

var userSchema = new mongoose.Schema({
    employee: String,
    VisitingOrg : String,
    Dateofvisit : String,
    Issuedescription : String,
    ResolutionOfIssue : String
});

var User = mongoose.model('tshirts', userSchema);

app.post('/register', function(req, res){
    var user = new User({'employee' : req.body.employee, 'VisitingOrg': req.body.VisitingOrg, 'Dateofvisit': req.body.DOV , 'Issuedescription': req.body.IssueDescription, 'ResolutionOfIssue': req.body.ResolutionOfIssue}) 
    
    user.save(function(err, savedUser){
        if(err)
            res.json({message : 'failures'})
        else
            res.json({message : 'successs'})
    });
})

app.post('/gettodo', function(req, res){
    User.find({}, function(err, userObj){
        res.json(userObj);
    })
})


app.post('/delete', function(req, res){ 
        User.findOneAndDelete({'password' : req.body.password}).then((doc) => {
        
            res.json({message : 'successs'})
        
        })
})

app.get('/', (req, res) => res.sendfile(__dirname+'/index.html'))

app.get('/fetch', function(req, res){ 
    User.find(function (err, docs) {
        if (err){
            res.json({message : 'failure'})
        }
        else{
            res.json(docs);
        }
    });
   
})



app.listen(port, () => console.log(`Example app listening on port ${port}!`))
