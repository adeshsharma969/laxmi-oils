import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  FileText,
  LocateFixed,
  MapPin,
  PackageCheck,
  Plus,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Truck,
  User,
  WalletCards,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { downloadInvoice, formatInvoiceDate, formatMoney, paymentLabel } from "../lib/invoice";

const STORAGE_PROFILE = "laxmi_checkout_profile";
const STORAGE_ADDRESSES = "laxmi_saved_addresses";

const emptyAddress = {
  label: "Home",
  name: "",
  email: "",
  phone: "",
  address: "",
  landmark: "",
  city: "",
  pincode: "",
  locationUrl: "",
};

const steps = [
  { id: 1, label: "Address", icon: User },
  { id: 2, label: "Delivery", icon: Truck },
  { id: 3, label: "Payment", icon: CreditCard },
  { id: 4, label: "Review", icon: ReceiptText },
];

const paymentMethods = [
  {
    id: "razorpay",
    title: "UPI / Card",
    desc: "Pay securely with Razorpay",
    icon: WalletCards,
  },
  {
    id: "cod",
    title: "Cash on Delivery",
    desc: "Pay when your oils arrive",
    icon: PackageCheck,
  },
];

const readJson = (key, fallback) => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be blocked in private mode; checkout should still work.
  }
};

const clean = (value) => String(value || "").trim();

const addressFingerprint = (address) =>
  [address.name, address.email, address.phone, address.address, address.landmark, address.city, address.pincode]
    .map((part) => clean(part).toLowerCase())
    .join("|");

const normalizeAddress = (address = {}, source = "Saved") => ({
  ...emptyAddress,
  ...address,
  label: clean(address.label) || "Home",
  source,
  id: address.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
});

const mergeAddresses = (...groups) => {
  const seen = new Set();
  return groups
    .flat()
    .filter(Boolean)
    .map((address) => normalizeAddress(address, address.source))
    .filter((address) => {
      if (!clean(address.address) || !clean(address.city) || !clean(address.pincode)) return false;
      const key = addressFingerprint(address);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6);
};

const getStoredProfile = () => ({ ...emptyAddress, ...readJson(STORAGE_PROFILE, {}) });
const getStoredAddresses = () => mergeAddresses(readJson(STORAGE_ADDRESSES, []));

const rememberCheckout = (address, shouldSaveAddress) => {
  const nextProfile = {
    label: address.label,
    name: address.name,
    email: address.email,
    phone: address.phone,
  };
  writeJson(STORAGE_PROFILE, nextProfile);

  if (!shouldSaveAddress) return getStoredAddresses();

  const saved = getStoredAddresses();
  const nextAddress = normalizeAddress({ ...address, source: "Saved" }, "Saved");
  const merged = mergeAddresses([nextAddress], saved);
  writeJson(STORAGE_ADDRESSES, merged);
  return merged;
};

const deliveryWindow = (minDays, maxDays) => {
  const fmt = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };
  return `${fmt(minDays)} - ${fmt(maxDays)}`;
};

const loadRazorpayCheckout = () =>
  new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Razorpay checkout is available only in the browser."));
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Could not load Razorpay checkout.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Could not load Razorpay checkout."));
    document.body.appendChild(script);
  });

