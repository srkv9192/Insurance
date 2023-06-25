const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const AWS = require('aws-sdk');
var fs = require('fs');

// AWS S3 configuration
const s3 = new AWS.S3()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original filename
  },
});

var nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
      type: 'OAuth2',
      user: 'Nidaancard@gmail.com',
      clientId: "157725426494-1iof3ceh6j469a7srp9obhie5e4t0u1j.apps.googleusercontent.com",
      clientSecret: "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",
      refreshToken: "1//04ije556NOO5jCgYIARAAGAQSNwF-L9Ir90KP5wW_GeD0p5gkYiHbIM1C5zegEs07_bWkHQuIxu4EmxlTFe9Xsz8nDDo9_laHhd8",
      accessToken: "ya29.a0AWY7CkkTH71980bdJEprtXBTtOIJ-0gLBDvBUTETp5TlSa05HXpzr1Rq2f_OFhQQWXmsFTeyy-zlswpmyOM5vrgsE0FRNSyT-erSd3Q5j82JVRKTdfrRA52S5j-pn8l13Lkwjep3NphNPD2CKhiEOzHMqF7QaCgYKAYQSARMSFQG1tDrpCr2wQyhfhdsUGjKd22KBQQ0163",
      expires: 1484314697598
  }
});

const upload = multer({ storage: storage });
const app = express()
const port = process.env.PORT || 80

// Connect to local MongoDB database
//mongodb+srv://<username>:<password>@cluster0.rldiof1.mongodb.net/?retryWrites=true&w=majority
//mongodb://127.0.0.1:27017/test
//mongoose.connect('mongodb+srv://<username>:<password>@cluster0.rldiof1.mongodb.net/nidaandatabase?retryWrites=true&w=majority', {
//  useNewUrlParser: true,
//  useUnifiedTopology: true,
//});

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
  customerEmail: String,
  claimNumber: String,
  claimAmount: Number,
  approvedAmount:Number,
  insuranceCompanyName: String,
  tpaName: String,
  policyNumber: String,
  policyUpload: String, 
  casereferenceNumber : String,
  caseNumber: String,
  managerID: String,
  managerName: String,
  cpID: String,
  cpName: String,
  directCase: String,
  caseCity: String,
  isProspect: String,
  isPendingAuth: String,
  isLive: String,
  isCompleted: String,
  processingFee: Number,
  consultationCharge: Number,
  chequeAmount : Number,
  chequeNumber : String,
  bankName : String,
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
  companyName: String,
  insuranceType: String
  // Add more fields as needed
});

//third party admin details
const tpaSchema = new mongoose.Schema({
  tpaName: String
  // Add more fields as needed
});

//Manager schema 
const managerSchema = new mongoose.Schema({
  managerID: String,
  managerName: String,
  phone: String,
  email: String,
  location: String,
  // Add more fields as needed
});

//Channel partner schema 
const cpSchema = new mongoose.Schema({
  cpID: String,
  cpName: String,
  managerID: String,
  phone: String,
  email: String,
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
  referenceNumber:String,
  managerID: String,
  managerName: String,
  cpID: String,
  cpName: String,
  directCase: String,
  inquiryDate: Date,
  cardStartDate: Date,
  cardEndDate: Date,
});

