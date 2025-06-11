const jwt = require("jsonwebtoken");
const User = require("../models/user");
const auth = async (req, res, next) =>{
    try {
        const token = req.header("Autherization").replace('Bearer', '')
        const decode = jwt.verify(token, 'thisisnewproject')
        const user = User.findOne({_id: decode._id, 'tokens.token':token})

        if(!user){
            throw new Error()
        }

        req.token = token;

        req.user = user;


        next()

    } catch (error) {
        res.status(401).send({error: "Please authenticate"})
    }
}

module.exports = auth;