export default function Checkout() {
  const cart = useCart();
  const auth = useAuth();
  const user = auth?.user;
  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const clearCart = cart?.clear || (() => {});

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => getStoredProfile());
  const [fieldErrors, setFieldErrors] = useState({});
  const [savedAddresses, setSavedAddresses] = useState(() => getStoredAddresses());
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [saveAddress, setSaveAddress] = useState(true);
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationMsg, setLocationMsg] = useState("");
  const [delivery, setDelivery] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [success, setSuccess] = useState(null);
  const [busy, setBusy] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [useCredit, setUseCredit] = useState(false);
  const [payError, setPayError] = useState("");

  const creditBalance = Math.max(0, Math.floor(user?.rewards_earned || 0));
  const shipping = delivery === "express" ? 79 : subtotal > 499 ? 0 : 49;
  const discount = couponApplied?.discount || 0;
  const afterDiscount = Math.max(0, subtotal + shipping - discount);
  const creditUsed = useCredit ? Math.min(creditBalance, afterDiscount) : 0;
  const total = Math.max(0, afterDiscount - creditUsed);

  const deliveryOptions = useMemo(
    () => [
      {
        id: "standard",
        title: "Standard",
        desc: subtotal > 499 ? "Free shipping unlocked" : "Free over Rs. 499",
        price: subtotal > 499 ? 0 : 49,
        eta: deliveryWindow(4, 6),
      },
      {
        id: "express",
        title: "Express",
        desc: "Priority packing and faster dispatch",
        price: 79,
        eta: deliveryWindow(1, 2),
      },
    ],
    [subtotal],
  );

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: prev.name || user?.name || "",
      email: prev.email || user?.email || "",
      phone: prev.phone || user?.phone || "",
    }));
  }, [user?.name, user?.email, user?.phone]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    api
      .get("/orders/me")
      .then(({ data }) => {
        if (cancelled) return;
        const orderAddresses = (Array.isArray(data) ? data : [])
          .map((order) =>
            normalizeAddress(
              {
                ...(order.address || {}),
                id: `order-${order.order_id}`,
                source: "Previous order",
              },
              "Previous order",
            ),
          )
          .filter((address) => clean(address.address));
        setSavedAddresses((prev) => mergeAddresses(orderAddresses, prev));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [user]);

  const applyAddress = (address) => {
    setSelectedAddressId(address.id);
    setFieldErrors({});
    setLocationMsg("");
    setForm((prev) => ({
      ...prev,
      ...emptyAddress,
      ...address,
      name: address.name || prev.name,
      email: address.email || prev.email,
      phone: address.phone || prev.phone,
    }));
  };

  const addNewAddress = () => {
    setSelectedAddressId("");
    setFieldErrors({});
    setLocationMsg("");
    setForm((prev) => ({
      ...emptyAddress,
      name: prev.name,
      email: prev.email,
      phone: prev.phone,
      label: "Home",
    }));
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateAddress = () => {
    const nextErrors = {};
    if (!clean(form.name)) nextErrors.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(clean(form.email))) nextErrors.email = "Enter a valid email";
    if (clean(form.phone).replace(/\D/g, "").length < 10) nextErrors.phone = "Enter a valid phone number";
    if (!clean(form.address)) nextErrors.address = "Street address is required";
    if (!clean(form.city)) nextErrors.city = "City is required";
    if (!/^\d{6}$/.test(clean(form.pincode))) nextErrors.pincode = "Enter a 6 digit pincode";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    setPayError("");
    if (step === 1 && !validateAddress()) return;
    setStep((current) => Math.min(4, current + 1));
  };

  const goBack = () => setStep((current) => Math.max(1, current - 1));

  const useCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationMsg("Location is not available in this browser.");
      return;
    }

    setLocationBusy(true);
    setLocationMsg("Finding your location...");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const lat = Number(coords.latitude).toFixed(6);
        const lng = Number(coords.longitude).toFixed(6);
        const locationUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        let nextAddress = {
          address: `Pinned location: ${locationUrl}`,
          locationUrl,
        };

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          );
          if (response.ok) {
            const data = await response.json();
            const parts = data?.address || {};
            const street = [parts.house_number, parts.road || parts.neighbourhood || parts.suburb].filter(Boolean).join(", ");
            nextAddress = {
              address: street || data?.display_name || nextAddress.address,
              city: parts.city || parts.town || parts.village || parts.county || parts.state_district || "",
              pincode: parts.postcode || "",
              locationUrl,
            };
          }
        } catch {
          // Fallback keeps the checkout moving even if reverse geocoding is blocked.
        }

        setForm((prev) => ({
          ...prev,
          address: nextAddress.address || prev.address,
          city: nextAddress.city || prev.city,
          pincode: nextAddress.pincode || prev.pincode,
          locationUrl,
        }));
        setLocationMsg("Location added. Please confirm house number and landmark.");
        setLocationBusy(false);
      },
      () => {
        setLocationMsg("Location permission was not granted.");
        setLocationBusy(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  const applyCoupon = async () => {
    setCouponMsg("");
    if (!coupon.trim()) return;
    try {
      const { data } = await api.post("/coupons/validate", { code: coupon.trim(), email: form.email || user?.email });
      if (data.valid) {
        setCouponApplied(data);
        setCouponMsg(`${formatMoney(data.discount)} off applied`);
      } else {
        setCouponApplied(null);
        setCouponMsg(data.reason || "Invalid code");
      }
    } catch {
      setCouponMsg("Could not validate this code right now.");
    }
  };

  const collectRazorpayPayment = async () => {
    await loadRazorpayCheckout();

    const amountPaise = Math.round(total * 100);
    if (amountPaise < 100) return null;

    const { data: order } = await api.post("/create-order", {
      amount: amountPaise,
      currency: "INR",
      receipt: `laxmi_${Date.now()}`,
    });

    const key = order.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!key) throw new Error("Razorpay key is missing.");

    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (fn, value) => {
        if (settled) return;
        settled = true;
        fn(value);
      };

      const razorpay = new window.Razorpay({
        key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Laxmi Edible Oils",
        description: "Order payment",
        order_id: order.order_id,
        prefill: {
          name: clean(form.name),
          email: clean(form.email),
          contact: clean(form.phone),
        },
        notes: {
          city: clean(form.city),
          pincode: clean(form.pincode),
        },
        theme: {
          color: "#1F3D2B",
        },
        modal: {
          ondismiss: () => finish(reject, new Error("Payment was cancelled.")),
        },
        handler: async (response) => {
          try {
            const { data } = await api.post("/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!data?.ok) throw new Error("Payment verification failed.");
            finish(resolve, response);
          } catch (error) {
            finish(reject, error);
          }
        },
      });

      razorpay.on("payment.failed", (response) => {
        finish(reject, new Error(response?.error?.description || "Payment failed. Please try another method."));
      });

      razorpay.open();
    });
  };

  const clearCoupon = () => {
    setCouponApplied(null);
    setCoupon("");
    setCouponMsg("");
  };

  const pay = async () => {
    if (!validateAddress()) {
      setStep(1);
      return;
    }

    setBusy(true);
    setPayError("");

    try {
      const razorpayPayment = paymentMethod === "razorpay" ? await collectRazorpayPayment() : null;
      const resolvedPaymentMethod = paymentMethod === "razorpay" && !razorpayPayment ? "store_credit" : paymentMethod;
      const payload = {
        items: items.map((item) => ({
          product_id: item.id,
          name: item.name,
          size: item.size,
          price: item.price,
          qty: item.qty,
          image: item.image,
          bg: item.bg,
        })),
        address: {
          label: form.label,
          name: clean(form.name),
          email: clean(form.email),
          phone: clean(form.phone),
          address: clean(form.address),
          landmark: clean(form.landmark),
          city: clean(form.city),
          pincode: clean(form.pincode),
          locationUrl: form.locationUrl,
        },
        delivery,
        payment_method: resolvedPaymentMethod,
        payment_id: razorpayPayment?.razorpay_payment_id || undefined,
        coupon_code: couponApplied?.code || null,
        use_credit: useCredit,
        credit_amount: creditUsed,
      };
      const { data } = await api.post("/orders", payload);
      setSavedAddresses(rememberCheckout(payload.address, saveAddress));
      setSuccess(data);
      clearCart();
    } catch (e) {
      setPayError(`Order failed: ${e?.response?.data?.detail || e.message || "Please try again."}`);
    } finally {
      setBusy(false);
    }
  };

  if (!cart || !auth) {
    return <div className="p-10 text-center font-display text-2xl text-[#1F3D2B]">Loading...</div>;
  }

  if (items.length === 0 && !success) {
    return (
      <div className="px-5 md:px-10 py-20 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center border-[3px] border-[#1F3D2B] bg-[#D98F00] text-[#1F3D2B]">
          <ShoppingBag size={30} strokeWidth={3} />
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-[#1F3D2B]">Cart is empty.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm font-bold text-[#1F3D2B]/75">Add your favorite oils first, then we will keep checkout quick.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex touch-target items-center gap-2 bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-6 py-3 font-black uppercase tracking-[0.16em] hover:bg-[#B8431A] hover:border-[#B8431A]"
        >
          Shop products <ArrowRight size={16} strokeWidth={3} />
        </Link>
      </div>
    );
  }

  if (success) {
    const paid = success.payment_status === "paid";
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        data-testid="checkout-success"
        className="px-4 sm:px-5 md:px-10 py-8 md:py-14"
      >
        <div className="mx-auto grid max-w-5xl grid-cols-12 gap-5 md:gap-7">
          <section className="col-span-12 lg:col-span-7 border-[3px] border-[#1F3D2B] bg-[#D98F00] p-5 sm:p-8 brutal-shadow-lg">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.12, type: "spring", stiffness: 180 }}
              className="mb-5 flex h-16 w-16 items-center justify-center border-[3px] border-[#1F3D2B] bg-[#1F3D2B] text-[#D98F00]"
            >
              <CheckCircle2 size={36} strokeWidth={3} />
            </motion.div>
            <div className="text-xs font-black uppercase tracking-[0.26em] text-[#1F3D2B]">Order confirmed</div>
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-[#1F3D2B] tracking-tighter mt-2">
              Payment {paid ? "received" : "recorded"}.
            </h1>
            <p className="mt-4 max-w-xl text-sm sm:text-base font-bold text-[#1F3D2B]/82">
              Your order is locked in. The invoice is ready now, and tracking will appear in your account once the shipment is packed.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ReceiptStat label="Order ID" value={success.order_id} mono />
              <ReceiptStat label="Paid" value={formatMoney(success.total)} />
              <ReceiptStat label="Payment" value={paymentLabel(success.payment_method)} />
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                data-testid="download-invoice"
                onClick={() => downloadInvoice(success)}
                className="touch-target inline-flex items-center justify-center gap-2 bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-5 py-3 font-black uppercase tracking-[0.14em] text-xs sm:text-sm hover:bg-[#B8431A] hover:border-[#B8431A]"
              >
                <Download size={16} strokeWidth={3} /> Download invoice
              </button>
              <Link
                to={`/invoice/${success.order_id}`}
                className="touch-target inline-flex items-center justify-center gap-2 bg-[#F5F1E8] text-[#1F3D2B] border-[3px] border-[#1F3D2B] px-5 py-3 font-black uppercase tracking-[0.14em] text-xs sm:text-sm hover:bg-[#D98F00]"
              >
                <FileText size={16} strokeWidth={3} /> Open invoice
              </Link>
            </div>
          </section>

          <aside className="col-span-12 lg:col-span-5 border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-5 sm:p-6 brutal-shadow">
            <div className="flex items-center justify-between gap-3 border-b-2 border-[#1F3D2B]/25 pb-4">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.22em] text-[#B8431A]">Receipt</div>
                <div className="font-display font-black text-2xl text-[#1F3D2B]">Invoice preview</div>
              </div>
              <div className="rounded-none border-2 border-[#1F3D2B] bg-[#D98F00] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#1F3D2B]">
                {success.payment_status || success.status}
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm text-[#1F3D2B]">
              <div className="flex justify-between gap-3">
                <span className="text-[#1F3D2B]/70">Invoice date</span>
                <span className="font-bold text-right">{formatInvoiceDate(success.created_at)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[#1F3D2B]/70">Delivery to</span>
                <span className="font-bold text-right">{success.address?.name}, {success.address?.city}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-[#1F3D2B]/70">Items</span>
                <span className="font-bold">{success.items?.reduce((sum, item) => sum + item.qty, 0) || 0}</span>
              </div>
            </div>

            <div className="mt-5 border-t-2 border-[#1F3D2B]/25 pt-4 space-y-2 text-sm">
              <TotalLine label="Subtotal" value={formatMoney(success.subtotal)} />
              <TotalLine label="Shipping" value={success.shipping === 0 ? "FREE" : formatMoney(success.shipping)} />
              {success.discount > 0 && <TotalLine label="Discount" value={`- ${formatMoney(success.discount)}`} tone="save" />}
              {success.credit_used > 0 && <TotalLine label="Store credit" value={`- ${formatMoney(success.credit_used)}`} tone="save" />}
              <div className="flex items-end justify-between border-t-[3px] border-[#1F3D2B] pt-3">
                <span className="text-xs font-black uppercase tracking-[0.22em]">Total</span>
                <span className="font-display font-black text-3xl">{formatMoney(success.total)}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row lg:flex-col gap-2">
              {user && (
                <Link
                  to="/account"
                  className="touch-target-sm inline-flex items-center justify-center gap-2 border-[3px] border-[#1F3D2B] bg-[#1F3D2B] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#F5F1E8]"
                >
                  <PackageCheck size={14} strokeWidth={3} /> View orders
                </Link>
              )}
              <Link
                to="/products"
                className="touch-target-sm inline-flex items-center justify-center gap-2 border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#1F3D2B] hover:bg-[#D98F00]"
              >
                <ShoppingBag size={14} strokeWidth={3} /> Continue shopping
              </Link>
            </div>
          </aside>
        </div>
      </motion.div>
    );
  }

  return (
    <div data-testid="checkout-page" className="px-4 sm:px-5 md:px-10 py-6 md:py-10">
      <div className="border-b-[3px] border-[#1F3D2B] pb-4 md:pb-6 mb-6 md:mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#B8431A]">Secure checkout</div>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-[#1F3D2B] tracking-tighter">Checkout.</h1>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs font-black uppercase tracking-[0.14em] text-[#1F3D2B]">
          <span className="inline-flex items-center gap-1 border-2 border-[#1F3D2B] bg-[#D98F00]/35 px-2 py-1">
            <ShieldCheck size={13} strokeWidth={3} /> Demo secure
          </span>
          <span className="inline-flex items-center gap-1 border-2 border-[#1F3D2B] bg-[#F5F1E8] px-2 py-1">
            <Clock3 size={13} strokeWidth={3} /> 2 min checkout
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 md:gap-8">
        <div className="col-span-12 lg:col-span-8">
          <div className="grid grid-cols-4 mb-6 md:mb-8 border-[3px] border-[#1F3D2B]">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const active = step === item.id;
              const done = step > item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id < step) setStep(item.id);
                    else if (item.id === step + 1) goNext();
                  }}
                  className={`p-2 sm:p-3 md:p-4 flex items-center justify-center sm:justify-start gap-2 md:gap-3 ${
                    index < steps.length - 1 ? "border-r-[3px] border-[#1F3D2B]" : ""
                  } ${active ? "bg-[#D98F00]" : done ? "bg-[#1F3D2B] text-[#F5F1E8]" : "bg-[#F5F1E8]"}`}
                >
                  <span
                    className={`w-7 h-7 md:w-8 md:h-8 border-2 ${
                      done
                        ? "bg-[#D98F00] border-[#D98F00] text-[#1F3D2B]"
                        : active
                          ? "bg-[#1F3D2B] border-[#1F3D2B] text-[#D98F00]"
                          : "border-[#1F3D2B] text-[#1F3D2B]"
                    } flex items-center justify-center flex-shrink-0`}
                  >
                    {done ? <Check size={14} strokeWidth={3} /> : <Icon size={14} strokeWidth={2.5} />}
                  </span>
                  <span className="hidden sm:block text-left">
                    <span className="block text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Step {item.id}</span>
                    <span className="block font-display font-black text-sm sm:text-base">{item.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.section
                key="address"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-4 sm:p-6 brutal-shadow"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.26em] text-[#B8431A]">Deliver to</div>
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-[#1F3D2B]">Address and contact</h2>
                  </div>
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    disabled={locationBusy}
                    className="touch-target-sm inline-flex items-center justify-center gap-2 border-[3px] border-[#1F3D2B] bg-[#D98F00] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#1F3D2B] disabled:opacity-60"
                  >
                    <LocateFixed size={15} strokeWidth={3} /> {locationBusy ? "Locating" : "Use current location"}
                  </button>
                </div>

                {locationMsg && (
                  <div className="mt-3 border-2 border-[#1F3D2B] bg-[#D98F00]/25 px-3 py-2 text-xs font-bold text-[#1F3D2B]">
                    {locationMsg}
                  </div>
                )}

                {savedAddresses.length > 0 && (
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.24em] text-[#1F3D2B]">Previous addresses</div>
                      <button
                        type="button"
                        onClick={addNewAddress}
                        className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black uppercase tracking-[0.16em] text-[#B8431A]"
                      >
                        <Plus size={13} strokeWidth={3} /> Add new
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {savedAddresses.map((address) => (
                        <button
                          type="button"
                          key={address.id}
                          onClick={() => applyAddress(address)}
                          className={`text-left border-[3px] p-3 transition ${
                            selectedAddressId === address.id
                              ? "border-[#1F3D2B] bg-[#D98F00] shadow-[4px_4px_0_0_#1F3D2B]"
                              : "border-[#1F3D2B] bg-[#F5F1E8] hover:bg-[#D98F00]/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-display font-black text-lg text-[#1F3D2B]">{address.label}</div>
                            <span className="border-2 border-[#1F3D2B] px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#1F3D2B]">
                              {address.source || "Saved"}
                            </span>
                          </div>
                          <div className="mt-1 text-xs font-bold text-[#1F3D2B]/78 line-clamp-2">{address.address}</div>
                          <div className="mt-1 text-xs text-[#1F3D2B]/70">{address.city} - {address.pincode}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
                  <Field label="Save As" error={fieldErrors.label} span={1}>
                    <input
                      value={form.label}
                      onChange={(event) => updateField("label", event.target.value)}
                      className="touch-target-sm w-full border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2 font-bold text-sm focus:outline-none focus:bg-[#D98F00]"
                      placeholder="Home"
                    />
                  </Field>
                  <Field label="Full Name" error={fieldErrors.name} span={1}>
                    <input
                      data-testid="field-name"
                      value={form.name}
                      onChange={(event) => updateField("name", event.target.value)}
                      className="touch-target-sm w-full border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2 font-bold text-sm focus:outline-none focus:bg-[#D98F00]"
                    />
                  </Field>
                  <Field label="Email" error={fieldErrors.email} span={1}>
                    <input
                      data-testid="field-email"
                      type="email"
                      value={form.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      className="touch-target-sm w-full border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2 font-bold text-sm focus:outline-none focus:bg-[#D98F00]"
                    />
                  </Field>
                  <Field label="Phone" error={fieldErrors.phone} span={1}>
                    <input
                      data-testid="field-phone"
                      inputMode="tel"
                      value={form.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      className="touch-target-sm w-full border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2 font-bold text-sm focus:outline-none focus:bg-[#D98F00]"
                    />
                  </Field>
                  <Field label="Address" error={fieldErrors.address} span={2}>
                    <textarea
                      data-testid="field-address"
                      value={form.address}
                      onChange={(event) => updateField("address", event.target.value)}
                      className="min-h-[92px] w-full resize-none border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2 font-bold text-sm focus:outline-none focus:bg-[#D98F00]"
                      placeholder="House number, street, area"
                    />
                  </Field>
                  <Field label="Landmark" span={2}>
                    <input
                      value={form.landmark}
                      onChange={(event) => updateField("landmark", event.target.value)}
                      className="touch-target-sm w-full border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2 font-bold text-sm focus:outline-none focus:bg-[#D98F00]"
                      placeholder="Optional"
                    />
                  </Field>
                  <Field label="City" error={fieldErrors.city} span={1}>
                    <input
                      data-testid="field-city"
                      value={form.city}
                      onChange={(event) => updateField("city", event.target.value)}
                      className="touch-target-sm w-full border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2 font-bold text-sm focus:outline-none focus:bg-[#D98F00]"
                    />
                  </Field>
                  <Field label="Pincode" error={fieldErrors.pincode} span={1}>
                    <input
                      data-testid="field-pincode"
                      inputMode="numeric"
                      maxLength={6}
                      value={form.pincode}
                      onChange={(event) => updateField("pincode", event.target.value.replace(/\D/g, ""))}
                      className="touch-target-sm w-full border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2 font-bold text-sm focus:outline-none focus:bg-[#D98F00]"
                    />
                  </Field>
                </div>

                <label className="mt-4 flex cursor-pointer items-start gap-3 border-2 border-[#1F3D2B] bg-[#D98F00]/20 px-3 py-3 text-sm font-bold text-[#1F3D2B]">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(event) => setSaveAddress(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#1F3D2B]"
                  />
                  <span>Save this address for future checkouts</span>
                </label>
              </motion.section>
            )}

            {step === 2 && (
              <motion.section
                key="delivery"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                className="space-y-4"
              >
                {deliveryOptions.map((option) => {
                  const selected = delivery === option.id;
                  return (
                    <button
                      key={option.id}
                      data-testid={`ship-${option.id}`}
                      type="button"
                      onClick={() => setDelivery(option.id)}
                      className={`w-full text-left p-5 border-[3px] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition ${
                        selected
                          ? "bg-[#D98F00] border-[#1F3D2B] shadow-[6px_6px_0_0_#1F3D2B]"
                          : "bg-[#F5F1E8] border-[#1F3D2B] hover:bg-[#D98F00]/25"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-1 flex h-9 w-9 items-center justify-center border-2 border-[#1F3D2B] ${selected ? "bg-[#1F3D2B] text-[#D98F00]" : "bg-[#F5F1E8] text-[#1F3D2B]"}`}>
                          {selected ? <Check size={17} strokeWidth={3} /> : <Truck size={17} strokeWidth={3} />}
                        </span>
                        <span>
                          <span className="block font-display font-black text-2xl text-[#1F3D2B]">{option.title}</span>
                          <span className="block text-sm font-bold text-[#1F3D2B]/78">{option.desc}</span>
                          <span className="mt-1 inline-flex items-center gap-1 text-xs font-black uppercase tracking-[0.14em] text-[#1F3D2B]">
                            <Clock3 size={13} strokeWidth={3} /> {option.eta}
                          </span>
                        </span>
                      </div>
                      <span className="font-display font-black text-3xl text-[#1F3D2B]">
                        {option.price === 0 ? "FREE" : formatMoney(option.price)}
                      </span>
                    </button>
                  );
                })}
              </motion.section>
            )}

            {step === 3 && (
              <motion.section
                key="payment"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-4 sm:p-6 brutal-shadow"
              >
                <div className="text-xs font-black uppercase tracking-[0.26em] text-[#B8431A]">Payment</div>
                <h2 className="font-display font-black text-2xl sm:text-3xl text-[#1F3D2B]">Choose how to pay</h2>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const selected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`text-left border-[3px] p-4 transition ${
                          selected
                            ? "border-[#1F3D2B] bg-[#D98F00] shadow-[5px_5px_0_0_#1F3D2B]"
                            : "border-[#1F3D2B] bg-[#F5F1E8] hover:bg-[#D98F00]/25"
                        }`}
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span className="flex items-start gap-3">
                            <span className={`flex h-10 w-10 items-center justify-center border-2 border-[#1F3D2B] ${selected ? "bg-[#1F3D2B] text-[#D98F00]" : "bg-[#F5F1E8] text-[#1F3D2B]"}`}>
                              <Icon size={18} strokeWidth={3} />
                            </span>
                            <span>
                              <span className="block font-display font-black text-xl text-[#1F3D2B]">{method.title}</span>
                              <span className="block text-xs font-bold text-[#1F3D2B]/72">{method.desc}</span>
                            </span>
                          </span>
                          {selected && <Check size={18} strokeWidth={3} className="text-[#1F3D2B]" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 border-2 border-[#1F3D2B] bg-[#D98F00]/30 p-3 text-xs font-bold text-[#1F3D2B]">
                  Razorpay opens a secure test checkout window. COD orders stay pending until delivery.
                </div>
              </motion.section>
            )}

            {step === 4 && (
              <motion.section
                key="review"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-4 sm:p-6 brutal-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.26em] text-[#B8431A]">Final check</div>
                    <h2 className="font-display font-black text-2xl sm:text-3xl text-[#1F3D2B]">Review your order</h2>
                  </div>
                  <div className="hidden sm:flex h-12 w-12 items-center justify-center border-[3px] border-[#1F3D2B] bg-[#D98F00] text-[#1F3D2B]">
                    <ReceiptText size={24} strokeWidth={3} />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <ReviewBlock icon={MapPin} label="Address" action={() => setStep(1)}>
                    <b>{form.name}</b>
                    <span>{form.address}</span>
                    {form.landmark && <span>{form.landmark}</span>}
                    <span>{form.city} - {form.pincode}</span>
                  </ReviewBlock>
                  <ReviewBlock icon={Truck} label="Delivery" action={() => setStep(2)}>
                    <b className="capitalize">{delivery}</b>
                    <span>{deliveryOptions.find((option) => option.id === delivery)?.eta}</span>
                    <span>{shipping === 0 ? "Free shipping" : formatMoney(shipping)}</span>
                  </ReviewBlock>
                  <ReviewBlock icon={CreditCard} label="Payment" action={() => setStep(3)}>
                    <b>{paymentLabel(paymentMethod)}</b>
                    <span>{paymentMethod === "cod" ? "Payment due on delivery" : total < 1 ? "Covered by discounts or credit" : "Razorpay signature verified before order placement"}</span>
                    <span>Total: {formatMoney(total)}</span>
                  </ReviewBlock>
                </div>

                {payError && (
                  <div className="mt-5 border-2 border-[#B8431A] bg-[#B8431A]/10 px-3 py-2 text-sm font-bold text-[#B8431A]">
                    {payError}
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1}
              className="touch-target inline-flex items-center justify-center gap-2 border-[3px] border-[#1F3D2B] px-4 sm:px-6 py-3 font-black uppercase tracking-[0.14em] bg-[#F5F1E8] disabled:opacity-40 text-xs sm:text-sm"
            >
              <ArrowLeft size={15} strokeWidth={3} /> Back
            </button>
            {step < 4 ? (
              <button
                data-testid="next-step"
                type="button"
                onClick={goNext}
                className="touch-target inline-flex items-center justify-center gap-2 bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-6 sm:px-8 py-3 font-black uppercase tracking-[0.14em] hover:bg-[#B8431A] hover:border-[#B8431A] text-xs sm:text-sm"
              >
                Continue <ArrowRight size={15} strokeWidth={3} />
              </button>
            ) : (
              <button
                data-testid="place-order-btn"
                type="button"
                disabled={busy}
                onClick={pay}
                className="touch-target inline-flex items-center justify-center gap-2 bg-[#D98F00] text-[#1F3D2B] border-[3px] border-[#1F3D2B] px-6 sm:px-8 py-3 font-black uppercase tracking-[0.14em] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#1F3D2B] transition-all disabled:opacity-60 text-xs sm:text-sm"
              >
                {busy ? "Processing" : paymentMethod === "razorpay" && total >= 1 ? "Pay and place order" : "Place order"} <CheckCircle2 size={16} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4 mt-6 lg:mt-0">
          <div className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-4 sm:p-5 brutal-shadow sticky top-24">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.28em] text-[#1F3D2B]">Order Summary</div>
                <div className="mt-1 text-xs font-bold text-[#1F3D2B]/70">{items.length} item type{items.length === 1 ? "" : "s"}</div>
              </div>
              <div className="border-2 border-[#1F3D2B] bg-[#D98F00] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#1F3D2B]">
                Step {step}/4
              </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-auto mt-4 pr-1">
              {items.map((item) => (
                <div key={item.key} className="flex gap-3">
                  <div className="h-14 w-14 flex-shrink-0 border-2 border-[#1F3D2B]" style={{ background: item.bg }}>
                    <img src={item.image} alt="" className="h-full w-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-[#1F3D2B]">{item.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-[#1F3D2B]/70">
                      {item.size} x {item.qty}
                    </div>
                  </div>
                  <div className="font-black text-[#1F3D2B]">{formatMoney(item.price * item.qty)}</div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-[#1F3D2B]/30 mt-4 pt-4 space-y-2 text-sm">
              <TotalLine label="Subtotal" value={formatMoney(subtotal)} />
              <TotalLine label="Shipping" value={shipping === 0 ? "FREE" : formatMoney(shipping)} />
              {discount > 0 && <TotalLine label={`Coupon (${couponApplied.code})`} value={`- ${formatMoney(discount)}`} tone="save" />}
              {creditUsed > 0 && <TotalLine label="Store Credit" value={`- ${formatMoney(creditUsed)}`} tone="save" />}
            </div>

            {user && creditBalance > 0 && (
              <div className="mt-3 border-t-2 border-[#1F3D2B]/30 pt-3">
                <label className="flex cursor-pointer select-none items-start gap-3">
                  <input
                    data-testid="use-credit"
                    type="checkbox"
                    checked={useCredit}
                    onChange={(event) => setUseCredit(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#1F3D2B]"
                  />
                  <div>
                    <div className="font-display font-black text-sm text-[#1F3D2B]">Use {formatMoney(creditBalance)} store credit</div>
                    <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1F3D2B]/60">Applies before payment</div>
                  </div>
                </label>
              </div>
            )}

            <div className="mt-3 border-t-2 border-[#1F3D2B]/30 pt-3">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1F3D2B] mb-2">Coupon / Referral Code</div>
              {couponApplied ? (
                <div className="flex items-center justify-between border-2 border-[#1F3D2B] bg-[#D98F00]/40 px-3 py-2">
                  <div className="text-sm font-black uppercase tracking-wider text-[#1F3D2B]">
                    {couponApplied.code} - {formatMoney(couponApplied.discount)} off
                  </div>
                  <button type="button" onClick={clearCoupon} className="text-xs font-black uppercase text-[#B8431A]">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    data-testid="coupon-input"
                    value={coupon}
                    onChange={(event) => setCoupon(event.target.value.toUpperCase())}
                    placeholder="LAXMI100"
                    className="min-w-0 flex-1 border-2 border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2 font-mono font-bold text-sm focus:outline-none"
                  />
                  <button
                    data-testid="apply-coupon"
                    type="button"
                    onClick={applyCoupon}
                    className="bg-[#1F3D2B] text-[#F5F1E8] border-2 border-[#1F3D2B] px-4 font-black uppercase text-xs tracking-widest"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponMsg && <div className={`text-xs mt-1.5 font-bold ${couponApplied ? "text-[#1F3D2B]" : "text-[#B8431A]"}`}>{couponMsg}</div>}
            </div>

            <div className="mt-4 flex items-end justify-between border-t-[3px] border-[#1F3D2B] pt-4">
              <div className="text-xs font-black uppercase tracking-[0.3em] text-[#1F3D2B]">Total</div>
              <div data-testid="checkout-total" className="font-display font-black text-3xl text-[#1F3D2B]">
                {formatMoney(total)}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, error, span = 1, children }) {
  return (
    <label className={`block ${span === 2 ? "col-span-2" : "col-span-2 sm:col-span-1"}`}>
      <div className="mb-1 text-[10px] sm:text-xs font-black uppercase tracking-[0.24em] text-[#1F3D2B]">{label}</div>
      {children}
      {error && <div className="mt-1 text-xs font-bold text-[#B8431A]">{error}</div>}
    </label>
  );
}

function ReviewBlock({ icon: Icon, label, action, children }) {
  return (
    <div className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#1F3D2B]/75">
          <Icon size={14} strokeWidth={3} /> {label}
        </div>
        <button type="button" onClick={action} className="text-[10px] font-black uppercase tracking-[0.14em] text-[#B8431A]">
          Edit
        </button>
      </div>
      <div className="space-y-1 text-xs font-bold text-[#1F3D2B]/78 [&_b]:block [&_b]:text-sm [&_b]:text-[#1F3D2B] [&_span]:block">
        {children}
      </div>
    </div>
  );
}

function ReceiptStat({ label, value, mono = false }) {
  return (
    <div className="border-2 border-[#1F3D2B] bg-[#F5F1E8] px-3 py-3">
      <div className={`truncate font-display font-black text-lg text-[#1F3D2B] ${mono ? "font-mono tracking-tight" : ""}`}>{value}</div>
      <div className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#1F3D2B]/70">{label}</div>
    </div>
  );
}

function TotalLine({ label, value, tone }) {
  return (
    <div className={`flex justify-between gap-3 ${tone === "save" ? "text-[#B8431A]" : ""}`}>
      <span>{label}</span>
      <span className="font-bold text-right">{value}</span>
    </div>
  );
}
