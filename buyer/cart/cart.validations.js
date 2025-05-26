import * as Yup from "yup";

export let addItemToCartValidationSchema = Yup.object({
  productId: Yup.string().required("Product id is required.").trim(),
  orderedQuantity: Yup.number()
    .required("Ordered quantity is required.")
    .min(1, "Ordered quantity must be at least 1."),
});

export const updateQuantityValidationSchema = Yup.object({
  action: Yup.string().required().oneOf(["inc", "dec"]),
});
