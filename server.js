const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const AWS = require('aws-sdk');
var fs = require('fs');

const utf8 = require('utf8');

const regeneratorRuntime = require("regenerator-runtime");

const fontkit = require('pdf-fontkit');

const { google } = require('googleapis');

//for getting file extension such as pdf png etc
const path = require('path');

const oAuth2Client = new google.auth.OAuth2(
  process.env.gmailclientid,
  process.env.gmailclientSecret,
  "https://developers.google.com/oauthplayground"
);

oAuth2Client.setCredentials({
  refresh_token: process.env.gmailrefreshtoken,
});

//const accessToken =  oAuth2Client.getAccessToken();
const accessToken = oAuth2Client.credentials.access_token;

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



mongoose.connect(`mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASS}@cluster0.rldiof1.mongodb.net/nidaandatabase?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


/*

mongoose.connect(`mongodb://127.0.0.1:27017/test`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

*/

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

//gcp related includes-
const { Storage } = require('@google-cloud/storage');
const storagegcp = new Storage(
  {
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  }
);
//const bucketName = storagegcp.bucket(process.env.GCLOUD_STORAGE_BUCKET);



//for upload in background to gcp
const {spawn} = require('child_process');
const crypto = require('crypto');

// Initialize Google Cloud Storage
//const storage = new Storage({keyFilename: 'path/to/your/service-account-file.json'});
//const bucketName = 'your-bucket-name';
 const bucketName = process.env.GCLOUD_STORAGE_BUCKET;

// Function to upload file to Google Cloud Storage

/*
function uploadFileToGCS(filePath, originalName) {
  console.log(`inside uploadtogcs `);
  const randomString = crypto.randomBytes(16).toString('hex');
  const destination = `${originalName}-${randomString}`;
  console.log(`after uploadtogcs `);
  async function uploadFile() {
    console.log(`inside inside uploadtogcs `);
    await storage.bucket(bucketName).upload(filePath, {
      destination: destination,
    });
    console.log(`${filePath} uploaded to ${bucketName}`);

    // should add logic here to save filenames to db
  }

  uploadFile().catch(console.error);
}

*/

async function uploadFileToGCS(filePath, destination , referencenumber) {
  await storagegcp.bucket(String(bucketName)).upload(filePath, {
      destination: destination,
  });
  console.log(`${filePath} uploaded to ${bucketName} as ${destination}`);
  // After upload, delete the file locally to clean up

  const url = `https://storage.googleapis.com/rspowerimages/${destination}`; 

  console.log(url);
  await addDocURLInDBbyref(referencenumber , url)

  await fs.promises.unlink(filePath);
}

//






// Create a schema
const dataSchema = new mongoose.Schema({
  prospectDate: Date,
  prospectZone: String,
  patientName: String,
  patientMobile:Number,
  patientAddress: String,
  complainantName: String,
  behalfOf : String ,
  complainantMobile : Number,
  caseHandler: String,
  insuranceCompanyName: String,
  claimAmount: Number,
  claimNumber: String,
  claimType: String,
  caseRemarks: Array,
  caseRejectionReason: String,
  caseGist: String,
  docUrl: Array,
  extraRemarks: String,
  pfpayeeName: String,
  pfAmount: Number,
  pfReceived: String,
  pfpaymentRemarks: String,
  pfpaymentMode: String,
  pfpaymentDate: Date,
  cfPercentage: Number,
  cfAmount: Number,
  cfReceived: String,
  cfChequeNumber: String,
  cfBankName: String,
  paymentRemarks: String,
  hospitalName: String,
  isRejection: String,
  isDedecution: String,
  dateOfRejectionLetter: Date,
  caseEmail: String,
  caseEmailPassword: String,
  dateofEscalationToInsurer: Date,
  companyRevertDate: Date,
  LokpalBHPComplaintNumber: String,
  lokpalBHPComplaintDate: Date,
  annexure5ComplaintNumber: String,
  annexure5ComplaintDate: Date,
  lokpalComplaintNumber: String,
  lokpalComplaintDate: Date,
  lokpalCaseStatus: String,
  dateOfLokpalHearing: Date,
  newCaseStatus: String,
  isProspect: String,
  isPendingAuth: String,
  isLive: String,
  isInMedicalOpinion: String,
  legalCollected: String,
  pdcCollected: String,
  liveEntryBy: String,
  operationOfficer: String,
  medicalOpinionOfficer: String,
  directCase: String,
  managerID: String,
  managerName: String,
  cpID: String,
  cpName: String,



  policyNumber: String,
  policyUpload: String, 
  casereferenceNumber : String,
  caseNumber: String,
  directCase: String,
  isProspect: String,
  isPendingAuth: String,
  isLive: String,
  isCompleted: String,
  caseCompletionRemark: String,
  caseCompletionType: String,


  // Add stages of case here based on thier colour coding
  isEmailGenerated: String,
  isGistGenerated: String,
  isMedicalOpinionGenerated: String,
  isDraftGenerated: String,
  isInEscalationStage: String,
  isInLokpalStage: String,
  isEscalatedInCompany: String,
  isEscalationDeadlineDone: String,
  isLokpalDraftDone: String,
  islokpalRegistrationPending: String,
  islokpalRegistered: String,
  //

  caseEmail: String,
  caseEmailPassword: String,

  // These details are to prepare operational gist once case goes in live
  dateOfPolicy: Date,
  dateOfAdmission: Date,
  dateOfDischarge: Date,
  initialRejectionDate: Date,
  rejectionReason: String,
  hospitalName: String,
  diagnosis: String,
  patientComplainDuringAdmission: String,
  gistComments: String,
  gistCommentsBy: String,

  //
  caseDraft: String,
  lokpalDraft: String,


  // Add more fields as needed
});

const loginSchema = new mongoose.Schema({
  userName: String,
  userPassword: String,
  userID: String,
  userType: String
  // Add more fields as needed
});

// Documents related to case
const documentSchema = new mongoose.Schema({
  casereferenceNumber : String,
  caseNumber: String,
  docUrl: Array,
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


//employee schema 
const employeeSchema = new mongoose.Schema({
  employeeID: String,
  employeeName: String,
  phone: String,
  email: String,
  location: String,
  // Add more fields as needed
});

//Channel partner schema 
const cpSchema = new mongoose.Schema({
  cpID: String,
  cpName: String,
  cpAge: Number,
  cpGender: String,
  cpFatherName: String,
  cpAddress: String,
  cpCity: String,
  cpState: String,
  cpQualification: String,
  cpProfession: String,
  cpCurrentCompany: String,
  managerID: String,
  phone: String,
  alternatePhone: String,
  email: String,
  cpCommission: Number,
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
  paymentcomment: String,
  emailSent : String,
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
  employeeCount: Number,
  // Add more fields as needed
});

const policyCardSchemaObject = mongoose.model('policycard', policyCardSchema);

const counterSchemaObject = mongoose.model('counter', counterSchema);

// Create a model based on the schema
const dataSchemaObject = mongoose.model('Data', dataSchema);
//login table
const loginSchemaObject = mongoose.model('login', loginSchema);

const documentSchemaObject = mongoose.model('documentsURL', documentSchema);


//table to hold insurance company list
const insurancecompanySchemaObject = mongoose.model('insurancecompanydetails', insurancecompanySchema);

//table to hold tpa(third party admin) list
const tpaSchemaObject = mongoose.model('tpadetails', tpaSchema);

//table to hold manager details
const managerSchemaObject = mongoose.model('managerdetails', managerSchema);

//table to hold manager details
const employeeSchemaObject = mongoose.model('employeedetails', employeeSchema);

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
            session.userId=docs.userID;
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

app.post('/api/logout', async(req, res) => {
  try{
    req.session.destroy()
    //console.log(req.session.userId)
    res.json({message : 'Old session removed'})
  }
catch(err)
{
  res.status(500).json({ error: 'Failed to logout' });
}
});


// Define the API endpoint to save data
app.post('/api/addprospect', upload.array('pdfFile', 10), async (req, res) => {
  try{
        const refNumber= await getCaseReferenceCount();
        if(refNumber == -1)
        {
          res.status(500).json({ error: 'Error saving prospect data' });
          return;
        }

        const newData = new dataSchemaObject({
                        patientName : req.body.patientName,
                        patientMobile: req.body.patientMobile,
                        complainantName : req.body.complainantName,
                        complainantMobile: req.body.complainantMobile,
                        insuranceCompanyName: req.body.insuranceCompanyName,
                        claimNumber: req.body.claimNumber,
                        claimAmount: req.body.claimAmount,
                        cpName: req.body.cpName,
                        cpID: req.body.cpID,
                        caseHandler: req.body.caseHandler,
                        managerName: req.body.managerName,
                        managerID: req.body.managerID,
                        directCase: req.body.directCase,
                        prospectZone: req.body.prospectZone,
                        casereferenceNumber : refNumber,
                        prospectDate: req.body.prospectDate,
                        caseNumber: "",
                        isProspect:"true",
                        newCaseStatus: "New Case",
                        pfReceived: "NO",
                        isEmailGenerated: "NO",
                        isGistGenerated: "NO",
                        medicalOpinionOfficer: "NONE",
                        operationOfficer: "NONE",
                      });
        const savedData = await newData.save();
        incrementCaseReferenceCount();

        const uploadPromises = req.files.map(file => {
          const randomString = require('crypto').randomBytes(16).toString('hex');
          const fileNameExceptExtension =file.originalname.split('.')[0];
          const extension = path.extname(file.originalname);

          const destination = `uploads/${refNumber}-${fileNameExceptExtension}-${randomString}${extension}`;
          return uploadFileToGCS(file.path, destination, refNumber);
        });

      await Promise.all(uploadPromises);
        res.json({ message: 'success', referencenumber:refNumber,data: savedData });
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error saving data' });
    }
  
});


app.post('/api/uploadadditionaldocs', upload.array('pdfFile', 10), async (req, res) => {
  try{
        const refNumber= req.body.casereferenceNumber;
        const uploadPromises = req.files.map(file => {
        const randomString = require('crypto').randomBytes(16).toString('hex');
        const fileNameExceptExtension =file.originalname.split('.')[0];
        const extension = path.extname(file.originalname);
        const destination = `uploads/${refNumber}-${fileNameExceptExtension}-${randomString}${extension}`;
        return uploadFileToGCS(file.path, destination, refNumber);

        });


      await Promise.all(uploadPromises);
        res.json({ message: 'success', referencenumber:refNumber });
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error saving data' });
    }
  
});

app.post('/api/uploaddraftdocs', upload.array('pdfFile', 10), async (req, res) => {
  try{
        const refNumber= req.body.casereferenceNumber;
        const uploadPromises = req.files.map(file => {
          const randomString = require('crypto').randomBytes(16).toString('hex');
          const extension = path.extname(file.originalname);
          const destination = `uploads/${refNumber}-Company-And-Lokpal-Draft-${randomString}${extension}`;
          return uploadFileToGCS(file.path, destination, refNumber );
        });

      await Promise.all(uploadPromises);
        res.json({ message: 'success', referencenumber:refNumber });
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error saving data' });
    }
  
});


app.post('/api/addtcaseremark', async(req, res) => {
  try{
      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.referencenumber}, {$push:{ caseRemarks:req.body.caseRemarks}});

      if(newData == null)
      {
        res.json({ message: 'Could not save remark', refnum:req.body.referencenumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding remark' });
  } 

});


app.post('/api/addtcaseremarkandmovetoprospect', async(req, res) => {
  try{
      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.referencenumber}, {$push:{ caseRemarks:req.body.caseRemarks} , $set:{ newCaseStatus: "Reject Reconsideration",  isProspect:"true",} });

      if(newData == null)
      {
        res.json({ message: 'Could not save remark', refnum:req.body.referencenumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding remark' });
  } 

});


app.post('/api/addlivecaseremark', async(req, res) => {
  try{
      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.referencenumber}, {$push:{ caseRemarks:req.body.caseRemarks}});

      if(newData == null)
      {
        res.json({ message: 'Could not save remark', refnum:req.body.referencenumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding remark' });
  } 

});


app.post('/api/addescalationcaseremark', async(req, res) => {
  try{
      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.referencenumber}, {$push:{ caseRemarks : req.body.caseRemarks}});

      if(newData == null)
      {
        res.json({ message: 'Could not save remark', refnum:req.body.referencenumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding remark' });
  } 

});

app.post('/api/addlivecasequeryremark', async(req, res) => {
  try{
      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.referencenumber}, {$push:{ caseRemarks:req.body.caseRemarks}, $set:{ newCaseStatus: "Draft Query"}});

      if(newData == null)
      {
        res.json({ message: 'Could not save remark', refnum:req.body.referencenumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding remark' });
  } 

});

app.post('/api/movetocompleted', async(req, res) => {
  try{
      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, {$set:{ isInLokpalStage:"false", isInEscalationStage : "false", newCaseStatus: "Completed", isCompleted: "true", caseCompletionType: req.body.caseCompletionType, caseCompletionRemark: req.body.caseCompletionRemark }});

      if(newData == null)
      {
        res.json({ message: 'Could not move case to completed', refnum:req.body.casereferenceNumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding completion remark' });
  } 

});


app.post('/api/movetolokpal', async(req, res) => {
  try{
      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, {$push:{ caseRemarks:req.body.caseRemarks}, $set:{ newCaseStatus: "Lokpal", isInEscalationStage: "false", isInLokpalStage: "true"}});

      if(newData == null)
      {
        res.json({ message: 'Could not move case to lokpal', refnum:req.body.casereferenceNumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding remark' });
  } 

});

app.post('/api/movetoescalation', async(req, res) => {
  try{
      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.referencenumber}, {$push:{ caseRemarks:req.body.caseRemarks}, $set:{ newCaseStatus: "Escalation Pending", isInEscalationStage: "true", isLive: "false"}});

      if(newData == null)
      {
        res.json({ message: 'Could not move case to escalation', refnum:req.body.referencenumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding remark' });
  } 

});


app.post('/api/addcasegistandrejectionreason', async(req, res) => {
  try{
      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, {$set:{ isGistGenerated: "YES", caseRejectionReason:req.body.caseRejectionReason, caseGist: req.body.caseGist }});

      if(newData == null)
      {
        res.json({ message: 'Could not save rejection reason and gist', refnum:req.body.referencenumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding gist and rejection reason' });
  } 

});

app.post('/api/addescalationdetails', async(req, res) => {
  try{

      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, {$set:{ dateofEscalationToInsurer:req.body.dateofEscalationToInsurer, newCaseStatus: "Escalated" }, $push:{ caseRemarks :req.body.caseRemarks}});

      if(newData == null)
      {
        res.json({ message: 'Could not save escalation details', refnum:req.body.casereferenceNumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding gist and rejection reason' });
  } 

});



app.post('/api/addcaseverdictmedical', async(req, res) => {
  try{
      // isPendingAuth:"true",

      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, {$set:{ newCaseStatus: req.body.casestatus, isInMedicalOpinion: "false", isProspect:"false",}});

      if(newData == null)
      {
        res.json({ message: 'success', refnum:req.body.referencenumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding medical opinion' });
  } 

});


app.post('/api/addcaselegalgenerateddetails', async(req, res) => {
  try{

      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, {$set:{ newCaseStatus: "Legal Generated" }});

      if(newData == null)
      {
        res.json({ message: 'success', refnum:req.body.referencenumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error saving legal generated details' });
  } 

});


async function addDocURLInDBbyref(referencenumber , url)
{
  console.log(referencenumber);
  console.log(url);
  try{
      const newData = await  dataSchemaObject.findOneAndUpdate({casereferenceNumber: referencenumber}, {$push:{ docUrl : url}});
      if(newData == null)
      {
       console.error("Could not save doc url in db");
      }
      else
      {
        const savedData = newData.save();
        console.error("Saved doc url in db");
      }
  }
  catch(err)
  {
    console.error(err);
  } 
}



async function addDocURLInDBbycasenum(casenumber , url)
{
  try{
      const newData =  await documentSchemaObject.findOneAndUpdate({caseNumber: casenumber}, {$push:{ docUrl : url}});

      if(newData == null)
      {
       console.error("Could not save doc url in db");
      }
      else
      {
        const savedData = newData.save();
        console.error("Saved doc url in db");
      }
  }
  catch(err)
  {
    console.error(err);
  } 
}


app.post('/api/addpfremark', upload.array('pdfFile', 10), async(req, res) => {
  try{

      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, {$set:{ pfAmount:req.body.pfAmount, pfpaymentRemarks:req.body.pfpaymentRemarks,  pfpaymentDate:req.body.pfpaymentDate, pfpaymentMode:req.body.pfpaymentMode, cfPercentage: req.body.cfPercentage, cfAmount: req.body.cfAmount,  cfChequeNumber: req.body.cfChequeNumber,   caseEmail: req.body.caseEmail, caseEmailPassword: req.body.caseEmailPassword, cfBankName: req.body.cfBankName, isLive: "true", newCaseStatus : "Live" }});

      if(newData == null)
      {
        res.json({ message: 'Could not save pf remark', refnum:req.body.caseNumber});
      }
      else
      {
        const savedData = newData.save();
         const uploadPromises = req.files.map(file => {
          const randomString = require('crypto').randomBytes(16).toString('hex');
          const fileNameExceptExtension =file.originalname.split('.')[0];
          const extension = path.extname(file.originalname);

          const destination = `uploads/${req.body.casereferenceNumber}-${fileNameExceptExtension}-${randomString}${extension}`;
          return uploadFileToGCS(file.path, destination, req.body.casereferenceNumber);
        });
        await Promise.all(uploadPromises);
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding pf remark' });
  } 

});

app.post('/api/addlivegistdata', async(req, res) => {
  try{
      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, {$set:{ dateOfPolicy:req.body.dateOfPolicy, dateOfAdmission:req.body.dateOfAdmission, dateOfDischarge:req.body.dateOfDischarge, diagnosis: req.body.diagnosis, patientComplainDuringAdmission: req.body.patientComplainDuringAdmission,  rejectionReason: req.body.rejectionReason,  initialRejectionDate: req.body.initialRejectionDate, gistComments: req.body.gistComments, hospitalName: req.body.hospitalName, claimType:  req.body.claimType, policyNumber:  req.body.policyNumber, caseDraft: req.body.caseDraft, lokpalDraft:  req.body.lokpalDraft, behalfOf : req.body.behalfOf,  newCaseStatus: "Gist Generated", }});

      if(newData == null)
      {
        res.json({ message: 'Could not save live gist data', refnum:req.body.caseNumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding live gist data' });
  } 

});


app.post('/api/addlokpaldata', async(req, res) => {
  try{
      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, {$set:{ LokpalBHPComplaintNumber:req.body.LokpalBHPComplaintNumber, lokpalBHPComplaintDate:req.body.lokpalBHPComplaintDate, annexure5ComplaintDate:req.body.annexure5ComplaintDate, annexure5ComplaintNumber: req.body.annexure5ComplaintNumber, lokpalComplaintNumber: req.body.lokpalComplaintNumber,  lokpalComplaintDate: req.body.lokpalComplaintDate,  dateOfLokpalHearing: req.body.dateOfLokpalHearing,}});

      if(newData == null)
      {
        res.json({ message: 'Could not save lokpal data', refnum:req.body.caseNumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding lokpal data' });
  } 

});

app.post('/api/addlivedraftdata', async(req, res) => {
  try{
      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, {$set:{ dateOfPolicy:req.body.dateOfPolicy, dateOfAdmission:req.body.dateOfAdmission, dateOfDischarge:req.body.dateOfDischarge, diagnosis: req.body.diagnosis, patientComplainDuringAdmission: req.body.patientComplainDuringAdmission,  rejectionReason: req.body.rejectionReason,  initialRejectionDate: req.body.initialRejectionDate, gistComments: req.body.gistComments, hospitalName: req.body.hospitalName, claimType:  req.body.claimType, policyNumber:  req.body.policyNumber, caseDraft: req.body.caseDraft, lokpalDraft:  req.body.lokpalDraft,  newCaseStatus: "Draft Generated", }});

      if(newData == null)
      {
        res.json({ message: 'Could not save live gist data', refnum:req.body.caseNumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding live gist data' });
  } 

});

app.post('/api/addpfdetailsduringlegalgeneration', async(req, res) => {
  try{

      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, {$set:{ pfAmount:req.body.pfAmount, pfpaymentRemarks:req.body.pfpaymentRemarks, pfpaymentMode:req.body.pfpaymentMode, cfPercentage: req.body.cfPercentage, cfAmount: req.body.cfAmount,  cfChequeNumber: req.body.cfChequeNumber,  cfBankName: req.body.cfBankName, patientAddress: req.body.patientAddress, behalfOf : req.body.behalfOf  }});

      if(newData == null)
      {
        res.json({ message: 'Could not save pf remark', refnum:req.body.caseNumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding pf remark' });
  } 

});



app.post('/api/addemailremark', async(req, res) => {
  try{
      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, {$set:{ caseEmailPassword:req.body.caseEmailPassword, caseEmail:req.body.caseEmail, isEmailGenerated: "YES" }});

      if(newData == null)
      {
        res.json({ message: 'Could not save email remark.', refnum:req.body.casereferenceNumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding email remark' });
  } 

});

app.post('/api/addmedicalofficertocase', async(req, res) => {
  try{
      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, {$set:{ medicalOpinionOfficer:req.body.medicalOpinionOfficer }});

      if(newData == null)
      {
        res.json({ message: 'Could not save medical officer details', casereferenceNumber:req.body.casereferenceNumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding medical officer details' });
  } 

});

app.post('/api/addmedicalofficertocaseandmovetopendingdraft', async(req, res) => {
  try{
      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, {$set:{ medicalOpinionOfficer:req.body.medicalOpinionOfficer, newCaseStatus: "Pending Draft" }});

      if(newData == null)
      {
        res.json({ message: 'Could not save medical officer details', casereferenceNumber:req.body.casereferenceNumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding medical officer details' });
  } 

});

app.post('/api/addoperationofficertocase', async(req, res) => {
  try{
      const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, {$set:{ operationOfficer:req.body.operationOfficer }});

      if(newData == null)
      {
        res.json({ message: 'Could not save operation officer details', referenceNumber:req.body.casereferenceNumber});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error adding operation officer details' });
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

    const docs = await loginSchemaObject.findOne({userID: req.body.userID});
    if (docs) {
      res.json({message : 'duplicate'});
      return;
    }
        const newData = new loginSchemaObject({
                        'userName' : req.body.userName,
                        'userPassword' : req.body.userPassword,
                        'userID' : req.body.userID,
                        'userType' : req.body.userType});
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error saving Login data' });
    } 
});

app.post('/api/changeloginpass', async(req, res) => {
  try{
      const newData = await loginSchemaObject.findOneAndUpdate({userID: req.body.userID}, {$set:{ userPassword:req.body.newPassword }});

      if(newData == null)
      {
        res.json({ message: 'invaliduser'});
      }
      else
      {
        const savedData = newData.save();
        res.json({ message: 'success'});
      }
    }
  catch(err)
  {
    console.error(err);
    res.status(500).json({ error: 'Error updating password' });
  } 

});


app.get("/api/getoperationteamlist", async(req, res) => {
  try {
    // Retrieve all users login from the database
    const users = await loginSchemaObject.find({userType:"operation"}, {userName:1, userID:1});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get operation team details' });
  }
});

app.get("/api/getmarketingteamlist", async(req, res) => {
  try {
    // Retrieve all users login from the database
    const users = await loginSchemaObject.find({userType:"marketing"}, {userName:1, userID:1});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get marketing team details' });
  }
});

app.get("/api/getmedicalteamlist", async(req, res) => {
  try {
    // Retrieve all users login from the database
    const users = await loginSchemaObject.find({userType:"medicalofficer"}, {userName:1, userID:1});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get medical team details' });
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
                        'employeeCount' : req.body.employeeCount,
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


app.post('/api/incrementemployeecount', async(req, res) => {
  try{
    const newData = await counterSchemaObject.findOneAndUpdate({searchId: "keywordforsearch"}, {$inc:{ employeeCount: 1}});
    const savedData = newData.save();
    res.json({ message: 'Employee count incremented successfully', data: savedData });
  }
catch(err)
{
  console.error(err);
  res.status(500).json({ error: 'Error incrementing employee count' });
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
    const users = await  insurancecompanySchemaObject.find({}).sort({ companyName: 1 });
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
        await incrementManagerCount();
        res.json({ message: 'Manager data saved successfully', data: savedData });
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error saving Manager data' });
    } 
});


app.post('/api/addemployeedetail', async(req, res) => {
  try{
        const refNumber= await getEmployeeCount();
        if(refNumber == -1)
        {
          res.status(500).json({ error: 'Error saving employee data' });
          return;
        }
        const newData = new employeeSchemaObject({
                        'employeeID' : "EMP_" + refNumber,
                        'employeeName' : req.body.employeeName,
                        'phone' : req.body.phone,
                        'email' : req.body.email,
                        'location': req.body.location,
                        });
        const savedData = newData.save();
        await incrementEmployeeCount();
        res.json({ message: 'Employee data saved successfully', data: savedData });
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error saving employee data' });
    } 
});

app.get("/api/getemployeedetail", async(req, res) => {
  try {
    // Retrieve all employeefrom database
    const users = await  employeeSchemaObject.find({});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get employee details' });
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

        const docs = await cpSchemaObject.findOne({cpID: req.body.cpID});
        if (docs) {
          res.json({message : 'duplicate'});
          return;
        }

        const refNumber= await getcpCount();
        if(refNumber == -1)
        {
          res.status(500).json({ error: 'Error saving manager data' });
          return;
        }
        const newData = new cpSchemaObject({
                        'cpID' : req.body.cpID,
                        'cpName' : req.body.cpName,
                        'cpAge' : req.body.cpAge,
                        'cpGender' : req.body.cpGender,
                        'cpFatherName' : req.body.cpFatherName,
                        'cpAddress' : req.body.cpAddress,
                        'cpCity' : req.body.cpCity,
                        'cpState' : req.body.cpState,
                        'cpQualification' : req.body.cpQualification,
                        'cpProfession' : req.body.cpProfession,
                        'cpCurrentCompany' : req.body.cpCurrentCompany,
                        'managerID': req.body.managerID,
                        'phone' : req.body.phone,
                        'alternatePhone' : req.body.alternatePhone,
                        'email' : req.body.email,
                        'cpCommission': req.body.cpCommission,
                        });
        const savedData = newData.save();
        await incrementcpCount();
        res.json({ message: 'success', data: savedData });
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error saving cp data' });
    } 
});

app.post('/api/editcpdetail', async(req, res) => {
  try{

        const newData = await cpSchemaObject.findOneAndUpdate({cpID : req.body.cpID}, {$set:{ 'cpName' : req.body.cpName, 'cpAge' : req.body.cpAge, 'cpGender' : req.body.cpGender, 'cpFatherName' : req.body.cpFatherName,  'cpAddress' : req.body.cpAddress,'cpCity' : req.body.cpCity, 'cpState' : req.body.cpState,'cpQualification' : req.body.cpQualification,  'cpProfession' : req.body.cpProfession, 'cpCurrentCompany' : req.body.cpCurrentCompany,'managerID': req.body.managerID, 'phone' : req.body.phone, 'alternatePhone' : req.body.alternatePhone, 'email' : req.body.email,'cpCommission': req.body.cpCommission, }});

        if(newData == null)
        {
          res.json({ message: 'failure'});
        }
        else
        {
          const savedData = newData.save();
          res.json({ message: 'success'});
        }
      }
    catch(err)
    {
      console.error(err);
      res.status(500).json({ error: 'Error saving cp data' });
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

app.get("/api/getcpdetailbyid", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  cpSchemaObject.find({cpID: req.query.cpID});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get CP details' });
  }
});

app.post("/api/save-policy", upload.single('pdfFile'), async (req, res) => {
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
                  'inquiryDate': inquirydate,
                  'paymentcomment':"",
                  'emailSent':"false",
                    });
    const savedData = newData.save();
    await incrementReferenceCount();


    const file = req.file;
    console.log(file);
    console.log(__dirname);

    if(file != undefined)
    {
      const filePath = __dirname + `/uploads/${file.originalname}`;

      // Read the file
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          //res.status(500).send('Error reading file');
          return;
        }
  
        // Upload the file to Google Cloud Storage
        const destinationFilename = `uploads/claimshield-${refNumber}.pdf`;
  
        const bucket = storagegcp.bucket(process.env.GCLOUD_STORAGE_BUCKET);
        const fileToUpload = bucket.file(destinationFilename);
  
        const stream = fileToUpload.createWriteStream({
          metadata: {
            contentType: 'application/pdf',
          },
        });
  
        stream.on('error', (err) => {
          console.error('Error uploading file to GCS:', err);
          //res.status(500).send('Error uploading file to GCS');
  
          // Cleanup: delete the file
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            } else {
              console.log('File deleted!');
            }
          });
        });
  
        stream.on('finish', () => {
          // Cleanup: delete the file
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            } else {
              console.log('File deleted!');
            }
          });
  
          console.log('File uploaded successfully');
        });
  
        // Pipe the file data to the GCS stream
        stream.end(data);
      });
    }

    //
    res.json({ message: 'success', referencenumber:refNumber,data: savedData });
  }
catch(err)
{
  console.error(err);
  res.status(500).json({ error: 'Error saving new card data' });
} 
});


app.post("/api/upload-gist", upload.single('pdfFile'), async (req, res) => {
  try{
   
    const file = req.file;
    console.log(file);
    console.log(__dirname);

    if(file != undefined)
    {
      const filePath = __dirname + `/uploads/${file.originalname}`;

      // Read the file
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          //res.status(500).send('Error reading file');
          return;
        }
  
        // Upload the file to Google Cloud Storage

        const caseNumber = req.body.caseNumber;
        const destinationFilename = `uploads/${caseNumber}-gist.pdf`;
  
        const bucket = storagegcp.bucket(process.env.GCLOUD_STORAGE_BUCKET);
        const fileToUpload = bucket.file(destinationFilename);
  
        const stream = fileToUpload.createWriteStream({
          metadata: {
            contentType: 'application/pdf',
          },
        });
  
        stream.on('error', (err) => {
          console.error('Error uploading file to GCS:', err);
          //res.status(500).send('Error uploading file to GCS');
  
          // Cleanup: delete the file
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            } else {
              console.log('File deleted!');
            }
          });

          res.json({ message: 'Could not upload gist', refnum:req.body.caseNumber});

        });
  
        stream.on('finish', () => {
          // Cleanup: delete the file
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            } else {
              console.log('File deleted!');
            }
          });

          try{
            const newData = dataSchemaObject.findOneAndUpdate({caseNumber: req.body.caseNumber}, {$set:{ isGistGenerated: "YES" }});
      
            if(newData == null)
            {
              //res.json({ message: 'Could not upload gist', refnum:req.body.caseNumber});
            }
            else
            {
              const savedData = newData.save();
              //res.json({ message: 'success'});
            }
          }
          catch(err)
          {
            console.error(err);
            //res.status(500).json({ error: 'Error uploading gist' });
          } 
  
          console.log('File uploaded successfully');
          res.json({ message: 'success'});
        });
  
        // Pipe the file data to the GCS stream
        stream.end(data);
      });
    }

    //

  }
catch(err)
{
  console.error(err);
  res.status(500).json({ error: 'Error saving Gist data.' });
} 
});


app.post("/api/upload-draft", upload.single('pdfFile'), async (req, res) => {
  try{
   
    const file = req.file;
    console.log(file);
    console.log(__dirname);

    if(file != undefined)
    {
      const filePath = __dirname + `/uploads/${file.originalname}`;

      // Read the file
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.error('Error reading file:', err);
          //res.status(500).send('Error reading file');
          return;
        }
  
        // Upload the file to Google Cloud Storage

        const caseNumber = req.body.caseNumber;
        const destinationFilename = `uploads/${caseNumber}-draft.pdf`;
  
        const bucket = storagegcp.bucket(process.env.GCLOUD_STORAGE_BUCKET);
        const fileToUpload = bucket.file(destinationFilename);
  
        const stream = fileToUpload.createWriteStream({
          metadata: {
            contentType: 'application/pdf',
          },
        });
  
        stream.on('error', (err) => {
          console.error('Error uploading file to GCS:', err);
          //res.status(500).send('Error uploading file to GCS');
  
          // Cleanup: delete the file
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            } else {
              console.log('File deleted!');
            }
          });

          res.json({ message: 'Could not upload draft', refnum:req.body.caseNumber});

        });
  
        stream.on('finish', () => {
          // Cleanup: delete the file
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            } else {
              console.log('File deleted!');
            }
          });

          try{
            const newData =  dataSchemaObject.findOneAndUpdate({caseNumber: req.body.caseNumber}, {$set:{ isDraftGenerated: "YES" }});
      
            if(newData == null)
            {
             // res.json({ message: 'Could not upload draft', refnum:req.body.caseNumber});
            }
            else
            {
              const savedData = newData.save();
              //res.json({ message: 'success'});
            }
          }
          catch(err)
          {
            console.error(err);
            //res.status(500).json({ error: 'Error uploading draft' });
          } 
  
          console.log('File uploaded successfully');
          res.json({ message: 'success'});
        });
  
        // Pipe the file data to the GCS stream
        stream.end(data);
      });
    }

    //

  }
catch(err)
{
  console.error(err);
  res.status(500).json({ error: 'Error saving Draft data.' });
} 
});


app.post("/api/savepaymentcomment",  async (req, res) => {
  try{
    const newData = await policyCardSchemaObject.findOneAndUpdate({referenceNumber: req.body.referenceNumber},       {  processingFee: req.body.processingFee,
      paymentcomment: req.body.paymentcomment,
    }, {new : true});
    const savedData = newData.save();
    res.json({ message: 'Payment details saved successfully', data: savedData });
  }
catch(err)
{
  console.error(err);
  res.status(500).json({ error: 'Error while saving payment data' });
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


app.get("/api/getgistdetail", async(req, res) => {
  try {
    const users = await  dataSchemaObject.find({casereferenceNumber: req.query.casereferenceNumber}, { caseRejectionReason: 1, caseGist: 1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get gist details' });
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

app.get("/api/getcompletedcases", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  dataSchemaObject.find({isCompleted: "true"});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get pending case details' });
  }
});

app.get("/api/getallcases", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  dataSchemaObject.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get all case details' });
  }
});

app.get("/api/getrejectedcasedetail", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  dataSchemaObject.find({newCaseStatus: "Rejected"});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get rejected case details' });
  }
});

app.get("/api/getapprovedcasedetail", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  dataSchemaObject.find({newCaseStatus: "Approved"});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get approved case details' });
  }
});

app.get("/api/getpendingdraftcasedetail", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  dataSchemaObject.find({  $or: [ { newCaseStatus: "Draft Generated" }, { newCaseStatus: "Pending Draft"} ]} );
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get approved case details' });
  }
});

app.get("/api/getapprovedandlegalgeneratedcasedetail", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  dataSchemaObject.find({  $or: [ { newCaseStatus: "Approved" }, { newCaseStatus: "Legal Generated"} ]});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get approved case details' });
  }
});


app.get("/api/getapprovedcasedetailbyref", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    console.log(req.query.casereferenceNumber)

    const users = await  dataSchemaObject.find({casereferenceNumber: req.query.casereferenceNumber,  newCaseStatus: "Approved"});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get pending case details by ref' });
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

app.get("/api/getlivecaseRemarkbyref", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    console.log(req.query.casereferenceNumber)

    const users = await  dataSchemaObject.find({casereferenceNumber: req.query.casereferenceNumber}, {caseRemarks:1});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get pending case details by ref' });
  }
});

app.get("/api/getescalationcaseRemarkbyref", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    console.log(req.query.casereferenceNumber)

    const users = await  dataSchemaObject.find({casereferenceNumber: req.query.casereferenceNumber}, {caseRemarks:1});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get pending case details by ref' });
  }
});

app.get("/api/getcasedetailbyref", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    console.log(req.query.casereferenceNumber)

    const users = await  dataSchemaObject.find({casereferenceNumber: req.query.casereferenceNumber});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get case details by ref' });
  }
});

