import mongoose, { model, Schema, Document } from 'mongoose';
import Joi from 'joi';
import bcrypt from 'bcrypt'

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    balance: number;
    salt?: string;
    token: string;
    meta: {
        facebook: IUserMeta,
        linkedin: IUserMeta
    };
}

export interface IUserMeta {
    accessToken: string,
    pageAccessToken: string,
    name: string,
    linkedinURN?: string,
}

const UserSchema = new Schema<IUser>({
    username: { type: String, required: true, unique: true },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    salt: { type: String, require: true },
    balance: { type: Number, default: 0 },
    token: { type: String },
    meta: {
        type: Schema.Types.Mixed,
        default: {
            facebook: {},
            linkedin: {}
        }
    }
}, { timestamps: true });

//pre save User to database make sure password is hashed and salted
const saltRounds = 10;

UserSchema.pre<IUser>('save', async function (next) {
    //only execute code below if password is modified or new user 
    if (this.isNew) {
        //go on below
    } else if (!this.isModified('password')) {
        return next();
    }

    const salt = bcrypt.genSaltSync(saltRounds);

    try {
        return new Promise((resolve, reject) => {
            bcrypt.hash(this.password, salt, async (err: any, hash: string) => {
                if (err) {
                    return reject(err);
                }

                this.password = hash;
                this.salt = salt;

                resolve()
            });
        })
    } catch (err: any) {
        console.log('Error on pre<IUser> save', err.message);
        return next(err)
    }
})

UserSchema.methods.comparePassword = async function (password: string) {
    try {
        //compare input password with hashed password in database with salt
        const isMatch = await bcrypt.compare(password, this.password);
        return isMatch;
    } catch (err: any) {
        console.log('Error on comparePassword', err.message);
    }
}

export const User = model<IUser>('User', UserSchema);

export const qualityUser = Joi.object({
    username: Joi.string().required().max(32),
    email: Joi.string().email().required(),
    //require password complex
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number',
        })
})