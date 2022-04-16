import { Router, Request, Response, NextFunction } from 'express';
import User from '../models/user';
import passport from 'passport';

interface IUser {
    username: string;
    password: string;
    createdAt: Date;
    displayName: string;
    bio: string;
}

const router: Router = Router();

router.use(function (req: Request, res: Response, next: NextFunction) {
    res.locals.currentUser = req.user;
    res.locals.errors = req.flash("error");
    res.locals.infos = req.flash("info");
    next();
});

router.get("/", function (req: Request, res: Response, next: NextFunction) {
    User.find()
        .sort({ createdAt: "desc" })
        .exec(function (err: any, users: any) {
            if (err) {
                return next(err);
            }
            res.render("index", { users: users });
        });
});

router.get("/signup", function (req: Request, res: Response, next: NextFunction) {
    res.render("signup");
});

router.post("/signup", function (req: Request, res: Response, next: NextFunction) {
    let username: string = req.body.username;
    let password: string = req.body.password;

    User.findOne({ username: username }, function (err: Error, user: IUser) {
        if (err) { return next(err); }
        if (user) {
            req.flash("error", "User already exists");
            return res.redirect("/signup");
        }

        let newUser = new User({
            username: username,
            password: password
        });
        newUser.save(next);
    });
}, passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/signup",
    failureFlash: true
}));

router.get("/users/:username", function (req: Request, res: Response, next: NextFunction) {
    User.findOne({ username: req.params.username }, function (err: Error, user: any) {
        if (err) { return next(err); }
        if (!user) { return next(404); }
        res.render("profile", { user: user });
    });
});

router.get("/login", function (req: Request, res: Response) {
    res.render("login",{ user: req.user });
});

router.post("/login",passport.authenticate("login", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));

router.get("/logout", function (req: Request, res: Response) {
    req.logOut();
    res.redirect("/");
});

function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("info", "You must be logged in to see this page.");
        res.redirect("/login");
    }
}

router.get("/edit", ensureAuthenticated, function (req: Request, res: Response) {
    res.render("edit");
});

router.post("/edit", ensureAuthenticated, function (req: any, res: any, next: NextFunction) {
    req.user.displayName = req.body.displayname;
    req.user.bio = req.body.bio;
    req.user!.save(function (err : Error) {
        if (err) {
            next(err);
            return;
        }
        req.flash("info", "Profile updated!");
        res.redirect("/edit");
    });
});


export default router;