//third party admin details
const counterSchema = new mongoose.Schema({
  referenceNumberCount: Number,
  cardNumberCount: Number,
  searchId : String,
  managerCount: Number,
  cpCount: Number,
  caseReferenceNumberCount: Number,
  caseNumberCount: Number,
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

//table to hold manager details
const managerSchemaObject = mongoose.model('managerdetails', managerSchema);

//table to hold channel partner details
const cpSchemaObject = mongoose.model('cpdetails', cpSchema);


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

app.get('/api/logout', async(req, res) => {
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
app.post('/api/addprospect', async(req, res) => {
  try{
        const refNumber= await getCaseReferenceCount();
        if(refNumber == -1)
        {
          res.status(500).json({ error: 'Error saving prospect data' });
          return;
        }

        const newData = new dataSchemaObject({
                        customerName : req.body.customerName,
                        customerAddress: req.body.customerAddress,
                        customerPhone: req.body.customerPhone,
                        customerEmail:req.body.customerEmail,
                        insuranceCompanyName: req.body.insuranceCompanyName,
                        tpaName: req.body.tpaName,
                        claimNumber: req.body.claimNumber,
                        claimAmount: req.body.claimAmount,
                        cpName: req.body.cpName,
                        cpID: req.body.cpID,
                        managerName: req.body.managerName,
                        managerID: req.body.managerID,
                        directCase: req.body.directCase,
                        caseCity: req.body.caseCity,
                        casereferenceNumber : refNumber,
                        caseNumber: "",
                        isProspect:"true",
                      });
        const savedData = await newData.save();
        incrementCaseReferenceCount();
        res.json({ message: 'success', referencenumber:refNumber,data: savedData });
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error saving data' });
    }
  
});
/*

app.post('/api/addcpdetail', async(req, res) => {
  try{
        const refNumber= await getcpCount();
        if(refNumber == -1)
        {
          res.status(500).json({ error: 'Error saving manager data' });
          return;
        }
        const newData = new cpSchemaObject({
                        'cpID' : "CP_" + refNumber,
                        'cpName' : req.body.cpName,
                        'managerID': req.body.managerID,
                        'phone' : req.body.phone,
                        'email' : req.body.email,
                        });
        const savedData = newData.save();
        incrementcpCount();
        res.json({ message: 'CP data saved successfully', data: savedData });
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error saving Manager data' });
    } 
});

*/


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
                        'managerCount': req.body.managerCount,
                        'cpCount': req.body.cpCount,
                        'caseReferenceNumberCount': req.body.caseReferenceNumberCount,
                        'caseNumberCount': req.body.caseNumberCount,
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


app.post('/api/incrementmanagercount', async(req, res) => {
  try{
    const newData = await counterSchemaObject.findOneAndUpdate({searchId: "keywordforsearch"}, {$inc:{ managerCount: 1}});
    const savedData = newData.save();
    res.json({ message: 'Manager count incremented successfully', data: savedData });
  }
catch(err)
{
  console.error(err);
  res.status(500).json({ error: 'Error incrementing manager count' });
} 
});


app.post('/api/incrementcpcount', async(req, res) => {
  try{
    const newData = await counterSchemaObject.findOneAndUpdate({searchId: "keywordforsearch"}, {$inc:{ cpCount: 1}});
    const savedData = newData.save();
    res.json({ message: 'CP count incremented successfully', data: savedData });
  }
catch(err)
{
  console.error(err);
  res.status(500).json({ error: 'Error incrementing CP count' });
} 
});


app.post('/api/addinsurancecompany', async(req, res) => {
  try{
        const newData = new insurancecompanySchemaObject({
                        'companyName' : req.body.companyName,
                        'insuranceType': req.body.insuranceType
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



app.post('/api/addmanagerdetail', async(req, res) => {
  try{
        const refNumber= await getManagerCount();
        if(refNumber == -1)
        {
          res.status(500).json({ error: 'Error saving manager data' });
          return;
        }
        const newData = new managerSchemaObject({
                        'managerID' : "MAN_" + refNumber,
                        'managerName' : req.body.managerName,
                        'phone' : req.body.phone,
                        'email' : req.body.email,
                        'location': req.body.location,
                        });
        const savedData = newData.save();
        incrementManagerCount();
        res.json({ message: 'Manager data saved successfully', data: savedData });
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error saving Manager data' });
    } 
});

app.get("/api/getmanagerdetail", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  managerSchemaObject.find({});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get manager details' });
  }
});


app.post('/api/addcpdetail', async(req, res) => {
  try{
        const refNumber= await getcpCount();
        if(refNumber == -1)
        {
          res.status(500).json({ error: 'Error saving manager data' });
          return;
        }
        const newData = new cpSchemaObject({
                        'cpID' : "CP_" + refNumber,
                        'cpName' : req.body.cpName,
                        'managerID': req.body.managerID,
                        'phone' : req.body.phone,
                        'email' : req.body.email,
                        });
        const savedData = newData.save();
        incrementcpCount();
        res.json({ message: 'CP data saved successfully', data: savedData });
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error saving Manager data' });
    } 
});

app.get("/api/getcpdetail", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  cpSchemaObject.find({});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get CP details' });
  }
});


app.post("/api/save-policy", async (req, res) => {
  try{
    const refNumber= await getReferenceCount();
    const inquirydate= new Date();
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
                  'cardNumber': "",
                  'managerID': req.body.managerID, 
                  'managerName': req.body.managerName, 
                  'cpID': req.body.cpID, 
                  'cpName': req.body.cpName,
                  'directCase' : req.body.directCase,
                  'inquiryDate': inquirydate
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


app.post("/api/generatepolicycard", async (req, res) => {
  try{
    const refNumber= req.body.referenceNumber;
    const cardnumber= await getCardCount();
    if(cardnumber == -1)
    {
      res.status(500).json({ error: 'Error generating new card' });
      return;
    }
    cardnumberstring = "CS_" + cardnumber
    await updateCardDetails(refNumber, cardnumberstring );

   await incrementCardCount();
    res.json({ message: 'success', cardnumber:cardnumberstring });
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

app.get("/api/getpendingpolicydetail", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  policyCardSchemaObject.find({cardNumber: ""});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get tpa details' });
  }
});

app.get("/api/getpendingpolicyCount", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  policyCardSchemaObject.find({cardNumber: ""}).count();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get pending policy count' });
  }
});

app.get("/api/getlivepolicyCount", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  policyCardSchemaObject.find({cardNumber : {"$exists" : true, "$ne" : ""}}).count();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get tpa details' });
  }
});

app.get("/api/getprospectcasedetail", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  dataSchemaObject.find({isProspect: "true"});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get pending case details' });
  }
});

app.get("/api/getprospectcasedetailbyref", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    console.log(req.query.casereferenceNumber)

    const users = await  dataSchemaObject.find({casereferenceNumber: req.query.casereferenceNumber});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get pending case details by ref' });
  }
});

app.post('/api/movecasetolivebyref', upload.single('pdfFile'), async(req, res) => {
  try{
    const gencaseNumber= await getCaseNumbereCount();
    if(gencaseNumber == -1)
    {
      res.status(500).json({ error: 'Error saving case data' });
      return;
    }
    casenumberstring = "CN_" + gencaseNumber;

    const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, 
      {  processingFee: req.body.processingFee,
        consultationCharge: req.body.consultationCharge,
        chequeAmount : req.body.chequeAmount,
        chequeNumber : req.body.chequeNumber,
        bankName : req.body.bankName,
        caseNumber: casenumberstring,
        isPendingAuth: "false",
        isLive: "true",
      }, {new : true});

      incrementCaseNumberCount();


      const file = req.file;
      console.log(file)
      console.log(__dirname)

  const filePath = __dirname + `/uploads/${file.originalname}`;

  // Read the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).send('Error reading file');
      return;
    }

    // Upload the file to AWS S3
    const uploadParams = {
      Bucket: 'cyclic-kind-pig-gloves-eu-west-3',
      Key: `uploads/${casenumberstring}.pdf`,
      Body: data,
    };

    s3.upload(uploadParams, (err, result) => {
      if (err) {
        console.error('Error uploading file to S3:', err);
        //res.status(500).send('Error uploading file to S3');
        return;
      }

      console.log('File uploaded successfully:', result.Location);
      //res.status(200).send('File uploaded successfully');
    });
  });

      res.json({ message: 'Case data saved successfully', casenumberstring: casenumberstring });
  }
  catch(err)
  {
    console.error(err);
    res.json({ message: 'Failed to upload file.' });
  } 
});


