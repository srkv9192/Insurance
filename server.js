const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original filename
  },
});

const upload = multer({ storage: storage });
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

const policyCardSchema = new mongoose.Schema({
  customerName: String,
  customerAddress: String,
  customerPhone: Number,
  customerEmail: String,
  insuranceCompany:String,
  tpaName: String,
  policyNumber: String,
  policyStartDate: Date,
  policyEndDate: Date,
  policyDependents: String,
  policyUpload: String, 
  cardNumber: String,
  referenceNumber:String
});

//third party admin details
const counterSchema = new mongoose.Schema({
  referenceNumberCount: Number,
  cardNumberCount: Number,
  searchId : String,
  // Add more fields as needed
});

const policyCardSchemaObject = mongoose.model('policycard', policyCardSchema);

const counterSchemaObject = mongoose.model('counter', counterSchema);

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
        const docs = await loginSchemaObject.findOne({userID: req.body.userID, userPassword: req.body.userPassword});
        if (!docs) {
          res.json({message : 'Login not found, please try again with valid credentials'})
        }
        else
        {
            session=req.session;
            session.userId=req.body.userID;
            session.userType=docs.userType;
            session.userName = docs.userName;
            //res.sendFile(__dirname+'/index.html')
            res.json({message : 'loginsuccess'})
        }

      }
    catch(err)
    {
      res.status(500).json({ error: 'Error while login' });
    }
  
});