app.get("/api/getlivecasedetailbynumber", async(req, res) => {
  try {
    
    //console.log(req.query.caseNumber);

    const users = await  dataSchemaObject.find({caseNumber: req.query.caseNumber});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get live case details by number' });
  }
});


app.get("/api/getmedicalopinioncasedetail", async(req, res) => {
  try {
    // Retrieve all medical opinion case list from database
    const users = await  dataSchemaObject.find({isInMedicalOpinion : {"$exists" : true, "$eq" : "true"}});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get medical opinion case details' });
  }
});

app.get("/api/getlokpalcasedetail", async(req, res) => {
  try {
    // Retrieve all medical opinion case list from database
    const users = await  dataSchemaObject.find({isInLokpalStage : {"$exists" : true, "$eq" : "true"}});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get lokpal case details' });
  }
});

app.get("/api/getescalationcasedetail", async(req, res) => {
  try {
    // Retrieve all medical opinion case list from database
    const users = await  dataSchemaObject.find({isInEscalationStage : {"$exists" : true, "$eq" : "true"}});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get escalation case details' });
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

      await incrementCaseNumberCount();

/*
      const file = req.file;
      console.log(file)
      console.log(__dirname)

  const filePath = __dirname + `/uploads/${file.originalname}`;

  // Read the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      //res.status(500).send('Error reading file');
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

        fs.unlink(filePath, function (err) {
          if (err) throw err;
          // if no error, file has been deleted successfully
          console.log('File deleted!');
      });

        return;
      }

      fs.unlink(filePath, function (err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
        console.log('File deleted!');
    });

      console.log('File uploaded successfully:', result.Location);
      //res.status(200).send('File uploaded successfully');
    });
  });

  */
      
  //try uploading to gcp

  const file = req.file;
    console.log(file);
    console.log(__dirname);

    if(file != undefined)
    {
          const filePath = __dirname + `/uploads/${file.originalname}`;

          // Read the file
          fs.readFile(filePath, (err, data) => {
            if (err) {
              console.error('Error reading file:', err);
              //res.status(500).send('Error reading file');
              return;
            }

            // Upload the file to Google Cloud Storage
            const destinationFilename = `uploads/${casenumberstring}.pdf`;

            const bucket = storagegcp.bucket(process.env.GCLOUD_STORAGE_BUCKET);
            const fileToUpload = bucket.file(destinationFilename);

            const stream = fileToUpload.createWriteStream({
              metadata: {
                contentType: 'application/pdf',
              },
            });

            stream.on('error', (err) => {
              console.error('Error uploading file to GCS:', err);
              //res.status(500).send('Error uploading file to GCS');

              // Cleanup: delete the file
              fs.unlink(filePath, (err) => {
                if (err) {
                  console.error('Error deleting file:', err);
                } else {
                  console.log('File deleted!');
                }
              });
            });

            stream.on('finish', () => {
              // Cleanup: delete the file
              fs.unlink(filePath, (err) => {
                if (err) {
                  console.error('Error deleting file:', err);
                } else {
                  console.log('File deleted!');
                }
              });

              console.log('File uploaded successfully');
            });

            // Pipe the file data to the GCS stream
            stream.end(data);
          });
    }
  
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

     // await incrementCaseNumberCount();
      res.json({ message: 'success', casereferenceNumber: req.body.casereferenceNumber });
  }
  catch(err)
  {
    console.error(err);
    return -1;
  } 
});