app.post('/api/movecasetopendingauthbyref', async(req, res) => {
  try{
    const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, 
      {  isProspect:"false",
         isPendingAuth:"true",
      }, {new : true});

      incrementCaseNumberCount();
      res.json({ message: 'Case data updated successfully', casereferenceNumber: req.body.casereferenceNumber });
  }
  catch(err)
  {
    console.error(err);
    return -1;
  } 
});

/*

  try{
    const cardstartdate= new Date();
    const cardenddate= new Date() ;
    cardenddate.setDate(cardstartdate.getDate() + 365);
    const newData = await policyCardSchemaObject.findOneAndUpdate({referenceNumber: refNumber}, 
      { cardStartDate: cardstartdate , cardEndDate: cardenddate, cardNumber: cardnumber}, {new : true});
    return newData.cardNumber;
  }
  catch(err)
  {
    console.error(err);
    return -1;
  } 
*/


// add logic later to differentiate live from completed
app.get("/api/getlivecasedetail", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  dataSchemaObject.find({caseNumber : {"$exists" : true, "$ne" : ""}});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get live case details' });
  }
});

// 
app.get("/api/getpendingauthcasedetail", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  dataSchemaObject.find({isPendingAuth : {"$exists" : true, "$eq" : "true"}});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get live case details' });
  }
});


