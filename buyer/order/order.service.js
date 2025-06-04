import yup from "yup";
import { checkMongoId } from "../../utils/mongo.id.validation.js";

export const orderValidation = async (req, res, next) => {
  const quantity = req.body;
  const productId = req.params.id;
  try {
    //check mongo id validity
    const checkId = await checkMongoId(productId);
    if (!checkId) {
      return res.status(400).json({ message: "Invalid product id. " });
    }

    await yup
      .object({
        quantity: yup
          .number()
          .required("Product is required. ")
          .min(1, "Atleast 1 product must be selected. "),
      })
      .validate(quantity);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
};
