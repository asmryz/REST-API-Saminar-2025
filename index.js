import express from 'express';
const app = express();
const port = 8000;

import indexRouter from './routes/index.js';

app.use(express.json());
app.use('/api', indexRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});