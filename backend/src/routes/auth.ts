//Create route files
// Path: backend/routers.ts

import express from 'express';
import { User, IUser, qualityUser } from '../model/user';
import { createNewUser, getUserByIdentifyAndPassword, generateNewToken } from '../services';
import { ErrorResponse, SuccessResponse } from '../http/respose'
import passport, { use } from 'passport';
import SocialService, { SocialServiceFactory, TypeSocial } from '../socialService/serviceFactory';

const router = express.Router();

router.get('/index', (req, res) => {
    res.json({
        message: 'Connected APIs'
    });
});

// User register
router.post('/register', (req, res) => {
    //validate request
    if (!req.body) {
        res.status(400).send(<ErrorResponse>{
            message: 'Content can not be empty!'
        });
    }

    const { error, value } = qualityUser.validate(req.body)

    if (error) {
        return res.status(400).send(<ErrorResponse>{
            message: error.details[0].message,
        })
    }

    try {
        //create new user
        createNewUser(value)
            .then((newUser) => {
                const response: SuccessResponse = {
                    data: newUser,
                    message: 'Register success!',
                    code: 201
                }
                return res.status(201).send(response)
            })
            .catch((err) => {
                return res.status(400).send(<ErrorResponse>{
                    message: err.message,
                })
            })
    } catch (err: any) {
        return res.status(400).send(<ErrorResponse>{
            message: err.message,
        })
    }
})

router.post('/login', async (req, res) => {
    if (!req.body) {
        return res.status(400).send(<ErrorResponse>{
            message: 'Content can not be empty!'
        });
    }

    try {
        let returnUser = await getUserByIdentifyAndPassword(req.body.identify, req.body.password)

        if (returnUser instanceof User && returnUser) {

            // ok let generate new token, becauseful on payload, because JWT is not encrypted model
            const token = generateNewToken({
                username: returnUser.username,
                balance: returnUser.balance,
            })

            if (token) {
                // save the token to database
                returnUser.token = token || '';

                await returnUser.save();

                const response: SuccessResponse = {
                    data: {
                        token: token
                    },
                    message: 'Login success!',
                    code: 200
                }

                return res.status(200).send(response)
            }
        }

        res.status(401).send(<ErrorResponse>{
            message: 'Wrong username or password!'
        });
    } catch (err: any) {
        res.status(400).send(<ErrorResponse>{
            message: err.message,
        })
    }
})

router.get('/profile', passport.authenticate('bearer', { session: false }), (req, res) => {
    //load profile of user
    const authUser: IUser = req.user as IUser;

    if (authUser) {
        //get the profile base on authUser
        const response: SuccessResponse = {
            data: {
                username: authUser.username,
                balance: authUser.balance,
                meta: authUser.meta,
                id: authUser._id
            },
            message: 'Get profile success!',
            code: 200
        }

        return res.status(200).send(response)
    }
})

router.post('/logout', passport.authenticate('bearer', { session: false }), async (req, res) => {
    const authUser: IUser = req.user as IUser;

    if (authUser) {
        authUser.token = '';
        await authUser.save();

        const response: SuccessResponse = {
            data: null,
            message: 'Logout success!',
            code: 200
        }

        return res.status(200).send(response)
    }
})

//save token from client to database
router.post('/save-token', passport.authenticate('bearer', { session: false }), async (req, res) => {
    const authUser: IUser = req.user as IUser;

    const type = req.body.type;
    const access_token = req.body._token;
    const name = req.body.name;

    if (authUser) {
        //extend the token to long live token
        const social = SocialServiceFactory.create(type)

        await social.saveTokenDB({
            access_token: access_token,
            name: name,
            authUser: authUser
        })

        const response: SuccessResponse = {
            data: null,
            message: 'Save token success!',
            code: 200
        }

        return res.status(200).send(response)
    }
})

// OAuth2
router.get('/linkedin/callback', async (req, res) => {
    //redirect back to frontend
    const code: any = req.query.code;
    const id: any = req.query.state;

    const social: SocialService = SocialServiceFactory.create(TypeSocial.Linkedin)

    const authUser: IUser = (await User.findOne({ _id: id }))!

    await social.saveTokenDB({
        access_token: code,
        name: authUser.username,
        authUser: authUser
    })

    return res.redirect('http://localhost:3006/auction');
})

export default router;