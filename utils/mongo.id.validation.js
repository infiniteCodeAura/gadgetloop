import mongoose from "mongoose";

export const checkMongoId = async (payload) => {
  const mongoId =  mongoose.Types.ObjectId.isValid(payload);

  return mongoId;
};
