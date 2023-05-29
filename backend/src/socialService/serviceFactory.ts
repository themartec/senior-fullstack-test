
import axios from "axios";
import { IPost, SocialStatus } from "../model/post";
import { IUser, IUserMeta } from "../model/user";
import cheerio from 'cheerio';

export enum TypeSocial {
    Facebook = 'facebook',
    Linkedin = 'linkedin',
}

export interface SocialAuthType {
    access_token: string,
    name: string,
    authUser: IUser
}

export abstract class SocialServiceAbstract {
    abstract initAxios(): void;
    abstract postNewFeed(message: string, newPostSavedDB: IPost): void;
    abstract setAccessToken(userMeta: any): void;
    abstract saveTokenDB(data: SocialAuthType): void;
    abstract getLikeShareComment(post: IPost): void;
}

export default class SocialService implements SocialServiceAbstract {

    _accessToken: string = ''
    _axios: any = null
    _axiosLinkedinAuth: any = null

    constructor() {
        this.initAxios();
    }

    public initAxios() {
        throw new Error('Method initAxios not implemented.');
    }

    public async postNewFeed(message: string, newPostSavedDB: IPost): Promise<void> {
        throw new Error('Method postNewFeed not implemented.');
    }

    public async setAccessToken(userMeta: IUserMeta): Promise<void> {
        throw new Error('Method setAccessToken not implemented.');
    }

    public async getLikeShareComment(post: IPost): Promise<void> {
        throw new Error('Method getLikeShareComment not implemented.');
    }

    public async saveTokenDB(data: SocialAuthType): Promise<void> {
        throw new Error('Method saveTokenDB not implemented.');
    }
}

export class FacebookService extends SocialService {

    // "https://graph.facebook.com/v16.0/me?fields=id%2Cname&access_token="

    initAxios() {
        this._axios = axios.create({
            baseURL: 'https://graph.facebook.com/v16.0'
        });
    }

    async postNewFeed(message: string, newPostSavedDB: IPost) {
        console.log(`Post new feed to Facebook: ${message}`);

        const pageId = process.env.FACEBOOK_PAGE_ID

        try {
            const res = await this._axios.post(`/${pageId}/feed`, {
                message: message,
                access_token: this._accessToken
            })

            // after successfully post now need to save the page_post_id to post model
            // those task dont need async
            newPostSavedDB.meta.facebook = {
                post_id: res.data.id,
                likes: 0,
                shares: 0,
                comments: 0,
            }

            newPostSavedDB.markModified('meta.facebook')
            newPostSavedDB.facebook_status = SocialStatus.POSTED

            await newPostSavedDB.save()

        } catch (err) {
            console.log(err);
        }
    }

    async setAccessToken(userMeta: IUserMeta) {
        this._accessToken = userMeta.pageAccessToken
        this._axios.defaults.params = {}
        this._axios.defaults.params['access_token'] = userMeta.pageAccessToken;
    }

    async saveTokenDB(data: SocialAuthType) {
        const user = data.authUser

        //extend the token before save to database  

        try {
            //get page token
            const pageId = process.env.FACEBOOK_PAGE_ID
            const res = await this._axios.get(`/${pageId}?fields=access_token&access_token=${data.access_token}`)
            const pageAccessToken = res.data.access_token;

            //extend token
            // https://developers.facebook.com/docs/pages/access-tokens/
            const shortLiveAccessToken = data.access_token
            const appId = process.env.FACEBOOK_APP_ID
            const appSecret = process.env.FACEBOOK_APP_SECRET

            const res2 = await this._axios.get(`oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLiveAccessToken}`)

            const longLiveAccessToken = res2.data.access_token

            user.meta.facebook = <IUserMeta>{
                accessToken: longLiveAccessToken,
                pageAccessToken: pageAccessToken,
                name: data.name
            }

            user.markModified('meta.facebook')

            await user.save()
        } catch (err) {
            console.log(err);
        }
    }

    async getLikeShareComment(post: IPost) {


        try {
            console.log('get like share comment of facebook post');

            if (post.meta.facebook == undefined) {
                return;
            }

            //get the user creator of the post
            const postPopulated: IPost = await post.populate('user')

            const meta: IUserMeta = postPopulated.user.meta.facebook

            this.setAccessToken(meta)

            const post_id = post.meta.facebook.post_id
            const res = await this._axios.get(`/${post_id}/?fields=likes.summary(true),shares.summary(true),comments.summary(true)`, {})

            // after successfully post now need to save the page_post_id to post model
            // those task dont need async
            post.meta.facebook = {
                ...post.meta.facebook,
                likes: res.data.likes?.summary.total_count || 0,
                shares: res.data.shares?.count || 0,
                comments: res.data.comments?.summary.total_count || 0,
            }

            post.markModified('meta.facebook')
            post.facebook_status = SocialStatus.SUCCESS

            await post.save()

        } catch (err) {
            console.log(err);

            post.facebook_status = SocialStatus.ERROR_CRAWLING
            post.save()
        }
    }
}

