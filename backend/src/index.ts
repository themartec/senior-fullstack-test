// Create expressjs application
import express from 'express';
import authRoutes from './routes/auth';
import postRoutes from './routes/post';
import mongoose from 'mongoose';
import { exit } from 'process';
import dotenv from 'dotenv';

import cors from 'cors';

import passport from 'passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { IUser, User } from './model/user'
import { appSchedule } from './services';

dotenv.config();

const app = express();
const port = process.env.PORT || 3005 // default port to listen;

console.log('App going to load on port', port);

// connect database mongodb
const db_username = process.env.MONGO_USERNAME;
const db_password = process.env.MONGO_PASSWORD;
const db_host = process.env.MONGO_HOST;
const db_port = process.env.MONGO_PORT;
const db_source = process.env.MONGO_SOURCE;
const db_auth_source = process.env.MONGO_AUTH_SOURCE;

//specify mongodb uri authSource=admin
const mongoUri = `mongodb://${db_username}:${db_password}@${db_host}:${db_port}/${db_source}?authSource=${db_auth_source}`;

mongoose.connect(mongoUri, {}).then(() => {
    console.log('Database connected');
}).catch((err) => {
    if (err) {
        console.log('Error', err); exit;
    }
});

// more middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//config passport
passport.use(new BearerStrategy(
    async function (token, done) {
        try {
            let user = await User.findOne({ token: token });
            if (!user) { return done(null, false); }
            return done(null, user, { scope: 'all' });
        } catch (err: any) {
            console.log('Error on passport.use', err.message);
        }
    }
));

app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);

//for debug purpose only 
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason)
    // process.exit(1)
});

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
})

appSchedule()

export default app;