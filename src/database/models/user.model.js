import mongoose from 'mongoose';
import { GenderUserEnum, ProviderUserEnum, RoleUserEnum } from '../../common/enums/index.js';

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minLength: 2,
            maxLength: 25
        },
        lastName: {
            type: String,
            minLength: 2,
            maxLength: 25
        },
        email: {
            type: String,
            required: true,
            unique: [true, "Email already exists."]
        },
        password: {
            type: String,
            required: function () {
                return this.provider == ProviderUserEnum.SYSTEM
            },
        },
        gender: {
            type: Number,
            enum: Object.values(GenderUserEnum),
            default: GenderUserEnum.MALE
        },
        role: {
            type: Number,
            enum: Object.values(RoleUserEnum),
            default: RoleUserEnum.USER
        },
        provider: {
            type: Number,
            enum: Object.values(ProviderUserEnum),
            default: ProviderUserEnum.SYSTEM
        },
        phone: String,
        dateOfBirth: Date,
        ChangeCredentialsTime: Date,
        confirmEmail: Date,
        deletedAt: Date,
        image: String,
        coverImage: [String],
    },
    {
        timestamps: true,
        id: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        optimisticConcurrency: true,
        versionKey: "versionData",
        collection: "USERS_DB"
    }
)

userSchema.virtual("userName").set(function (value) {
    const [firstName, lastName] = value?.split(" ") || []
    this.set({ firstName, lastName })
}).get(function () {
    return `${this.firstName || ""} ${this.lastName || ""}`
})

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema)