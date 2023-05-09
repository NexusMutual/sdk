require('dotenv').config();

const path = require('path');
const express = require('express');

const assetsPath = path.join(__dirname, '../dist');
const port = process.env.PORT || 3000;

const app = express();
app.use(express.static(assetsPath));

app.listen(port, () => console.log(`Server started on port ${port}`));
