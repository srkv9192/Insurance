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

var nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
      type: 'OAuth2',
      user: 'Nidaancard@gmail.com',
      clientId: "",
      clientSecret: "",
      refreshToken: "",
      accessToken: "",
      expires: 1484314697598
  }
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

//Manager schema 
const managerSchema = new mongoose.Schema({
  managerID: String,
  managerName: String,
  phone: String,
  email: String,
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
                        'managerCount': req.body.managerCount,
                        'cpCount': req.body.cpCount,
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
    await updateCardDetails(refNumber, cardnumber );

   await incrementCardCount();
    res.json({ message: 'success', cardnumber:cardnumber });
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

app.get("/api/sendcardemail", async(req, res) => {
  try {
    // Retrieve all tpa list from database
    sendCompletionEmails();
    res.json("Email sent");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send card email' });
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
app.get('/viewdata.html', (req, res) => res.sendFile(__dirname+'/viewdata.html'))
app.get('/dashboard.html', (req, res) => res.sendFile(__dirname+'/dashboard.html'))
app.get('/newcard.html', (req, res) => res.sendFile(__dirname+'/newcard.html'))
app.get('/newcarddirect.html', (req, res) => res.sendFile(__dirname+'/newcarddirect.html'))
app.get('/paymentinfo.html', (req, res) => res.sendFile(__dirname+'/paymentinfo.html'))
app.get('/viewcards.html', (req, res) => res.sendFile(__dirname+'/viewcards.html'))
app.get('/viewpendingcards.html', (req, res) => res.sendFile(__dirname+'/viewpendingcards.html'))

app.get('/generatelegalpdf.html', (req, res) => res.sendFile(__dirname+'/generatelegalpdf.html'))

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

  firstPage.drawText(new Date().toUTCString(), {
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


function sendCompletionEmails()
{
    
  var mailOptions = {
    from: 'nidaancard@gmail.com',
    to: 'letscode4good@gmail.com',
    subject: `Policy Card`,
    text: `Please find the attached report- \n \n\ `
    
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