app.post('/api/movecasetorejectedbyref', async(req, res) => {
  try{
    const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, 
      {  isProspect:"false",
      }, {new : true});

     // await incrementCaseNumberCount();
      res.json({ message: 'success', casereferenceNumber: req.body.casereferenceNumber });
  }
  catch(err)
  {
    console.error(err);
    return -1;
  } 
});

app.post('/api/movecasetolivefromprospectbyref', async(req, res) => {
  try{
    const gencaseNumber= await getCaseNumbereCount();
    if(gencaseNumber == -1)
    {
      res.status(500).json({ error: 'Error saving case data' });
      return;
    }
    casenumberstring = "CN_" + gencaseNumber;

    const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, 
      {  isProspect:"false",
         isPendingAuth:"true",
         caseNumber: casenumberstring,
         isLive: "true",
      }, {new : true});

      await incrementCaseNumberCount();

      res.json({ message: 'success', casereferenceNumber: req.body.casereferenceNumber });
  }
  catch(err)
  {
    console.error(err);
    return -1;
  } 
});

app.post('/api/movecasetomedicalfromlivebycasenumber', async(req, res) => {
  try{
    const newData = await dataSchemaObject.findOneAndUpdate({caseNumber: req.body.caseNumber}, 
      {  
         isPendingAuth:"true",
         isLive: "false",
         isInMedicalOpinion: "true",
         medicalOpinionOfficer: "NONE",
         isDraftGenerated: "NO",
      }, {new : true});

      res.json({ message: 'success', casereferenceNumber: req.body.casereferenceNumber });
  }
  catch(err)
  {
    console.error(err);
    return -1;
  } 
});

