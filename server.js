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

// Create a schema
const dataSchema = new mongoose.Schema({
  customerName: String,
  customerAddress: String,
  customerPhone: String,
  claimNumber: String,
  insuranceCompanyName: String,
  // Add more fields as needed
});

// Create a model based on the schema
const dataSchemaObject = mongoose.model('Data', dataSchema);

// Parse JSON bodies for POST requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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


app.use(express.static('public'));

app.get('/', (req, res) => res.sendfile(__dirname+'/index.html'))

app.get('/login.html', (req, res) => res.sendfile(__dirname+'/login.html'))
app.get('/newcase.html', (req, res) => res.sendfile(__dirname+'/newcase.html'))
app.get('/viewdata.html', (req, res) => res.sendfile(__dirname+'/viewdata.html'))
app.get('/dashboard.html', (req, res) => res.sendfile(__dirname+'/dashboard.html'))

app.listen(port, () => console.log(`Insurance app listening on port ${port}!`))
