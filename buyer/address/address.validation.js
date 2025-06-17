import * as yup from "yup";

export const yupAddressValidationSchema = yup.object().shape({
  phone: yup
    .string()
    .matches(/^[0-9]{7,15}$/, "Phone must be a valid number. ")
    .required("Phone is required"),

  city: yup
    .string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be at most 50 characters")
    .required("City is required")
    .test("no-xss", "Invalid characters in city", (value) =>
      value ? !/<script.*?>.*?<\/script>/gi.test(value) : true
    ),

  address: yup
    .string()
    .trim()
    .min(2, "Address Line 1 must be at least 2 characters")
    .max(200, "Address must be at most 200 characters")
    .test("no-xss", "Invalid characters in address", (value) =>
      value ? !/<script.*?>.*?<\/script>/gi.test(value) : true
    )
    .required("Address is required"),

  address1: yup
    .string()
    .trim()
    .max(200, "Secondary address must be at most 200 characters")
    .test("no-xss", "Invalid characters in address1", (value) =>
      value ? !/<script.*?>.*?<\/script>/gi.test(value) : true
    )
    .optional(),
});