app.post('/api/movecasetomedicalfromprospectbyrefnumber', async(req, res) => {
  try{
    const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, 
      {  
         isInMedicalOpinion: "true",
         medicalOpinionOfficer: "NONE",
         newCaseStatus: "In Medical"
      }, {new : true});

      res.json({ message: 'success', casereferenceNumber: req.body.casereferenceNumber });
  }
  catch(err)
  {
    console.error(err);
    return -1;
  } 
});


app.post('/api/movecasetoprospectformedicalquerybyref', async(req, res) => {
  try{
    const newData = await dataSchemaObject.findOneAndUpdate({casereferenceNumber: req.body.casereferenceNumber}, 
      {  
         isInMedicalOpinion: "false",
         newCaseStatus: "Medical Query"
      }, {new : true});

      res.json({ message: 'success', casereferenceNumber: req.body.casereferenceNumber });
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
    const users = await  dataSchemaObject.find({isLive : {"$exists" : true, "$eq" : "true"}});
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

app.get("/api/getmedicalopinioncasedetail", async(req, res) => {
  try {
    // Retrieve all medical opinion case list from database
    const users = await  dataSchemaObject.find({isInMedicalOpinion : {"$exists" : true, "$eq" : "true"}});
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get medical opinion case details' });
  }
});

app.get("/api/getnewcaseCount", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  dataSchemaObject.find({newCaseStatus: "New Case"}).count();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get new case count' });
  }
});

app.get("/api/getmedicalCount", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  dataSchemaObject.find({newCaseStatus: "In Medical"}).count();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get medical case count' });
  }
});

