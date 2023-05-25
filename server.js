const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express()
const port = process.env.PORT || 80

// Connect to local MongoDB database
mongoose.connect('mongodb://127.0.0.1:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const cookieParser = require("cookie-parser");
const sessions = require('express-session');
app.use(cookieParser());

var session;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: 1000 * 60 * 60 * 2},
    resave: false 
}));

// Create a schema
const dataSchema = new mongoose.Schema({
  customerName: String,
  customerAddress: String,
  customerPhone: String,
  claimNumber: String,
  insuranceCompanyName: String,
  // Add more fields as needed
});

const loginSchema = new mongoose.Schema({
  userName: String,
  userPassword: String,
  userID: String,
  userType: String
  // Add more fields as needed
});

//insurance company details
const insurancecompanySchema = new mongoose.Schema({
  companyName: String
  // Add more fields as needed
});

//third party admin details
const tpaSchema = new mongoose.Schema({
  tpaName: String
  // Add more fields as needed
});


// Create a model based on the schema
const dataSchemaObject = mongoose.model('Data', dataSchema);
//login table
const loginSchemaObject = mongoose.model('login', loginSchema);

//table to hold insurance company list
const insurancecompanySchemaObject = mongoose.model('insurancecompanydetails', insurancecompanySchema);

//table to hold tpa(third party admin) list
const tpaSchemaObject = mongoose.model('tpadetails', tpaSchema);


// Parse JSON bodies for POST requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/login', async(req, res) => {
  try{
      loginSchemaObject.findOne({ userId: req.body.userID , password: req.body.userPassword, userType: req.body.userType}, function (err, docs) {
      if (err){
          //console.log(err)
          res.send(err);
      }
      else{
          //console.log("Result : ", docs);
          if (docs == null) {
              res.json({message : 'Login not found, please try again with valid credentials'})
          }
          else
          {
              session=req.session;
              session.userId=req.body.userId;
              session.userType=docs.userType;
              session.userName = docs.userName;
              //res.sendFile(__dirname+'/index.html')
              res.json({message : 'loginsuccess'})
          }
          //res.send(docs);
      }
  });
        res.json({ message: 'Data saved successfully', data: savedData });
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error while login' });
    }
  
});


// Define the API endpoint to save data
app.post('/api/data', async(req, res) => {
  try{
        console.error(req.body.customerName);
        const newData = new dataSchemaObject({
                        'customerName' : req.body.customerName,
                        'customerAddress' : req.body.customerAddress,
                        'customerPhone' : req.body.customerPhone,
                        'claimNumber' : req.body.claimNumber,
                        'insuranceCompanyName' : req.body.insuranceCompanyName});
        const savedData = newData.save();
        res.json({ message: 'Data saved successfully', data: savedData });
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error saving data' });
    }
  
});


app.post('/api/addlogin', async(req, res) => {
  try{
        const newData = new loginSchemaObject({
                        'userName' : req.body.userName,
                        'userPassword' : req.body.userPassword,
                        'userID' : req.body.userID,
                        'userType' : req.body.userType});
        const savedData = newData.save();
        res.json({ message: 'Login Data saved successfully', data: savedData });
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error saving Login data' });
    } 
});

//Not needed added for testing purpose
app.get("/api/getlogin", async(req, res) => {
  try {
    // Retrieve all users login from the database
    const users = await loginSchemaObject.find({});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get login details' });
  }
});



app.post('/api/addinsurancecompany', async(req, res) => {
  try{
        const newData = new insurancecompanySchemaObject({
                        'companyName' : req.body.companyName
                        });
        const savedData = newData.save();
        res.json({ message: 'Insurance company data saved successfully', data: savedData });
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error saving insurance company data' });
    } 
});


app.post('/api/addtpa', async(req, res) => {
  try{
        const newData = new tpaSchemaObject({
                        'tpaName' : req.body.tpaName
                        });
        const savedData = newData.save();
        res.json({ message: 'TPA data saved successfully', data: savedData });
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error saving TPA data' });
    } 
});


app.use(express.static('public'));

app.get('/', (req, res) => res.sendfile(__dirname+'/index.html'))

app.get('/login.html', (req, res) => res.sendfile(__dirname+'/login.html'))
app.get('/newcase.html', (req, res) => res.sendfile(__dirname+'/newcase.html'))
app.get('/viewdata.html', (req, res) => res.sendfile(__dirname+'/viewdata.html'))
app.get('/dashboard.html', (req, res) => res.sendfile(__dirname+'/dashboard.html'))

app.listen(port, () => console.log(`Insurance app listening on port ${port}!`))
