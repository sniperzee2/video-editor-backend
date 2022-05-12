const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const signToken = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const { id } = user;
    const data = {
        id
    };
    const token = signToken(data);
    console.log(process.env.JWT_EXPIRES_IN)
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    }

    res.cookie("storage_cookie", token, cookieOptions)


    res.status(statusCode).json({
        status: "ok",
        message: "Storage Created Successfully"
    });
};

exports.login = async (req, res, next) => {
    const { email} = req.body;
    if (!email) {
        return res.status(400).json({
            status: "fail",
            message: "Please provide Email",
        });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            const newUser = await User.create({ email });
            createSendToken(newUser, 201, res);
        }
        else{
            createSendToken(user, 200, res);
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal server error" });
    }
};