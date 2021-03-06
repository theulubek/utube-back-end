import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import fileUpload from 'express-fileupload';

// Importing the routes:
import usersRouter from './src/routes/users.js';
import videoRouter from './src/routes/videos.js';
import fileRouter from './src/routes/files.js';

// Importing the middlewares:
import modelMiddleware from './src/middlewares/model.js';

const PORT = process.env.PORT || 5000;

const app = express();

// use the middlewares:
app.use(cors());
app.use(fileUpload());
app.use(express.json());
app.use(modelMiddleware({ databasePath: path.join(process.cwd(), 'src', 'database') }));
app.use(express.static(path.join(process.cwd(), 'src', 'uploads')));

// routes:
app.use(usersRouter);
app.use(videoRouter);
app.use(fileRouter);


// error handling:
app.use((error, req, res, next) => {
    console.log(error);
    if (error.status !== 500) {
        return res.status(error.status).json({
            status: error.status || 500,
            message: error.message,
            data: null,
            token: null
        });
    }
    
    let date = new Date();

    fs.appendFileSync(
        path.join(process.cwd(), 'src', 'errors', 'error.log'),
        `${req.method} ---- ${req.url} ---- ${date.toLocaleDateString() + ' | ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ---- ${error.name} ---- ${error.message}\n`
    );

    res.status(error.status).json({
        status: error.status || 500,
        message: 'Internal Server Error',
        data: null,
        token: null
    });

    process.exit();
});


// start the server:
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});