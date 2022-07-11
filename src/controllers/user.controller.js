const UserModel = require('../models/user.model');
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

class UserController {
    getAllUser = async (req, res) => {
        let userList = await UserModel.find();
        if (!userList.length){
            throw new HttpException(404, 'Users not found');
        }

        userList = userList.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });

        res.send(userList);
    };

    getUserById = async (req, res ) => {
        const user = await UserModel.findOne({ id: req.params.user_id});
        if (!user){
            throw new HttpException(404, "User not found");
        }
        const { password, ...userWithPassword } = user;

        res.send(userWithPassword);
    };

    getUserByuserName = async (req, res) => {
        const user = await UserModel.findOne({username: req.params.username});
        if (!user) {
            throw new HttpException(404, "User not found");
        }

        const { password, ...userWithPassword } = user;

        res.send(userWithPassword);
    }

    getCurrentUser = async (req, res) => {
        const { password, ...userWithPassword } = req.currentUser;
        res.send(userWithPassword)
    }

    createUser = async (req, res, next) => {
        this.checkValidation(req);
        await this.hashPassword(req);

        const result = await UserModel.update(restOfUpdates, req.params.id);

        if (!result) {
            throw new HttpException(404, "Something went wrong");
        }

        const { affectedRows, changedRows, info} = result;

        const message = !affectedRows ? "User Not found" :
            affectedRows && changedRows ? "User updated successfully" : "Update faild";

        res.send({message, info});
    }

    deleteUser = async (req, res, next) => {
        const result = await UserModel.delete(req.params.id);
        if (!result) {
            throw new HttpException(404, "User not found");
        }
        res.send('User has been deleted');
    }

    userLogin = async (req, res, next) => {
        this.checkValidation(req);

        const {email, password: pass} = req.body;

        const user = await  UserModel.findOne({ email });

        if (!user) {
            throw new HttpException(401, "Unable to login!");
        }

        const isMatch = await bcrypt.compare(pass, user.password);

        if (!isMatch) {
            throw new HttpException(401, "Incorrect password!");
        }

        //user matched!
        const secretKey = process.env.SECRET_JWT || "";
        const token = jwt.sign({ user_id: user.id.toString()}, secretKey, {
            expiresIn: '24h'
        })

        const { password, ...userWithoutPassword } = user;
        res.send({ ...userWithoutPassword, token});
    }

    checkValidation = (req) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()){
            throw new HttpException(400, 'Validation faild', errors)
        }
    }

    //hash password if it exists
    hashPassword = async (req) => {
        if (req.body.password) {
            req.body.password = await  bcrypt.hash(req.body.password, 8)
        }
    }
}

module.exports = new UserController;