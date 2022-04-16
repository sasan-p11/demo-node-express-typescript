import express, { Express } from 'express';
import mongoose from 'mongoose';
import path from 'path';
import bodyParser from 'body-parser';
import session from 'express-session';
import flash from 'connect-flash';
import routes from './routes/routes';
import loger from 'morgan';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import setUpPassport from "./tools/setuppassport";

const app: Express = express();

app.use(loger('dev'));

mongoose.connect("mongodb://0.0.0.0:27017/test");

setUpPassport();

//app.set("port", process.env.PORT || 3000);

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: "TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX",
   resave: true,
    saveUninitialized: true
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

app.listen(3000, () => {
    console.log('Application started on http://localhost:3000');
});