app.get("/api/getprospectcaseCount", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  dataSchemaObject.find({isProspect: "true"}).count();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get tpa details' });
  }
});

app.get("/api/getpendingauthcaseCount", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  dataSchemaObject.find({isPendingAuth: "true"}).count();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get tpa details' });
  }
});

app.get("/api/getlivecaseCount", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  dataSchemaObject.find({caseNumber : {"$exists" : true, "$ne" : ""}}).count();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get tpa details' });
  }
});

app.get("/api/getcompletedpolicydetail", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  policyCardSchemaObject.find({cardNumber : {"$exists" : true, "$ne" : ""}});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get tpa details' });
  }
});

app.post("/api/sendcardemail", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const docs = await policyCardSchemaObject.findOne({cardNumber: req.body.policyCardNumber});
    if (!docs) {
      res.status(500).json({ error: 'Invalid card number, cant send email.' });
    }
    else
    {
        console.log(docs);
        const response = await downloadCardPDF(docs);
        sendCompletionEmails(docs);
         res.json("Email sent.");
    }
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send card over email.'});
  }
});

app.post("/api/downloadcard", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const docs = await policyCardSchemaObject.findOne({cardNumber: req.body.cardNumber});
    if (!docs) {
      //res.json({message : 'Card number not found, Please try again with a valid number'})
      //console.error(error);
      res.status(500).json({ error: 'Invalid card number.' });
    }
    else
    {
      console.log(docs);
        const response = await downloadCardPDF(docs);
        var fileName = 'CardNew.pdf';
        console.log(response);
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', 'attachment; filename="' + fileName + '"');
        res.download("./CardNew.pdf");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to download card.' });
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


 async function getManagerCount () {
  try {
    const data = await counterSchemaObject.find();
    return data[0].managerCount;
  } catch (error) {
    console.error(error);
    return -1;
  }
};

  async function incrementManagerCount ()  {
  try{
    const newData = await counterSchemaObject.findOneAndUpdate({searchId: "keywordforsearch"}, {$inc:{ managerCount: 1}});
    return newData.managerCount;
  }
  catch(err)
  {
    console.error(err);
    return -1;
  } 
};


 async function getcpCount () {
  try {
    const data = await counterSchemaObject.find();
    return data[0].cpCount;
  } catch (error) {
    console.error(error);
    return -1;
  }
};

  async function incrementcpCount ()  {
  try{
    const newData = await counterSchemaObject.findOneAndUpdate({searchId: "keywordforsearch"}, {$inc:{ cpCount: 1}});
    return newData.cpCount;
  }
  catch(err)
  {
    console.error(err);
    return -1;
  } 
};

 async function getCaseReferenceCount () {
  try {
    const data = await counterSchemaObject.find();
    return data[0].caseReferenceNumberCount;
  } catch (error) {
    console.error(error);
    return -1;
  }
};

  async function incrementCaseReferenceCount ()  {
  try{
    const newData = await counterSchemaObject.findOneAndUpdate({searchId: "keywordforsearch"}, {$inc:{ caseReferenceNumberCount: 1}});
    return newData.caseReferenceNumberCount;
  }
  catch(err)
  {
    console.error(err);
    return -1;
  } 
};

async function getCaseNumbereCount () {
  try {
    const data = await counterSchemaObject.find();
    return data[0].caseNumberCount;
  } catch (error) {
    console.error(error);
    return -1;
  }
};

  async function incrementCaseNumberCount ()  {
  try{
    const newData = await counterSchemaObject.findOneAndUpdate({searchId: "keywordforsearch"}, {$inc:{ caseNumberCount: 1}});
    return newData.caseNumberCount;
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

 async function incrementCardCount ()  {
  try{
    const newData = await  counterSchemaObject.findOneAndUpdate({searchId: "keywordforsearch"}, {$inc:{ cardNumberCount: 1}});
    //const savedData = newData.save();
    return newData.cardNumberCount;
  }
  catch(err)
  {
    console.error(err);
    return -1;
  } 
};

async function updateCardDetails (refNumber, cardnumber)  {
  try{
    const cardstartdate= new Date();
    const cardenddate= new Date() ;
    cardenddate.setDate(cardstartdate.getDate() + 365);
    const newData = await policyCardSchemaObject.findOneAndUpdate({referenceNumber: refNumber}, 
      { cardStartDate: cardstartdate , cardEndDate: cardenddate, cardNumber: cardnumber}, {new : true});
    return newData.cardNumber;
  }
  catch(err)
  {
    console.error(err);
    return -1;
  } 
};

app.get('/api/whoami',(req,res) => {
  session=req.session;
  if(session.userId && (session.userType == 'admin')){
      res.json({message : 'admin', username : session.userName})
  }
  else if(session.userId && (session.userType == 'engineer')){
      res.json({message : 'engineer', username : session.userName})
  }
  else if(session.userId && (session.userType == 'coordinator')){
      res.json({message : 'coordinator', username : session.userName})
  }
  else
     res.json({message : 'invalid'})
})


app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(__dirname+'/index.html'))
app.get('/index.html', (req, res) => res.sendFile(__dirname+'/index.html'))

app.get('/login.html', (req, res) => res.sendFile(__dirname+'/login.html'))
app.get('/logout.html', (req, res) => res.sendFile(__dirname+'/logout.html'))
app.get('/newcase.html', (req, res) => res.sendFile(__dirname+'/newcase.html'))
app.get('/viewprospectcases.html', (req, res) => res.sendFile(__dirname+'/viewprospectcases.html'))
app.get('/viewpendingauthcases.html', (req, res) => res.sendFile(__dirname+'/viewpendingauthcases.html'))


app.get('/viewcases.html', (req, res) => res.sendFile(__dirname+'/viewcases.html'))
app.get('/movecasetolive.html', (req, res) => res.sendFile(__dirname+'/movecasetolive.html'))
app.get('/dashboard.html', (req, res) => res.sendFile(__dirname+'/dashboard.html'))
app.get('/newcard.html', (req, res) => res.sendFile(__dirname+'/newcard.html'))
app.get('/newcarddirect.html', (req, res) => res.sendFile(__dirname+'/newcarddirect.html'))
app.get('/paymentinfo.html', (req, res) => res.sendFile(__dirname+'/paymentinfo.html'))
app.get('/viewcards.html', (req, res) => res.sendFile(__dirname+'/viewcards.html'))
app.get('/viewpendingcards.html', (req, res) => res.sendFile(__dirname+'/viewpendingcards.html'))

app.get('/generatelegalpdf.html', (req, res) => res.sendFile(__dirname+'/generatelegalpdf.html'))
app.get('/generatecardpdf.html', (req, res) => res.sendFile(__dirname+'/generatecardpdf.html'))
app.get('/addprospect.html', (req, res) => res.sendFile(__dirname+'/addprospect.html'))

app.get('/menubar.html', (req, res) => res.sendFile(__dirname+'/menubar.html'))

app.listen(port, () => console.log(`Insurance app listening on port ${port}!`))


// code to generate pdf

//https://blog.logrocket.com/managing-pdfs-node-pdf-lib/
// we can use pdf-lib instead of pdf-kit to modify an existing pdf

app.post("/api/getlegalpdf", async (req, res) => {
  try{

    const response = await createPDF(req);
    var fileName = 'file.pdf';

      console.log(response);
      res.set('Content-Type', 'application/pdf');
      res.set('Content-Disposition', 'attachment; filename="' + fileName + '"');
      res.download("./Legal.pdf");
    

    //res.download("./Legal.pdf");
    //res.json({ message: 'success' });
  }
catch(err)
{
  console.error(err);
  res.status(500).json({ error: 'Error Generating PDF' });
} 
});


app.post("/api/viewpolicypdf", async (req, res) => {
  try{

    let my_file = await s3.getObject({
      Bucket: "cyclic-kind-pig-gloves-eu-west-3",
      Key: `uploads/${req.body.casenumber}.pdf`,
  }).promise()

    //const response = await createPDF(req);
    var fileName = 'file.pdf';

      //console.log(response);
     // res.set('Content-Type', 'application/pdf');
      //res.set('Content-Disposition', 'attachment; filename="' + fileName + '"');
      //res.send(my_file);

      res.setHeader('Content-Type', 'application/pdf');
      
    res.send(my_file.Body)
    

    //res.download("./Legal.pdf");
    //res.json({ message: 'success' });
  }
catch(err)
{
  console.error(err);
  res.status(500).json({ error: 'Error Generating PDF' });
} 
});


const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const { writeFileSync, readFileSync } = require("fs");

async function createPDF(req) {
  const document = await PDFDocument.load(readFileSync("./agreementtemplate4.pdf"));

  const courierBoldFont = await document.embedFont(StandardFonts.Courier);
  const timesBoldFont = await document.embedFont(StandardFonts.TimesRomanBold);
  const firstPage = document.getPage(0);

  console.log( firstPage.getHeight() + " " +  firstPage.getWidth());

 // firstPage.moveTo(62, 500);
  firstPage.moveTo(360, 670);

  firstPage.drawText(new Date().toLocaleDateString(), {
    font: courierBoldFont,
    size: 12,
  });

  firstPage.moveTo(240, 617);
  firstPage.drawText(req.body.clientName, {
    font: timesBoldFont,
    size: 12,
  });

//name second time
  firstPage.moveTo(280, 582);
  firstPage.drawText(req.body.clientName, {
    font: timesBoldFont,
    size: 12,
  });

  // claim no. and company name-
  firstPage.moveTo(150, 552);
  firstPage.drawText(req.body.claimNumber + " , " + req.body.insuranceCompanyName , {
    font: timesBoldFont,
    size: 12,
  });


    //Processing fees
    firstPage.moveTo(285, 441);
    firstPage.drawText("Rs."+ req.body.processingFee, {
      font: timesBoldFont,
      size: 12,
    });

        //consultation percentage fees
        firstPage.moveTo(515, 441);
        firstPage.drawText(req.body.consultationCharge + "%", {
          font: timesBoldFont,
          size: 12,
        });

          //Total claimed amount
          firstPage.moveTo(180, 425);
          firstPage.drawText("Rs."+ req.body.claimAmount, {
            font: timesBoldFont,
            size: 12,
          });

         //cheque amount
         firstPage.moveTo(320, 364);
          firstPage.drawText("Rs."+ req.body.chequeAmount, {
          font: timesBoldFont,
         size: 12,
          });

          //cheque number
         firstPage.moveTo(460, 364);
           firstPage.drawText(req.body.chequeNumber, {
         font: timesBoldFont,
          size: 12,
          });
  
          //Bank name 
          firstPage.moveTo(130, 348);
          firstPage.drawText(req.body.bankName, {
        font: timesBoldFont,
         size: 12,
         });


         //get day, month and year

         var agreementdate = (new Date());
         firstPage.moveTo(235, 240);
         firstPage.drawText(agreementdate.getDate().toString(), {
           font: timesBoldFont,
           size: 12,
         });

         const monthName = ["January","February","March","April","May","June","July","August","September","October","November","December"];
         firstPage.moveTo(320, 240);
         firstPage.drawText((monthName[agreementdate.getMonth()] ), {
          font: timesBoldFont,
          size: 12,
        });
        firstPage.moveTo(350, 240);
        firstPage.drawText(agreementdate.getFullYear().toString(), {
          font: timesBoldFont,
          size: 12,
        });


          //name of first party 
          firstPage.moveTo(110, 175);
          firstPage.drawText(req.body.clientName, {
        font: timesBoldFont,
         size: 12,
         });

          //Address first party 
          firstPage.moveTo(115, 145);
          firstPage.drawText(req.body.clientAddress, {
        font: timesBoldFont,
         size: 12,
         });

          //Mobile first party 
          firstPage.moveTo(130, 115);
          firstPage.drawText(req.body.clientPhone, {
        font: timesBoldFont,
         size: 12,
         });

          //witness name
          firstPage.moveTo(405, 176);
          firstPage.drawText(req.body.witnessName, {
        font: timesBoldFont,
         size: 12,
         });




  writeFileSync("Legal.pdf", await document.save());

  return true;
}

async function createCardPDF(req) {
  const document = await PDFDocument.load(readFileSync("./cardtemplate.pdf"));

  const courierBoldFont = await document.embedFont(StandardFonts.Courier);
  const timesBoldFont = await document.embedFont(StandardFonts.TimesRomanBold);
  const firstPage = document.getPage(0);

  console.log( firstPage.getHeight() + " " +  firstPage.getWidth());


  firstPage.moveTo(120, 482);
  firstPage.drawText(req.body.customerName, {
    font: timesBoldFont,
    size: 20,
  });

//name second time
  firstPage.moveTo(150, 382);
  firstPage.drawText(req.body.cardNumber, {
    font: timesBoldFont,
    size: 20,
  });

  // claim no. and company name-
  firstPage.moveTo(310, 282);
  firstPage.drawText( req.body.insuranceCompany , {
    font: timesBoldFont,
    size: 20,
  });

  // Validity start date
  firstPage.moveTo(240, 188);
  firstPage.drawText( req.body.cardStartDate , {
    font: timesBoldFont,
    size: 20,
  });

  // Validity end date
  firstPage.moveTo(430, 188);
  firstPage.drawText( req.body.cardEndDate , {
    font: timesBoldFont,
    size: 20,
  });

  writeFileSync("CardNew.pdf", await document.save());

  return true;
}


async function downloadCardPDF(req) {
  const document = await PDFDocument.load(readFileSync("./cardtemplate.pdf"));

  const courierBoldFont = await document.embedFont(StandardFonts.Courier);
  const timesBoldFont = await document.embedFont(StandardFonts.TimesRomanBold);
  const firstPage = document.getPage(0);

  console.log( firstPage.getHeight() + " " +  firstPage.getWidth());


  firstPage.moveTo(110, 360);
  firstPage.drawText(req.customerName, {
    font: timesBoldFont,
    size: 24,
  });

//name second time
  firstPage.moveTo(130, 265);
  firstPage.drawText(req.cardNumber, {
    font: timesBoldFont,
    size: 24,
  });

  // claim no. and company name-
  firstPage.moveTo(260, 170);
  firstPage.drawText( req.insuranceCompany , {
    font: timesBoldFont,
    size: 24,
  });

  // Validity start date
  firstPage.moveTo(140, 80);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  firstPage.drawText( req.cardStartDate.toLocaleDateString(undefined, options) , {
    font: timesBoldFont,
    size: 24,
  });

  // Validity end date
  firstPage.moveTo(320, 80);
  firstPage.drawText( req.cardEndDate.toLocaleDateString(undefined, options) , {
    font: timesBoldFont,
    size: 24,
  });

  writeFileSync("CardNew.pdf", await document.save());

  return true;
}

function sendCompletionEmails(docs)
{
  var cardnumber = docs.cardNumber;
  var custname = docs.customerName;
  var mailOptions = {
    from: 'nidaancard@gmail.com',
    to: `${docs.customerEmail}`,
    subject: `Claim Shield Card- ${cardnumber}`,
    text: `Hi ${custname},\n\nPlease find the Claim Shield Card (${cardnumber}) attached with this email. \n \nThanks, \nNidaan Team `,
    attachments: [{
      filename: 'PolicyCard.pdf',
      path: './CardNew.pdf',
      contentType: 'application/pdf'
    }],
    };

//mailOptions["attachments"] = attachmentArray;

transporter.sendMail(mailOptions, function(error, info){
    if (error) {
    //res.json({message : error})
        console.log("could not send email" + error)
    } else {
        //res.json({message : 'emailsent'})
        console.log("emailsent")
    }
});
    
      
      
}

//createPDF().catch((err) => console.log(err));