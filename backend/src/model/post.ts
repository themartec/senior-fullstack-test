import Joi from 'joi';
import mongoose, { ObjectId } from 'mongoose';
import { IUser } from './user';

export interface IPost extends mongoose.Document {
    content: string;
    user: IUser,
    facebook_status: number,
    linkedin_status: number,
    meta: {
        facebook: IPostMeta,
        linkedin: IPostMeta
    },
    createdAt?: Date,
    updatedAt?: Date
}

export interface IPostMeta {
    post_id: string,
    likes: number,
    shares: number,
    comments: number
}

export enum SocialStatus {
    NOT_POSTED = 0,
    POSTED = 1,
    ERROR_POSTED = 2,
    CRAWLING = 3,
    ERROR_CRAWLING = 4,
    SUCCESS = 5
}

const PostSchema = new mongoose.Schema<IPost>({
    content: { type: String, required: true },
    facebook_status: { type: Number, default: 0, enum: [0, 1, 2, 3, 4, 5] },
    linkedin_status: { type: Number, default: 0, enum: [0, 1, 2, 3, 4, 5] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            facebook: {},
            linkedin: {}
        }
    }
}, { timestamps: true });

export const qualityPost = Joi.object({
    content: Joi.string().required(),
    authData: Joi.object(),
});

export default mongoose.model<IPost>('Post', PostSchema);

