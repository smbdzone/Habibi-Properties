import mongoose, { Schema } from 'mongoose';
const settingsSchema = new Schema({
    homepageSeoTitle: {
        type: String,
        trim: true,
        maxlength: [60, 'SEO Title should not exceed 60 characters']
    },
    homepageSeoDescription: {
        type: String,
        trim: true,
        maxlength: [160, 'SEO Description should not exceed 160 characters']
    }
}, {
    timestamps: true
});
// Ensure only one settings document exists
settingsSchema.statics.getOrCreate = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};
export default mongoose.model('Settings', settingsSchema);
