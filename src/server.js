const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const HttpException = require('./utils/HttpException.utils');
const errorMiddleware = require('./middleware/error.middleware')
const userRouter = require('./routes/user.route')

const app = express();

dotenv.config();

app.use(express.json());

app.use(cors());

app.options("*", cors);

const PORT = Number(process.env.PORT || 3331);

app.use(`/api/v1/users`, userRouter);

// 404 error 
app.all("*", (req, res, next) => {
    const err = new HttpException(404, "Endpoint Not Found");
    next(err);
})

//Error Middleware 
app.use(errorMiddleware)

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}!`);
})