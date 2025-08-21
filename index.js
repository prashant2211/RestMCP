import express from 'express';
// import mongoose from 'mongoose';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import chatRoute from './routes/chatRoute.js';
import mcpRegistration from './routes/mcpRegisterRoute.js';
import mcpExposeRoute from './routes/mcpExposeRoute.js';
import authorization from './routes/authorization.js'

dotenv.config();

// mongoose.connect(process.env.DBCONNECTIONURL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const db = mongoose.connection;

// db.on('error', (err) => {
//   console.error(err);
// });


const app = express();



app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`-=- Server is running on PORT: ${PORT}`);
});

// Ensure BASE_URL is defined in .env (e.g., BASE_URL=/api) mcpRegistration
app.use(`${process.env.BASE_URL}/MCP`, chatRoute);
app.use(`${process.env.BASE_URL}/Integration`, mcpRegistration);
app.use(`${process.env.BASE_URL}/authrization`, authorization);
//app.use("/", mcpRouter); // this gives /MCP/describe and /MCP/prompt

console.log(`Base URl -=-=- ${process.env.BASE_URL}`)