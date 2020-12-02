import express, { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { Password } from '../services/password';
import { BadRequestError } from '../errors/bad-request-error';
import { validateRequest } from '../middlewares/validate-request';
import { User } from '../models/user';

const router = express.Router();

router.post('/api/users/signin',
[
    body('email')
        .isEmail()
        .withMessage('E-mail must be valid'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('You must supply a password')
],
validateRequest,
async (req: Request, res: Response) => {

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if(!existingUser) {
        throw new BadRequestError('Didn\'t find user with matching e-mail & password');
    }

    const passwordsMatch = await Password.compare(existingUser.password, password);

    if(!passwordsMatch) {
        throw new BadRequestError('Didn\'t find user with matching e-mail & password');
    }

    const userJwt = jwt.sign({ id: existingUser.id, email: existingUser.email }, process.env.JWT_KEY!);
    req.session = { jwt: userJwt };


    res.send(existingUser);
});

export { router as signinRouter };