app.get("/api/getmedicalqueryCount", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  dataSchemaObject.find({newCaseStatus: "Medical Query"}).count();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get medical query count' });
  }
});


app.get("/api/getapprovedcaseCount", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  dataSchemaObject.find({newCaseStatus: "Approved"}).count();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get approved case count' });
  }
});

app.get("/api/getrejectedcaseCount", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    const users = await  dataSchemaObject.find({newCaseStatus: "Rejected"}).count();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get rejected case count' });
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
          try{
            const newData = await policyCardSchemaObject.findOneAndUpdate({cardNumber: req.body.policyCardNumber},  {  emailSent: "true"
            }, {new : true});
            const savedData = newData.save();
          }
          catch(err)
          {
            console.error(err);
          }
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
     // console.log(docs);
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

async function getEmployeeCount () {
  try {
    const data = await counterSchemaObject.find();
    return data[0].employeeCount;
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

async function incrementEmployeeCount ()  {
  try{
    const newData = await counterSchemaObject.findOneAndUpdate({searchId: "keywordforsearch"}, {$inc:{ employeeCount: 1}});
    return newData.employeeCount;
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

app.post('/api/whoami', async(req,res) => {
 // session=req.session;
  if(req.session.userId && (req.session.userType == 'admin')){
      res.json({message : 'admin', username : req.session.userName})
  }
  else if(req.session.userId && (req.session.userType == 'cp')){
      res.json({message : 'cp', username : req.session.userName})
  }
  else if(req.session.userId && (req.session.userType == 'manager')){
      res.json({message : 'manager', username : req.session.userName})
  }
  else if(req.session.userId && (req.session.userType == 'medicalofficer')){
    res.json({message : 'medicalofficer', username : req.session.userName})
  }
  else if(req.session.userId && (req.session.userType == 'marketing')){
    res.json({message : 'marketing', username : req.session.userName})
  }
  else if(req.session.userId && (req.session.userType == 'operation')){
    res.json({message : 'operation', username : req.session.userName})
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
app.get('/viewapprovedcases.html', (req, res) => res.sendFile(__dirname+'/viewapprovedcases.html'))
app.get('/viewlivecases.html', (req, res) => res.sendFile(__dirname+'/viewlivecases.html'))
app.get('/viewpendingdraftcases.html', (req, res) => res.sendFile(__dirname+'/viewpendingdraftcases.html'))
app.get('/viewfullcasedetails.html', (req, res) => res.sendFile(__dirname+'/viewfullcasedetails.html'))
app.get('/viewrejectedcases.html', (req, res) => res.sendFile(__dirname+'/viewrejectedcases.html'))

app.get('/viewcompletedcases.html', (req, res) => res.sendFile(__dirname+'/viewcompletedcases.html'))
app.get('/viewsearchcases.html', (req, res) => res.sendFile(__dirname+'/viewsearchcases.html'))

app.get('/changepassword.html', (req, res) => res.sendFile(__dirname+'/changepassword.html'))
app.get('/createaccount.html', (req, res) => res.sendFile(__dirname+'/createaccount.html'))
app.get('/createcp.html', (req, res) => res.sendFile(__dirname+'/createcp.html'))
app.get('/editcp.html', (req, res) => res.sendFile(__dirname+'/editcp.html'))

app.get('/viewcases.html', (req, res) => res.sendFile(__dirname+'/viewcases.html'))
app.get('/viewmedicalopinioncases.html', (req, res) => res.sendFile(__dirname+'/viewmedicalopinioncases.html'))
app.get('/viewescalationcases.html', (req, res) => res.sendFile(__dirname+'/viewescalationcases.html'))
app.get('/viewlokpalcases.html', (req, res) => res.sendFile(__dirname+'/viewlokpalcases.html'))

app.get('/viewmyopinioncases.html', (req, res) => res.sendFile(__dirname+'/viewmyopinioncases.html'))


app.get('/movecasetolive.html', (req, res) => res.sendFile(__dirname+'/movecasetolive.html'))

app.get('/movecasetomedicalopinion.html', (req, res) => res.sendFile(__dirname+'/movecasetomedicalopinion.html'))

app.get('/dashboard.html', (req, res) => res.sendFile(__dirname+'/dashboard.html'))
app.get('/newcard.html', (req, res) => res.sendFile(__dirname+'/newcard.html'))
app.get('/newcarddirect.html', (req, res) => res.sendFile(__dirname+'/newcarddirect.html'))
app.get('/paymentinfo.html', (req, res) => res.sendFile(__dirname+'/paymentinfo.html'))
app.get('/paymentcomplete.html', (req, res) => res.sendFile(__dirname+'/paymentcomplete.html'))
app.get('/viewcards.html', (req, res) => res.sendFile(__dirname+'/viewcards.html'))
app.get('/viewpendingcards.html', (req, res) => res.sendFile(__dirname+'/viewpendingcards.html'))

app.get('/generatelegalpdf.html', (req, res) => res.sendFile(__dirname+'/generatelegalpdf.html'))
app.get('/generatelegalfromlive.html', (req, res) => res.sendFile(__dirname+'/generatelegalfromlive.html'))


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
const { kStringMaxLength } = require('buffer');

async function createPDF(req) {
  const document = await PDFDocument.load(readFileSync("./agreementtemplate20.pdf"));

  const courierBoldFont = await document.embedFont(StandardFonts.Courier);
  const timesFont = await document.embedFont(StandardFonts.TimesRoman);
  const timesBoldFont = await document.embedFont(StandardFonts.TimesRomanBold);
  const firstPage = document.getPage(0);
  const secondPage = document.getPage(1);

  console.log( firstPage.getHeight() + " " +  firstPage.getWidth());
  
  var firstline=`I/We the customer/applicant named above as ${req.body.complainantName} (first party) do hereby
appoint, engage and authorize Nidaan The legal Consultants (second party) to act and plead in case of ${req.body.behalfOf},
${req.body.clientName} claim No. ${req.body.claimNumber}  of ${req.body.insuranceCompanyName} 
Company, which shall include claim filing, application for query reply, reconsideration process, setting aside 
of rejected/deducted claim. We endeavour to get the claim settled though correspondence or Court Proceeding 
or Ombudsman, as may be deemed necessary by the second party, for the benefit of the said claim at all its stages
and agree to rectify and confirm any act done by the second party,as if vicariously done by me/us as the first party.`;
 

  var secondline=`I/We agree to pay a non-refundable advance Processing Fee of Rs. ${req.body.processingFee} /- and a Consultation Fee amounting 
to ${req.body.consultationCharge}% of the total claimed amount Rs. ${req.body.claimAmount}, that is, Rs. ${req.body.chequeAmount} /-, to party no. 2 within one week of
receiving the settled claimed amount from the concerned insurance company. In case of part settlement 
of the stated amount, the Consultation Fee of ${req.body.consultationCharge}% shall be calculated in accordance with the final amount
received through settlement.`;

var chequenumber = "           ";
var bankname =  "                           ";

if(req.body.chequeNumber != "")
{
  chequenumber = req.body.chequeNumber;
}
if(req.body.bankName != "")
{
  bankname = req.body.bankName;
}

  var thirdline=`I/We further agree to deposit a Post Dated Cheque of Rs. ${req.body.chequeAmount} bearing cheque no. ${chequenumber} 
Bank Name ${bankname} as a security deposit of the consultation Fees, which is returnable after 
the actual payment of the consultation Fees. In case if I/We fail to pay the actual Consultation Fees, I hereby 
authorize the second party to get the Consultation Fees realized through the above mentioned post-dated Cheque 
deposited as a security deposit with the second party. In case if the second Party fails to secure any relief 
for the first party by non-settlement of claim, no consultation fees shall be payable to the second party, and the 
post-dated cheque shall be returned to the first party or be destroyed on consent of the first party. 
Processing Fee is non-refundable.`;

var agreementdate = (new Date());
const monthName = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  var fourthline=`I affirm that all the above contents and terms & conditions have been well understood by me and in witness
whereof I/We hereto at Indore signed on the ${agreementdate.getDate().toString()} day of month ${monthName[agreementdate.getMonth()]} ${agreementdate.getFullYear().toString()}`;
 


var firstlinehindi=`मैं/हम उपरोक्त ग्राहक/आवेदक, ${req.body.clientName} (प्रथम पक्ष) है, ऐसा करता हूं 
${req.body.behalfOf} के मामले में कार्य करने और पैरवी करने के लिए निदान कानूनी सलाहकारों (द्वितीय पक्ष) को नियुक्त और अधिकृत करें।
${req.body.insuranceCompanyName} का ${req.body.complainantName} दावा संख्या  ${req.body.claimNumber}
कंपनी, जिसमें दावा दायर करना, प्रश्न उत्तर के लिए आवेदन, पुनर्विचार प्रक्रिया, अलग करना शामिल होगा
अस्वीकृत/कटौती किए गए दावे का. हम पत्राचार या अदालती कार्यवाही के माध्यम से दावे का निपटारा करने का प्रयास करते हैं
या लोकपाल, जैसा कि दूसरे पक्ष द्वारा अपने सभी चरणों में उक्त दावे के लाभ के लिए आवश्यक समझा जा सकता है
और दूसरे पक्ष द्वारा किए गए किसी भी कार्य को सुधारने और पुष्टि करने के लिए सहमत हूं, जैसे कि प्रथम पक्ष के रूप में
 मेरे/हमारे द्वारा किया गया हो।`;
 

  var secondlinehindi=`मैं/हम रुपये की गैर-वापसी योग्य अग्रिम प्रसंस्करण शुल्क का भुगतान करने के लिए सहमत हैं। ${req.body.processingFee}/- और एक परामर्श शुल्क राशि
  कुल दावा की गई राशि का ${req.body.consultationCharge}% रु. ${req.body.claimAmount} यानि कि रु. ${req.body.chequeAmount}/-, पार्टी नं. एक सप्ताह के अंदर 2
  संबंधित बीमा कंपनी से निर्धारित दावा राशि प्राप्त करना। आंशिक निपटान के मामले में
  बताई गई राशि में से ${req.body.consultationCharge}% परामर्श शुल्क की गणना अंतिम राशि के अनुसार की जाएगी
  निपटान के माध्यम से प्राप्त किया गया।`;


var thirdlinehindi=`मैं/हम रुपये का पोस्ट डेटेड चेक जमा करने के लिए भी सहमत हैं। ${req.body.chequeAmount} जिसका चेक नं.  ${chequenumber}
बैंक का नाम ${bankname} परामर्श शुल्क की सुरक्षा जमा राशि के रूप में, जिसे बाद में वापस किया जा सकता है
परामर्श शुल्क का वास्तविक भुगतान। यदि मैं/हम वास्तविक परामर्श शुल्क का भुगतान करने में विफल रहते हैं, तो मैं एतद्द्वारा
उपर्युक्त पोस्ट-डेटेड चेक के माध्यम से परामर्श शुल्क प्राप्त करने के लिए दूसरे पक्ष को अधिकृत करें
दूसरे पक्ष के पास सुरक्षा जमा के रूप में जमा किया गया। यदि दूसरा पक्ष कोई राहत प्राप्त करने में विफल रहता है
दावे का निपटान न करने पर प्रथम पक्ष के लिए, दूसरे पक्ष को कोई परामर्श शुल्क देय नहीं होगा, और
उत्तर दिनांकित चेक प्रथम पक्ष को वापस कर दिया जाएगा या प्रथम पक्ष की सहमति पर नष्ट कर दिया जाएगा।
प्रोसेसिंग शुल्क वापसी योग्य नहीं है।`;

var fourthlinehindi = `मैं पुष्टि करता हूं कि उपरोक्त सभी सामग्री और नियम एवं शर्तें मेरे द्वारा और साक्षी रूप से अच्छी तरह से समझी गई हैं
जिस पर मैंने/हमने इंदौर में माह ${monthName[agreementdate.getMonth()]} ${agreementdate.getFullYear().toString()} की ${agreementdate.getDate().toString()} तारीख को हस्ताक्षर किए`;


document.registerFontkit(fontkit);

 const customFont = await document.embedFont(fs.readFileSync('./public/Karma-Regular.ttf'), { subset: true })

 //first line
 firstPage.moveTo(69, 620);
 firstPage.drawText(firstline, {
   font: timesFont,
   size: 11,
   lineHeight: 15,
 });

  //second line
  firstPage.moveTo(69, 500);
  firstPage.drawText(secondline, {
    font: timesFont,
    size: 11,
    lineHeight: 15,
  });

   //third line
 firstPage.moveTo(69, 405);
 firstPage.drawText(thirdline, {
   font: timesFont,
   size: 11,
   lineHeight: 15,
 });

    //fourth line
    firstPage.moveTo(69, 275);
    firstPage.drawText(fourthline, {
      font: timesFont,
      size: 11,
      lineHeight: 15,
    });
 
  //Add Id name to legal doc
 firstPage.moveTo(73, 715);
 firstPage.drawText(req.body.idNumber, {
   font: timesBoldFont,
   size: 11,
 });


  firstPage.moveTo(480, 715);
  firstPage.drawText(new Date().toLocaleDateString("en-GB"), {
    font: timesBoldFont,
    size: 11,
  });

  firstPage.moveTo(221, 671);
  firstPage.drawText(req.body.complainantName, {
    font: timesBoldFont,
    size: 12,
  });


          //name of first party 
          firstPage.moveTo(94, 184);
          firstPage.drawText(req.body.complainantName, {
        font: timesBoldFont,
         size: 11,
         });

          //Address first party 
          firstPage.moveTo(102, 156);
          firstPage.drawText(req.body.clientAddress, {
        font: timesBoldFont,
         size: 11,
         });

          //Mobile first party 
          firstPage.moveTo(115, 129);
          firstPage.drawText(req.body.clientPhone, {
        font: timesBoldFont,
         size: 11,
         });

          //witness name
          firstPage.moveTo(379, 183);
          firstPage.drawText(req.body.witnessName, {
        font: timesBoldFont,
         size: 11,
         });


         //
       //  second page in hindi

 //first line
 secondPage.moveTo(69, 620);
 secondPage.drawText(firstlinehindi, {
   font: customFont,
   size: 11,
   lineHeight: 15,
 });

  //second line
  secondPage.moveTo(69, 500);
  secondPage.drawText(secondlinehindi, {
    font: customFont,
    size: 11,
    lineHeight: 15,
  });

   //third line
 secondPage.moveTo(69, 405);
 secondPage.drawText(thirdlinehindi, {
   font: customFont,
   size: 11,
   lineHeight: 15,
 });

    //fourth line
    secondPage.moveTo(69, 275);
    secondPage.drawText(fourthlinehindi, {
      font: customFont,
      size: 11,
      lineHeight: 15,
    });
 
  //Add Id name to legal doc
 secondPage.moveTo(98, 690);
 secondPage.drawText(req.body.idNumber, {
   font: customFont,
   size: 11,
 });


  secondPage.moveTo(480, 690);
  secondPage.drawText(new Date().toLocaleDateString("en-GB"), {
    font: customFont,
    size: 11,
  });

  secondPage.moveTo(175, 665);
  secondPage.drawText(req.body.complainantName, {
    font: customFont,
    size: 12,
  });


          //name of first party 
          secondPage.moveTo(98, 208);
          secondPage.drawText(req.body.complainantName, {
        font: customFont,
         size: 11,
         });

          //Address first party 
          secondPage.moveTo(98, 194);
          secondPage.drawText(req.body.clientAddress, {
        font: customFont,
         size: 11,
         });

          //Mobile first party 
          secondPage.moveTo(98, 176);
          secondPage.drawText(req.body.clientPhone, {
        font: customFont,
         size: 11,
         });

          //witness name
          secondPage.moveTo(400, 200);
          secondPage.drawText(req.body.witnessName, {
        font: customFont,
         size: 11,
         });




         //

  writeFileSync("Legal.pdf", await document.save());

  return true;
}


async function downloadCardPDF(req) {
  const document = await PDFDocument.load(readFileSync("./cardtemplate4.pdf"));

  const courierBoldFont = await document.embedFont(StandardFonts.Courier);
  const timesBoldFont = await document.embedFont(StandardFonts.TimesRomanBold);
  const firstPage = document.getPage(0);

  console.log( firstPage.getHeight() + " " +  firstPage.getWidth());


  firstPage.moveTo(125, 285);
  firstPage.drawText(req.customerName, {
    font: timesBoldFont,
    size: 24,
  });

//name second time
  firstPage.moveTo(163, 225);
  firstPage.drawText(req.cardNumber, {
    font: timesBoldFont,
    size: 24,
  });

  var companyname = req.insuranceCompany;

  if(companyname.length > 25)
  {
      // claim no. and company name-
      firstPage.moveTo(30, 135);
      firstPage.drawText( req.insuranceCompany , {
        font: timesBoldFont,
        size: 18,
      });
  }
  else
  {
     // claim no. and company name-
      firstPage.moveTo(330, 162);
      firstPage.drawText( req.insuranceCompany , {
        font: timesBoldFont,
        size: 19,
      });
  }

  // Validity start date
  firstPage.moveTo(293, 105);
  //const options = { year: 'numeric', month: 'long', day: 'numeric' };
  firstPage.drawText( req.cardStartDate.toLocaleDateString("en-GB") , {
    font: timesBoldFont,
    size: 24,
  });

  // Validity end date
  firstPage.moveTo(463, 105);
  firstPage.drawText( req.cardEndDate.toLocaleDateString("en-GB") , {
    font: timesBoldFont,
    size: 24,
  });

  writeFileSync("CardNew.pdf", await document.save());

  return true;
}

async function sendCompletionEmails(docs)
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

//const accessToken = oAuth2Client.credentials.access_token;
const accessToken = await oAuth2Client.getAccessToken();

//console.log(accessToken);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      type: 'OAuth2',
      user: 'Nidaancard@gmail.com',
      clientId: process.env.gmailclientid,
      clientSecret:  process.env.gmailclientSecret,
      refreshToken: process.env.gmailrefreshtoken,
      accessToken: accessToken,
  },
  tls: {
    rejectUnauthorized: false
  }
});


transporter.sendMail(mailOptions, function(error, info){
    if (error) {
    //res.json({message : error})
        console.log("could not send email" + error)
    } else {
        //res.json({message : 'mongoose'})
        console.log("emailsent");        
    }
});
    
      
      
}

//createPDF().catch((err) => console.log(err));