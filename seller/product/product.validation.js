import yup from "yup";

export const yupProductValidation = yup.object({
  productName: yup
    .string()
    .required()
    .trim()
    .max(100, "product name exceed 100 characters!!")
    .min(2, "poduct name should contain 2 characters!!"),
  description: yup
    .string()
    .max(2000, "product description exceed 2000 characters!!")
    .min(10, "Description must be at least 10 characters!!")
    .required()
    .trim(),
  price: yup
    .number()
    .required("price is required")
    .positive()
    .typeError("price must be a number."),

  category: yup

    .string()

    .required("category is required!!")

    .trim()

    .max(50, "catagory can't be excees 50 characters!! "),

  brand: yup
    .string()
    .required("Brand name is required. ")
    .trim()
    .max(15, "Brand exceed 15 characters!!"),
    

  quantity: yup

    .number()
    .required("quantity is required !!")
    .positive("qualtity must be a positive number !! ")
    .typeError("quantity must be a number!!"),
  image: yup.string(),
});