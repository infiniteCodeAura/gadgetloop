import yup, { Schema } from "yup";

export const searchValidation = async (req, res, next) => {
  const { name, category } = req.query;

  try {
    await yup
      .object({
        name: yup
          .string()
          .trim()
          .lowercase()
          .required("Name is required. ")
          .nullable(),
        category: yup
          .string()
          .trim()
          .lowercase()
          .required("Category is required. ")
          .nullable()
          .when("category", {
            is: (val) => val !== undefined && val !== null && val !== "",
            then: (schema) => schema.required("Category is required. "),
          }),
      })
      .noUnknown()
      .validate({ name, category });
    console.log(name, category);
  } catch (error) {
    return res.status(400).json({ message: error.message, stack: error.stack });
  }
};
