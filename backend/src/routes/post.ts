import express from 'express';
import { IUser } from '../model/user';
import post, { qualityPost } from '../model/post';
import { ErrorResponse } from '../http/respose';
import passport from 'passport';
import { TypeSocial, SocialServiceFactory } from '../socialService/serviceFactory';

const router = express.Router();

router.use(passport.authenticate('bearer', { session: false }))

//create new post
router.post('/', async (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: 'Content can not be empty!'
        });
    }
    const authUser: IUser = req.user as IUser;

    if (authUser) {

        const { error, value } = qualityPost.validate(req.body);

        if (error) {
            return res.status(400).send(<ErrorResponse>{
                message: error.details[0].message,
            })
        }

        try {
            let newPost = new post({
                content: value.content,
                user: authUser._id,
                facebook_status: 0,
                linkedin_status: 0,
                meta: {
                    facebook: {},
                    linkedin: {}
                }
            })

            await newPost.save()

            const postOnSocialNetworks = process.env.API_POST_ENABLE ? [
                TypeSocial.Facebook,
                TypeSocial.Linkedin
            ] : []

            postOnSocialNetworks.forEach(async (socialType: TypeSocial) => {
                // post to social using social_service.ts
                const socialService = SocialServiceFactory.create(socialType);

                await socialService.setAccessToken(authUser.meta[socialType])
                await socialService.postNewFeed(value.content, newPost);
            })

        } catch (err: any) {
            return res.status(400).send(<ErrorResponse>{
                message: err.message,
            })
        }

        return res.send({
            message: 'Create new post success!'
        })
    }

    return res.status(401).send(<ErrorResponse>{
        message: 'Unauthorized'
    })
});

router.post('/sync-insight', async (req, res) => {
    //get all post in database

    let enable = parseInt(process.env.ENABLE_API_REQUEST!)

    if (parseInt(process.env.ENABLE_API_REQUEST!) === 1) {
        const posts = await post.find({})
        const facebookService = SocialServiceFactory.create(TypeSocial.Facebook);
        const linkedinService = SocialServiceFactory.create(TypeSocial.Linkedin);

        posts.forEach(async (post: any) => {
            facebookService.getLikeShareComment(post)
            linkedinService.getLikeShareComment(post)
        });
    }

    return res.status(200).send({
        message: 'Sync insight success!'
    })
})

//get ths list post
router.get('/', async (req: any, res: any) => {
    const authUser: IUser = req.user as IUser;

    const page = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.pageSize) || 10

    const posts = await post.find({
        user: authUser._id
    })
        .populate('user', 'username email')
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 })

    const totalPosts = await post.countDocuments({})

    return res.status(200).json({
        items: posts,
        total: totalPosts
    })
})

export default router;