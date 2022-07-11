const HttpException = require('../utils/HttpException.utils');
const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const auth = (...roles) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            const bearer = 'Bearer ';

            if (!authHeader || !authHeader.startsWith(bearer)){
                throw new HttpException(401, 'Access denied. No credentials sent!')
            }

            const token = authHeader.replace(bearer, '');
            const secretKey = process.env.SECRET_JWT || "";

            //verify token
            const decoded = jwt.verify(token, secretKey);
            const user = await UserModel.findOne({ id: decoded.user_id });

            if (!user){
                throw new HttpException(401, 'Authentication failed');
            }

            //check if the current user is the owner user
            const ownerAuthorized = req.params.user_id;

            // if the current user is not the owner and
            // if the user role don't have the permission to do this action.
            // the user will get this error
            if(!ownerAuthorized && roles.length && !roles.includes(user.role)){
                throw new HttpException(401, "Unauthorized");
            }

            //if the user has permission
            res.currentUser = user;
            next();
        } catch (error) {
            error.status = 401;
            next(error);
        }
    } 
}

module.exports = auth;