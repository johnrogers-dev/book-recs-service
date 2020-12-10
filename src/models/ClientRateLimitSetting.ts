import mongoose from 'mongoose';

export interface IClientRateLimitSetting extends mongoose.Document {
    _id: string;
    clientId: string
    token_quantity: number;
    window_size_ms: number;
};

const clientRateLimitSettingSchema = new mongoose.Schema(
    {
        clientId: { type: String, required: true, unique: true },
        token_quantity: { type: Number, required: true },
        window_size_ms: { type: Number, required: true },
        over_limit_cost: { type: Number, required: true }
    },
    { timestamps: true }
);

export default mongoose.model<IClientRateLimitSetting>("ClientRateLimitSetting", clientRateLimitSettingSchema);

