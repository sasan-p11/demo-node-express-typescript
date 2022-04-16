import mongoose from "mongoose";
import bcrypt from "bcrypt-nodejs";

interface IUser {
    username: string;
    password: string;
    createdAt: Date;
    displayName: string;
    bio: string;
}

const userSchema = new mongoose.Schema<IUser>({
    username: { type: String, required: true, },
    password: { type: String, required: true, },
    createdAt: { type: Date, default: Date.now, },
    displayName: String,
    bio: String
});

userSchema.methods.name = function () {
    return this.displayName || this.username;
}

const SALT_FACTOR = 10;
var noop = function () { };

userSchema.pre("save", function (done) {
    var user = this;
    if (!user.isModified("password")) {
        return done();
    }
    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
        if (err) { return done(err); }
        bcrypt.hash(user.password, salt, noop,
            function (err, hashedPassword) {
                if (err) { return done(err); }
                user.password = hashedPassword;
                done();
            });
    });
});

userSchema.methods.checkPassword = function (guess : string, done:Function) {
    console.log(typeof guess);
    bcrypt.compare(guess, this.password, function (err, isMatch) {
        done(err, isMatch);
    });
};

var User = mongoose.model("User", userSchema);

export default User;