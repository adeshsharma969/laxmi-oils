const STORAGE_DELIVERY_PINCODE = "laxmi_delivery_pincode";

const cleanPincode = (value) => String(value || "").replace(/\D/g, "").slice(0, 6);

export const readDeliveryPincode = () => {
  if (typeof window === "undefined") return "";
  try {
    return cleanPincode(window.localStorage.getItem(STORAGE_DELIVERY_PINCODE));
  } catch {
    return "";
  }
};

export const writeDeliveryPincode = (value) => {
  if (typeof window === "undefined") return;
  try {
    const pincode = cleanPincode(value);
    if (pincode) window.localStorage.setItem(STORAGE_DELIVERY_PINCODE, pincode);
    else window.localStorage.removeItem(STORAGE_DELIVERY_PINCODE);
  } catch {
    // Delivery promise is a convenience layer; shopping should continue if storage fails.
  }
};

export const deliveryDateRange = (delivery = "standard") => {
  const [minDays, maxDays] = delivery === "express" ? [1, 2] : [4, 6];
  const format = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };
  return `${format(minDays)} - ${format(maxDays)}`;
};

export const deliveryPromise = (pincode, delivery = "standard") => {
  const pin = cleanPincode(pincode);
  if (pin.length !== 6) return "Check delivery to your area";
  return `${delivery === "express" ? "Express" : "Standard"} delivery to ${pin}: ${deliveryDateRange(delivery)}`;
};

export const orderTimelineSteps = ["Confirmed", "Packed", "Shipped", "Delivered"];

export const activeTimelineIndex = (status = "") => {
  const normalized = String(status || "").toLowerCase();
  if (["delivered"].includes(normalized)) return 3;
  if (["shipped"].includes(normalized)) return 2;
  if (["packed"].includes(normalized)) return 1;
  return 0;
};