export class LinkedinService extends SocialService {

    initAxios() {
        this._axiosLinkedinAuth = axios.create({
            baseURL: 'https://www.linkedin.com/oauth/v2'
        })

        this._axios = axios.create({
            baseURL: 'https://api.linkedin.com/v2',
            headers: {
                'X-Restli-Protocol-Version': '2.0.0',
            }
        });
    }

    async postNewFeed(message: string, newPostSavedDB: IPost) {
        console.log(`Post new feed to Linkedin: ${message}`);

        //get the user creator of the post
        const postPopulated: IPost = await newPostSavedDB.populate('user')

        const meta: IUserMeta = postPopulated.user.meta.linkedin


        const res = await this._axios.post('/ugcPosts', {
            author: meta.linkedinURN,
            lifecycleState: 'PUBLISHED',
            specificContent: {
                'com.linkedin.ugc.ShareContent': {
                    'shareCommentary': {
                        'text': message
                    },
                    'shareMediaCategory': 'NONE'
                }
            },
            visibility: {
                'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
        })

        // after successfully post now need to save the page_post_id to post model
        // those task dont need async
        newPostSavedDB.meta.linkedin = {
            post_id: res.data.id,
            likes: 0,
            shares: 0,
            comments: 0,
        }

        newPostSavedDB.markModified('meta.linkedin')
        newPostSavedDB.linkedin_status = SocialStatus.POSTED

        await newPostSavedDB.save()

    }

    async setAccessToken(userMeta: IUserMeta) {
        this._accessToken = userMeta.accessToken

        this._axios.defaults.params = {}
        this._axios.defaults.headers['Authorization'] = `Bearer ${this._accessToken}`
    }

    async saveTokenDB(data: SocialAuthType) {
        const user = data.authUser

        const res = await this._axiosLinkedinAuth.post('/accessToken', {
            'grant_type': 'authorization_code',
            'code': data.access_token,
            'redirect_uri': process.env.LINKEDIN_REDIRECT_URI,
            'client_id': process.env.LINKEDIN_CLIENT_ID,
            'client_secret': process.env.LINKEDIN_CLIENT_SECRET
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })

        const res2 = await this._axios.get('/me?projection=(id,localizedFirstName,localizedLastName)', {
            headers: {
                'Authorization': 'Bearer ' + res.data.access_token,
            }
        })

        const fullName = res2.data.localizedFirstName + ' ' + res2.data.localizedLastName

        //get userinfo data
        user.meta.linkedin = <IUserMeta>{
            accessToken: res.data.access_token,
            name: fullName,
            linkedinURN: `urn:li:person:${res2.data.id}`
        }

        user.markModified('meta.linkedin')

        await user.save()
    }

    async getLikeShareComment(post: IPost) {
        try {
            if (post.meta.linkedin == undefined) {
                return;
            }

            console.log('Get like share comment from Linkedin post');

            //get the user creator of the post
            const postPopulated: IPost = await post.populate('user')

            const meta: IUserMeta = postPopulated.user.meta.linkedin

            this.setAccessToken(meta)

            const post_id = post.meta.linkedin.post_id

            const crawlAxios = axios.create({
                baseURL: `https://www.linkedin.com`
            })

            const res = await crawlAxios.get(`/embed/feed/update/${post_id}`, {})

            const $ = cheerio.load(res.data)

            const likeCount = parseInt($('[data-test-id="social-actions__reaction-count"]').text().trim())
            const commentCount = parseInt($('[data-test-id="social-actions__comments"]').attr('data-num-comments')!, 10)

            // I will need to get detail base on crawling method
            // https://www.linkedin.com/embed/feed/update/${post_id}

            // after successfully post now need to save the page_post_id to post model
            // those task dont need async
            post.meta.linkedin = {
                ...post.meta.linkedin,
                likes: likeCount || 0,
                shares: 0,
                comments: commentCount || 0,
            }

            post.markModified('meta.linkedin')
            post.linkedin_status = SocialStatus.SUCCESS

            await post.save()

        } catch (err) {
            console.log(err);

            post.linkedin_status = SocialStatus.ERROR_CRAWLING
            post.save()
        }
    }
}

export class SocialServiceFactory {
    static create(type: TypeSocial) {
        switch (type) {
            case TypeSocial.Facebook:
                return new FacebookService();
            case TypeSocial.Linkedin:
                return new LinkedinService();
            default:
                throw new Error('Invalid social type');
        }
    }
}