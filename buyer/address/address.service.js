import User from "../../user/user.model.js";
import { sanitizeData } from "../../utils/sanitizeData.js";
import { Address } from "./address.model.js";
import { yupAddressValidationSchema } from "./address.validation.js";
import yup from "yup";
/*
add buyer address 
*/
export const addressValidation = async (req, res, next) => {
  const { phone, address, address1, city } = req.body;
  //sanitize data
  try {
    await yupAddressValidationSchema.validate({
      phone,
      address,
      address1,
      city,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
};

export const address = async (req, res) => {
  let { phone, address, address1, city } = req.body;

  try {
    //validate and sanitize user input data
    phone = sanitizeData(phone);
    address1 = sanitizeData(address1);
    address = sanitizeData(address);
    city = sanitizeData(city);

    //for address collect data from token

    const userId = req.userId;
    //check address already exist or not

    const addressDb = await Address.findOne({ userId: userId });
    if (addressDb) {
      return res
        .status(400)
        .json({ message: "You can't add multiple address. " });
    }

    //find user
    const user = await User.findOne({ _id: userId });

    let firstName = user.firstName;
    let lastName = user.lastName;
    const fullName = `${firstName} ${lastName}`;

    const newAddress = new Address({
      userId,
      fullName,
      phone,
      address,
      address1,
      city,
    });

    //store it in database
    await Address.create(newAddress);
    return res.status(200).json({ message: "Delivery location updated. " });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

/*
update buyer address 
*/
export const updateAddressValidation = async (req, res, next) => {
  const { phone, city, address, address1 } = req.body;

  try {
    await yup
      .object({
        phone: yup
          .string()
          .required("Phone number is required.")
          .trim()
          .matches(/^\d{10}$/, "Phone number must be exactly 10 digits"),

        city: yup
          .string()
          .required("City name is required. ")
          .trim()
          .optional()
          .max(100)
          .test("no-xss", "Invalid characters in city", (value) =>
            value ? !/<script.*?>.*?<\/script>/gi.test(value) : true
          ),

        address: yup
          .string()
          .required("Address is required")
          .trim()
          .optional()
          .max(200)
          .test("no-xss", "Invalid characters in address", (value) =>
            value ? !/<script.*?>.*?<\/script>/gi.test(value) : true
          ),

        address1: yup
          .string()
          .trim()
          .optional()
          .max(200)
          .test("no-xss", "Invalid characters in address1", (value) =>
            value ? !/<script.*?>.*?<\/script>/gi.test(value) : true
          ),
      })

      .noUnknown()
      .validate({ phone, city, address, address1 }); //pass data here
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  next();
};

export const updateAddress = async (req, res) => {
  let { phone, address1, address, city } = req.body;

  try {
    phone = sanitizeData(phone);
    address1 = sanitizeData(address1);
    address = sanitizeData(address);
    city = sanitizeData(city);

    const addressDb = await Address.findOne({ userId: req.userId });
    if (!addressDb) {
      return res
        .status(400)
        .json({ message: "Please first add your primary address. " });
    }

    //update it
    await Address.updateOne(
      { userId: req.userId },
      {
        $set: {
          phone: phone,
          city: city,
          address: address,
          address1: address1,
        },
      }
    );
    return res.status(200).json({ message: "Address updated. " });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
