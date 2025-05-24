import yup from "yup";

export const yupValidationComment = async (req, res,next) => {
  // get product id from params
  const productId = req.params.id;

  const data = { ...req.body, productId};
  try {
  await  yup
      .object({
        productId: yup.string().required("Product ID is required"),

        message: yup
          .string()
          .min(3, "Message must be at least 3 characters")
          .max(200, "message must be at most 200 characters. ")
          .required("Comment message is required"),
        star: yup
          .number()
          .required("Star rating is required")
          .min(1, "Minimum star rating is 1")
          .max(5, "Maximum star rating is 5"),
      })
      .noUnknown(true,{message: "Unknown field in request"})
      .strict(true)
      .validate(data);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
  next()
};

//add comment function 
export const comment = async(req,res)=>{
    console.log("object");
}
