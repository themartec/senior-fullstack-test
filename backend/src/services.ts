import { Jwt, sign } from "jsonwebtoken";
import { User, IUser } from "./model/user";
import { MongoServerError } from 'mongodb'
import nodeSchedule from 'node-schedule'
import { TypeSocial, SocialServiceFactory } from "./socialService/serviceFactory";
import post, { IPost } from "./model/post";

export const createNewUser = async (model: IUser) => {
    const newUser = new User(model);

    try {
        await newUser.save();

        return newUser;
    } catch (err: any) {
        if (err instanceof MongoServerError && err.code == 11000) {
            throw new Error("User is already exists");
        }

        throw new Error(err.message);
    }
}

// get user from database by username and hashed password from input is raw password
export const getUserByIdentifyAndPassword = async (identify: string, inputPassword: string): Promise<typeof User | boolean> => {
    try {
        let user: any = await User.findOne(
            {
                $or: [
                    { username: identify },
                    { email: identify }
                ]
            }
        );

        // compare input hashed password with hashed password in database
        const isMatch = await user?.comparePassword(inputPassword);

        if (isMatch) {
            // success login
            return user;
        }

    } catch (err: any) {
        console.log('Error on getUserByIdentifyAndPassword', err.message);
    }

    return false;
}

export const generateNewToken = (payload: any) => {
    const secret: string = process.env.JWT_SECRET as string;

    if (secret) {
        return sign(payload, secret, { expiresIn: '24h' });
    }
}

export const addBalance = async (user: IUser, amount: number): Promise<Boolean> => {
    try {
        user.balance += amount;

        await user.save();

        return true;
    } catch (err: any) {
        console.log(err.message);

        return false;
    }
}

export const appSchedule = async () => {
    //schedule job every 15 minutes for update post likes shares comments
    nodeSchedule.scheduleJob('*/15 * * * *', async () => {
        console.log('Run schedule Job every 15 minutes');

        if (parseInt(process.env.ENABLE_API_REQUEST!) === 1) {
            //get all posts in database which is not updated
            const posts: IPost[] = await post.find({})

            //loop through all posts
            for (let i = 0; i < posts.length; i++) {
                const facebookService = SocialServiceFactory.create(TypeSocial.Facebook)
                const linkedinService = SocialServiceFactory.create(TypeSocial.Linkedin)
                facebookService.getLikeShareComment(posts[i])
                linkedinService.getLikeShareComment(posts[i])
            }
        }
    });
}