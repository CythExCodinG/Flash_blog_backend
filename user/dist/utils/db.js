import mongoose from "mongoose";
const connectDb = async () => {
    try {
        mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to mongo db");
    }
    catch (error) {
        console.log("Connecting Error");
    }
};
export default connectDb;
//# sourceMappingURL=db.js.map