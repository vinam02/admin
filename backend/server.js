const express = require('express');     
const mongoose = require('mongoose');    
const cors = require('cors');      
require('dotenv').config();    
  
const app = express();         

// Middlewares (Frontend se data lene ke liye)
app.use(cors());   
app.use(express.json());     

// Database Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch((err) => console.log('DB Error: ', err));

// Routes Import
const itemRoutes = require('./routes/itemRoutes');   
const partyRoutes = require('./routes/partyRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes'); 
const companyRoutes = require('./routes/companies');// 



// Routes Connect
app.use('/api/items', itemRoutes); 
app.use('/api/parties', partyRoutes);
app.use('/api/purchases', purchaseRoutes); 
app.use('/api/companies', companyRoutes);  //
app.use('/api/sales', require('./routes/sales'));
app.use("/api/forms", require("./routes/formRoutes"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 