app.get('api/logout', async(req, res) => {
  try{
    req.session.destroy()
    res.json({message : 'Old session removed'})
  }
catch(err)
{
  res.status(500).json({ error: 'Failed to logout' });
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

app.get("/api/getcounter", async(req, res) => {
  try {
    // Retrieve all users login from the database
    const data = await counterSchemaObject.find({});
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get counter details' });
  }
});

//should be used only once, while setting initial values for counters
app.post('/api/setcountervalues', async(req, res) => {
  try{
        const newData = new counterSchemaObject({
                        'referenceNumberCount' : req.body.referenceNumberCount,
                        'cardNumberCount' : req.body.cardNumberCount,
                        'searchId' : "keywordforsearch"});
        const savedData = newData.save();
        res.json({ message: 'Initial counter data saved successfully', data: savedData });
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error saving counter data' });
    } 
});

app.post('/api/incrementcardcount', async(req, res) => {
  try{
        const newData = await counterSchemaObject.findOneAndUpdate({searchId: "keywordforsearch"}, {$inc:{ cardNumberCount: 1}});
        const savedData = newData.save();
        res.json({ message: 'Card count incremented successfully', data: savedData });
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error incrementing card count' });
    } 
});

app.post('/api/incrementreferencecount', async(req, res) => {
  try{
    const newData = await counterSchemaObject.findOneAndUpdate({searchId: "keywordforsearch"}, {$inc:{ referenceNumberCount: 1}});
    const savedData = newData.save();
    res.json({ message: 'Reference count incremented successfully', data: savedData });
  }
catch(err)
{
  console.error(err);
  res.status(500).json({ error: 'Error incrementing reference count' });
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

app.get("/api/getinsurancecompany", async(req, res) => {
  try {
    // Retrieve all insurance company list from the database
    const users = await  insurancecompanySchemaObject.find({});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get insurance company details' });
  }
});


app.post('/api/addtpadetail', async(req, res) => {
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

app.get("/api/gettpadetail", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  tpaSchemaObject.find({});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get tpa details' });
  }
});

app.post("/api/save-policy", async (req, res) => {
  try{
    const refNumber= await getReferenceCount();
    if(refNumber == -1)
    {
      res.status(500).json({ error: 'Error saving new card data' });
      return;
    }
    const newData = await new policyCardSchemaObject({
                  'customerName': req.body.customerName,
                  'customerAddress': req.body.customerAddress,
                  'customerPhone': req.body.customerPhone,
                  'customerEmail': req.body.customerEmail,
                  'insuranceCompany':req.body.insuranceCompany,
                  'tpaName': req.body.tpaName,
                  'policyNumber': req.body.policyNumber,
                  'policyStartDate': req.body.policyStartDate,
                  'policyEndDate': req.body.policyEndDate,
                  'policyDependents': req.body.policyDependents,
                  'policyUpload': req.body.policyUpload, 
                  'referenceNumber': refNumber,
                    });
    const savedData = newData.save();
    incrementReferenceCount();
    res.json({ message: 'success', referencenumber:refNumber,data: savedData });
  }
catch(err)
{
  console.error(err);
  res.status(500).json({ error: 'Error saving new card data' });
} 
});

app.get("/api/getallpolicydetail", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  policyCardSchemaObject.find({});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get tpa details' });
  }
});


 async function getReferenceCount () {
  try {
    const data = await counterSchemaObject.find();
    return data[0].referenceNumberCount;
  } catch (error) {
    console.error(error);
    return -1;
  }
};

  async function incrementReferenceCount ()  {
  try{
    const newData = await counterSchemaObject.findOneAndUpdate({searchId: "keywordforsearch"}, {$inc:{ referenceNumberCount: 1}});
    return newData.referenceNumberCount;
  }
  catch(err)
  {
    console.error(err);
    return -1;
  } 
};

 async function getCardCount()  {
  try {
    const data = await counterSchemaObject.find();
    return data[0].cardNumberCount;
  } catch (error) {
    console.error(error);
    return -1;
  }
};

 function incrementCardCount ()  {
  try{
    const newData =   counterSchemaObject.findOneAndUpdate({searchId: "keywordforsearch"}, {$inc:{ cardNumberCount: 1}});
    //const savedData = newData.save();
    return newData.cardNumberCount;
  }
  catch(err)
  {
    console.error(err);
    return -1;
  } 
};


app.use(express.static('public'));

app.get('/', (req, res) => res.sendfile(__dirname+'/index.html'))

app.get('/login.html', (req, res) => res.sendfile(__dirname+'/login.html'))
app.get('/newcase.html', (req, res) => res.sendfile(__dirname+'/newcase.html'))
app.get('/viewdata.html', (req, res) => res.sendfile(__dirname+'/viewdata.html'))
app.get('/dashboard.html', (req, res) => res.sendfile(__dirname+'/dashboard.html'))
app.get('/newcard.html', (req, res) => res.sendfile(__dirname+'/newcard.html'))
app.get('/paymentinfo.html', (req, res) => res.sendfile(__dirname+'/paymentinfo.html'))

app.get('/menubar.html', (req, res) => res.sendfile(__dirname+'/menubar.html'))

app.listen(port, () => console.log(`Insurance app listening on port ${port}!`))


// code to generate pdf
const PDFDocument = require('pdfkit');
const fs = require('fs');const doc = new PDFDocument({
  layout: 'landscape',
  size: 'A4',
});






doc.pipe(fs.createWriteStream('output.pdf'));doc.rect(0, 0, doc.page.width, doc.page.height).fill('#fff');


const distanceMargin = 18;doc
  .fillAndStroke('#0e8cc3')
  .lineWidth(20)
  .lineJoin('round')
  .rect(
    distanceMargin,
    distanceMargin,
    doc.page.width - distanceMargin * 2,
    doc.page.height - distanceMargin * 2,
  )
  .stroke();



  const maxWidth = 400;
const maxHeight = 300;doc.image(
  './public/images/logofull.jpg',
  doc.page.width / 3.4 - maxWidth / 2,
  60, 
  {
    fit: [maxWidth, maxHeight],
    align: 'left',
   }
);

doc.moveDown();
doc.moveDown();
doc.moveDown();
doc.moveDown();
doc
  .font('Times-Roman')
  .fontSize(16)
  .fill('#021c27')
  .text('79/A, Dravid Nagar, Ranjeet Hanuman Mandir', {
    align: 'right',
  }
);

doc.lineWidth(1);
doc.lineCap('butt')
   .moveTo(0, doc.page.width/4.5)
   .lineTo(900, doc.page.width/4.5)
   .stroke();


doc.end();
