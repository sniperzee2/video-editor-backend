const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.authPass = async (req, res, next) => {
    // 1) Getting token and check of it's there
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = await req.headers.authorization.split(" ")[1];
    }

    if (!token || token === "null") {
        return res.status(200).json({
            message: "You aren't Logged In",
        });
    }

    // 2) Verification token
    let decoded;
    try {
        decoded = await jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
            return res.status(200).json({
                status: "fail",
                message: "Session expired"
            })
        }
        return res.status(200).json({
            status: "fail",
            message: "An error occured"
        })
    }
    try{
        const currentUser = await User.findById(decoded.id).populate("documents").populate("convertedFiles");    
        req.user = currentUser;
        res.locals.user = currentUser;
        console.log("Successfully Passed Middlware");
        next();
    }catch(err){
        console.log(err);
        return res.status(500).json({
            status: "fail",
            message: err.message
        });
    }
};