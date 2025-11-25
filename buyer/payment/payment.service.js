import axios from "axios";
import { Order } from "../order/order.model.js";
import { Cart } from "../cart/cart.model.js";
import { Product } from "../../seller/product/product.model.js";

export const initiateKhaltiPayment = async (req, res) => {
    try {
        const userId = req.userId;
        const cart = await Cart.findOne({ userId }).populate("items.productId");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty." });
        }

        // Calculate total amount from database to prevent tampering
        let totalAmount = 0;
        const orderProducts = [];

        for (const item of cart.items) {
            const product = await Product.findById(item.productId);
            if (!product) continue;

            totalAmount += product.price * item.quantity;
            orderProducts.push({
                productId: product._id,
                name: product.productName,
                price: product.price,
                quantity: item.quantity,
            });
        }

        if (totalAmount === 0) {
            return res.status(400).json({ message: "Invalid order amount." });
        }

        // Create pending order
        const order = await Order.create({
            orderId: `ORD-${Date.now()}`,
            userId,
            products: orderProducts,
            totalAmount,
            paymentMethod: "wallet", // Khalti
            paymentStatus: "pending",
            orderStatus: "processing",
            shippingAddress: req.body.shippingAddress || {}, // Optional: pass address from frontend
        });

        const amountInPaisa = totalAmount * 100; // Khalti expects paisa

        const payload = {
            return_url: "http://localhost:3000/payment/khalti/callback",
            website_url: "http://localhost:3000/",
            amount: amountInPaisa,
            purchase_order_id: order._id.toString(),
            purchase_order_name: `Order ${order.orderId}`,
            customer_info: {
                name: req.userData.firstName + " " + req.userData.lastName,
                email: req.userData.email,
                phone: req.userData.mobileNumber || "9800000000",
            },
        };

        const response = await axios.post(
            "https://a.khalti.com/api/v2/epayment/initiate/",
            payload,
            {
                headers: {
                    Authorization: `Key 928f01f0c8104ac9a16a5d89845bfc53`,
                    "Content-Type": "application/json",
                },
            }
        );

        return res.status(200).json({
            message: "Payment initiated successfully.",
            payment_url: response.data.payment_url,
            pidx: response.data.pidx,
            orderId: order._id,
        });
    } catch (error) {
        console.error("Khalti Initiate Error:", error.response?.data || error.message);
        return res.status(400).json({ message: "Failed to initiate payment.", error: error.response?.data || error.message });
    }
};

export const verifyKhaltiPayment = async (req, res) => {
    const { pidx } = req.body;

    if (!pidx) {
        return res.status(400).json({ message: "PIDX is required." });
    }

    try {
        const response = await axios.post(
            "https://a.khalti.com/api/v2/epayment/lookup/",
            { pidx },
            {
                headers: {
                    Authorization: `Key 928f01f0c8104ac9a16a5d89845bfc53`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (response.data.status === "Completed") {
            const orderId = response.data.purchase_order_id;

            // Update order status
            await Order.findByIdAndUpdate(orderId, {
                paymentStatus: "paid",
                // Store pidx or transaction id if needed
            });

            // Flush cart
            await Cart.deleteOne({ userId: req.userId });

            return res.status(200).json({ message: "Payment verified successfully.", data: response.data });
        } else {
            return res.status(400).json({ message: "Payment not completed.", status: response.data.status });
        }
    } catch (error) {
        console.error("Khalti Verify Error:", error.response?.data || error.message);
        return res.status(400).json({ message: "Failed to verify payment.", error: error.response?.data || error.message });
    }
};
