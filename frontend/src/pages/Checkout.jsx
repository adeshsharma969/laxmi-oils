import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Loader2,
  LocateFixed,
  MapPin,
  PackageCheck,
  Plus,
  RotateCcw,
  ShieldCheck,
  Share2,
  ShoppingBag,
  Trash2,
  WalletCards,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api, { fmtErr } from "../api/client";
import { deliveryDateRange, deliveryPromise, writeDeliveryPincode } from "../lib/delivery";
import { downloadInvoice, formatMoney, paymentLabel } from "../lib/invoice";

const STORAGE_PROFILE = "laxmi_checkout_profile";
const STORAGE_ADDRESSES = "laxmi_saved_addresses";
const STORAGE_CHECKOUT_DRAFT = "laxmi_checkout_draft";

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
  { id: 1, label: "Address & Delivery" },
  { id: 2, label: "Payment & Review" },
];

const paymentMethods = [
  {
    id: "razorpay",
    title: "UPI / Card",
    desc: "Pay securely with Razorpay",
    icon: WalletCards,
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
const getCheckoutDraft = () => readJson(STORAGE_CHECKOUT_DRAFT, {});

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

const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

export default function Checkout() {
  const cart = useCart();
  const auth = useAuth();
  const nav = useNavigate();
  const user = auth?.user;
  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const clearCart = cart?.clear || (() => {});
  const addItem = cart?.addItem || (() => {});
  const checkoutDraft = useMemo(() => getCheckoutDraft(), []);

  const [step, setStep] = useState(() => Math.min(checkoutDraft.step || 1, 2));
  const [form, setForm] = useState(() => ({ ...getStoredProfile(), ...(checkoutDraft.form || {}) }));
  const [fieldErrors, setFieldErrors] = useState({});
  const [savedAddresses, setSavedAddresses] = useState(() => getStoredAddresses());
  const [selectedAddressId, setSelectedAddressId] = useState(() => checkoutDraft.selectedAddressId || "");
  const [saveAddress, setSaveAddress] = useState(() => checkoutDraft.saveAddress ?? true);
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationMsg, setLocationMsg] = useState("");
  const [delivery] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState(() => checkoutDraft.paymentMethod || "razorpay");
  const [success, setSuccess] = useState(null);
  const [busy, setBusy] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [paymentTip, setPaymentTip] = useState("");
  const [coupon, setCoupon] = useState(() => checkoutDraft.coupon || "");
  const [couponApplied, setCouponApplied] = useState(() => checkoutDraft.couponApplied || null);
  const [couponMsg, setCouponMsg] = useState("");
  const [useCredit, setUseCredit] = useState(() => checkoutDraft.useCredit || false);
  const [payError, setPayError] = useState("");
  const [paymentFailure, setPaymentFailure] = useState(null);
  const [saveCartForLater, setSaveCartForLater] = useState(false);

  const creditBalance = Math.max(0, Math.floor(user?.rewards_earned || 0));
  const shipping = 49;
  const discount = couponApplied?.discount || 0;
  const afterDiscount = Math.max(0, subtotal + shipping - discount);
  const creditUsed = useCredit ? Math.min(creditBalance, afterDiscount) : 0;
  const total = Math.max(0, afterDiscount - creditUsed);
  const requiresOnlinePayment = paymentMethod === "razorpay" && total >= 1;
  const finalCtaLabel = !user ? "Login to continue" : requiresOnlinePayment ? "Pay and place order" : "Place order";
  const paymentTips = [
    "Securing your payment details...",
    "Connecting to payment gateway...",
    "Preparing your order...",
    "Almost there...",
  ];
  const primaryLabel = step < 2 ? "Continue" : finalCtaLabel;

  const deliveryOptions = useMemo(
    () => [
      {
        id: "standard",
        title: "Standard Delivery",
        desc: "Reliable delivery to your doorstep",
        price: 49,
        eta: deliveryWindow(4, 6),
      },
    ],
    [],
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
    writeJson(STORAGE_CHECKOUT_DRAFT, {
      step,
      form,
      selectedAddressId,
      saveAddress,
      delivery,
      paymentMethod,
      coupon,
      couponApplied,
      useCredit,
    });
  }, [step, form, selectedAddressId, saveAddress, delivery, paymentMethod, coupon, couponApplied, useCredit]);

  useEffect(() => {
    if (/^\d{6}$/.test(clean(form.pincode))) writeDeliveryPincode(form.pincode);
  }, [form.pincode]);

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
    setStep((current) => Math.min(2, current + 1));
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
    setPaymentLoading(true);
    setPaymentProgress(0);
    setPaymentTip(paymentTips[0]);
    
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setPaymentProgress(prev => {
        const next = prev + 25;
        if (next <= 75) {
          setPaymentTip(paymentTips[Math.floor(next / 25)]);
        }
        return next;
      });
    }, 800);

    try {
      setPaymentTip("Initializing payment gateway...");
      await loadRazorpayCheckout();
      
      setPaymentProgress(50);
      setPaymentTip("Creating your order...");
      
      const amountPaise = Math.round(total * 100);
      if (amountPaise < 100) return null;

      const { data: order } = await api.post("/create-order", {
        amount: amountPaise,
        currency: "INR",
        receipt: `laxmi_${Date.now()}`,
      });

      if (!razorpayKeyId) {
        throw new Error("Razorpay key is missing. Set NEXT_PUBLIC_RAZORPAY_KEY_ID in the frontend environment.");
      }

      setPaymentProgress(75);
      setPaymentTip("Opening secure payment window...");
      
      clearInterval(progressInterval);
      setPaymentProgress(100);
      setPaymentLoading(false);

      return new Promise((resolve, reject) => {
        let settled = false;
        const finish = (fn, value) => {
          if (settled) return;
          settled = true;
          setPaymentLoading(false);
          setPaymentProgress(0);
          fn(value);
        };

        const razorpay = new window.Razorpay({
          key: razorpayKeyId,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "Laxmi Edible Oils",
          description: `Order payment for ${items.length} item${items.length > 1 ? 's' : ''}`,
          order_id: order.order_id,
          image: "/logo.png", // Will use your logo
          prefill: {
            name: clean(form.name),
            email: clean(form.email),
            contact: clean(form.phone),
          },
          notes: {
            customer_address: clean(form.address),
            city: clean(form.city),
            pincode: clean(form.pincode),
            order_items: items.map(item => `${item.name} (${item.size}) x ${item.qty}`).join(', '),
            total_amount: `₹${total}`,
          },
          theme: {
            color: "#D98F00", // Laxmi Oils brand color
            backdrop_color: "#F5F1E8", // Background color
            hide_topbar: false,
          },
          config: {
            display: {
              blocks: {
                banks: {
                  name: 'Pay via NetBanking',
                  instruments: [
                    {
                      method: 'netbanking',
                      banks: [
                        'HDFC',
                        'ICICI',
                        'SBI',
                        'AXIS',
                        'KOTAK'
                      ]
                    },
                  ],
                },
                upi: {
                  name: 'Pay via UPI',
                  instruments: [
                    {
                      method: 'upi',
                      apps: [
                        'gpay',
                        'phonepe',
                        'paytm',
                        'amazonpay'
                      ]
                    },
                  ],
                },
                wallet: {
                  name: 'Pay via Wallet',
                  instruments: [
                    {
                      method: 'wallet',
                      wallets: [
                        'paytm',
                        'phonepe',
                        'amazonpay',
                        'airtelmoney'
                      ]
                    },
                  ],
                },
                card: {
                  name: 'Pay via Debit/Credit Card',
                  instruments: [
                    {
                      method: 'card',
                      card_networks: [
                        'Visa',
                        'Mastercard',
                        'Maestro',
                        'RuPay'
                      ]
                    },
                  ],
                },
              },
              sequence: ['block.upi', 'block.card', 'block.netbanking', 'block.wallet'],
              preferences: {
                show_default_blocks: true,
              },
            },
          },
          modal: {
            ondismiss: () => {
              const error = new Error("Payment was cancelled.");
              error.code = "CANCELLED";
              finish(reject, error);
            },
            escape: true,
            backdropclose: true,
            animation: 'slide',
            height: '70%',
            width: '100%',
          },
          handler: async (response) => {
            try {
              setPaymentTip("Verifying your payment...");
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

        razorpay.on('payment.failed', (response) => {
          const error = new Error(response?.error?.description || "Payment failed. Please try another method.");
          error.code = response?.error?.code || "PAYMENT_FAILED";
          error.source = "razorpay";
          finish(reject, error);
        });

        razorpay.open();
      });
    } catch (error) {
      clearInterval(progressInterval);
      setPaymentLoading(false);
      setPaymentProgress(0);
      throw error;
    }
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

    if (!user) {
      setPayError("Login or create an account to complete your order.");
      nav("/login", { state: { from: "/checkout", checkoutIntent: true } });
      return;
    }

    setBusy(true);
    setPayError("");
    setPaymentFailure(null);

    try {
      const razorpayPayment = paymentMethod === "razorpay" ? await collectRazorpayPayment() : null;
      const resolvedPaymentMethod = paymentMethod === "razorpay" && !razorpayPayment ? "store_credit" : paymentMethod;
      const payload = {
        items: items.map((item) => ({
          product_id: item.id,
          size: item.size,
          qty: item.qty,
          price: item.price,
        })),
        shipping,
        subtotal,
        discount: discount || 0,
        total,
        coupon: couponApplied?.code || null,
        use_credit: useCredit,
        payment: resolvedPaymentMethod,
        address: {
          label: form.label,
          name: clean(form.name),
          email: clean(form.email),
          phone: clean(form.phone),
          address: clean(form.address),
          landmark: clean(form.landmark),
          city: clean(form.city),
          pincode: clean(form.pincode),
          location_url: form.locationUrl,
        },
        razorpay_payment_id: razorpayPayment?.razorpay_payment_id,
        razorpay_order_id: razorpayPayment?.razorpay_order_id,
        save_address: saveAddress,
      };

      const { data } = await api.post("/orders", payload);
      setSuccess(data);
      clearCart();
      localStorage.removeItem(STORAGE_CHECKOUT_DRAFT);
    } catch (err) {
      console.error("Checkout error:", err);
      
      // Handle different types of payment failures
      if (err.code === "CANCELLED") {
        setPaymentFailure({
          type: "cancelled",
          message: "Payment was cancelled. You can try again whenever you're ready.",
          canRetry: true,
          saveCartOption: true,
        });
      } else if (err.source === "razorpay" || err.code === "PAYMENT_FAILED") {
        setPaymentFailure({
          type: "payment_failed",
          message: err.message || "Payment failed. Please check your payment details and try again.",
          canRetry: true,
          saveCartOption: true,
          alternatives: [
            "Try a different payment method",
            "Check your card details and balance",
            "Use UPI for faster payment",
          ],
        });
      } else {
        setPaymentFailure({
          type: "network_error",
          message: "Network error occurred. Please check your connection and try again.",
          canRetry: true,
          saveCartOption: true,
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRetry = () => {
    setPaymentFailure(null);
    setPayError("");
    pay();
  };

  const handleSaveCartForLater = () => {
    // Save current cart and form data to localStorage
    const checkoutData = {
      items,
      form,
      coupon,
      couponApplied,
      useCredit,
      paymentMethod,
      saveAddress,
      timestamp: Date.now(),
    };
    localStorage.setItem("laxmi_saved_cart", JSON.stringify(checkoutData));
    setSaveCartForLater(true);
    setPaymentFailure(null);
  };

  const handleClearCart = () => {
    clearCart();
    localStorage.removeItem("laxmi_saved_cart");
    setPaymentFailure(null);
    nav("/products");
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

  // Payment Failure UI
  if (paymentFailure) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="px-4 sm:px-5 md:px-10 py-8 md:py-14"
      >
        <div className="mx-auto max-w-lg">
          <div className="border-[3px] border-[#B8431A] bg-white p-6 sm:p-8 brutal-shadow-lg">
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mb-6 inline-flex items-center justify-center h-16 w-16 border-[3px] border-[#B8431A] bg-[#B8431A]/10 rounded-full"
            >
              <X size={32} strokeWidth={3} className="text-[#B8431A]" />
            </motion.div>

            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#1F3D2B] mb-3">
              {paymentFailure.type === 'cancelled' ? 'Payment Cancelled' : 
               paymentFailure.type === 'payment_failed' ? 'Payment Failed' : 
               'Something Went Wrong'}
            </h2>
            
            <p className="text-sm font-bold text-[#1F3D2B]/70 mb-6">
              {paymentFailure.message}
            </p>

            {/* Alternative Suggestions */}
            {paymentFailure.alternatives && (
              <div className="mb-6 p-4 border-2 border-[#1F3D2B]/20 bg-[#F5F1E8]/50">
                <div className="text-xs font-black uppercase tracking-[0.12em] text-[#1F3D2B]/70 mb-2">
                  Try these alternatives:
                </div>
                <ul className="space-y-1">
                  {paymentFailure.alternatives.map((alt, index) => (
                    <li key={index} className="text-xs font-bold text-[#1F3D2B]/60 flex items-start gap-2">
                      <span className="text-[#D98F00] mt-0.5">•</span>
                      {alt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {paymentFailure.canRetry && (
                <button
                  onClick={handleRetry}
                  className="w-full touch-target inline-flex items-center justify-center gap-2 bg-[#D98F00] text-[#1F3D2B] border-[3px] border-[#1F3D2B] px-4 py-3 font-black uppercase tracking-[0.14em] hover:bg-[#1F3D2B] hover:text-[#F5F1E8] transition-colors"
                >
                  <RotateCcw size={16} strokeWidth={3} /> Try Again
                </button>
              )}

              {paymentFailure.saveCartOption && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleSaveCartForLater}
                    className="touch-target inline-flex items-center justify-center gap-2 border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#1F3D2B] hover:bg-[#D98F00] transition-colors"
                  >
                    <Bookmark size={14} strokeWidth={3} /> Save Cart
                  </button>
                  <button
                    onClick={handleClearCart}
                    className="touch-target inline-flex items-center justify-center gap-2 border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#1F3D2B] hover:bg-[#B8431A]/20 transition-colors"
                  >
                    <Trash2 size={14} strokeWidth={3} /> Clear Cart
                  </button>
                </div>
              )}

              <Link
                to="/products"
                className="block text-center text-xs font-black uppercase tracking-[0.14em] text-[#B8431A] hover:text-[#1F3D2B] transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Save Cart Confirmation
  if (saveCartForLater) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="px-4 sm:px-5 md:px-10 py-8 md:py-14"
      >
        <div className="mx-auto max-w-md text-center">
          <div className="border-[3px] border-[#1F3D2B] bg-[#D98F00] p-6 sm:p-8 brutal-shadow-lg">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mb-4 inline-flex items-center justify-center h-14 w-14 border-[3px] border-[#1F3D2B] bg-[#1F3D2B] text-[#D98F00] rounded-full"
            >
              <Bookmark size={28} strokeWidth={3} />
            </motion.div>
            
            <h2 className="font-display font-black text-2xl text-[#1F3D2B] mb-3">
              Cart Saved!
            </h2>
            
            <p className="text-sm font-bold text-[#1F3D2B]/80 mb-6">
              Your cart and checkout details have been saved. You can complete your order later.
            </p>

            <div className="space-y-3">
              <Link
                to="/products"
                className="block touch-target bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-4 py-3 font-black uppercase tracking-[0.14em] hover:bg-[#B8431A] hover:border-[#B8431A] transition-colors"
              >
                Continue Shopping
              </Link>
              
              <button
                onClick={() => {
                  setSaveCartForLater(false);
                  setPaymentFailure(null);
                }}
                className="block w-full touch-target border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#1F3D2B] hover:bg-[#D98F00] transition-colors"
              >
                Try Payment Again
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (success) {
    const paid = success.payment_status === "paid";
    const activeTimeline = activeTimelineIndex(success.status);
    const supportText = `Hi Laxmi Edible Oils, I need help with order ${success.order_id}`;
    const reorder = () => {
      (success.items || []).forEach((item) => addItem(item));
    };

    // Share functionality
    const shareOrder = async () => {
      const shareText = `I just ordered from Laxmi Edible Oils! Order #${success.order_id} for ${formatMoney(success.total)}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Laxmi Edible Oils Order',
            text: shareText,
            url: window.location.origin,
          });
        } catch (err) {
          console.log('Share cancelled');
        }
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText);
        alert('Order details copied to clipboard!');
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        data-testid="checkout-success"
        className="px-4 sm:px-5 md:px-10 py-8 md:py-14"
      >
        {/* Elegant Celebration Animation */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Golden Particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: -20,
                opacity: 0,
                scale: 0
              }}
              animate={{ 
                y: window.innerHeight + 20,
                opacity: [0, 1, 1, 0],
                scale: [0, 1, 1, 0.5],
                rotate: Math.random() * 360
              }}
              transition={{ 
                duration: 4 + Math.random() * 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                repeatDelay: Math.random() * 4,
                ease: "easeOut"
              }}
              className="absolute"
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{
                  background: i % 3 === 0 ? '#D98F00' : i % 3 === 1 ? '#1F3D2B' : '#F5F1E8',
                  boxShadow: '0 0 6px rgba(217, 143, 0, 0.5)'
                }}
              />
            </motion.div>
          ))}
          
          {/* Floating Oil Drops */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`drop-${i}`}
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: -30,
                opacity: 0
              }}
              animate={{ 
                y: window.innerHeight + 30,
                opacity: [0, 0.8, 0.8, 0],
                x: Math.random() * 100 - 50
              }}
              transition={{ 
                duration: 5 + Math.random() * 3,
                delay: Math.random() * 1.5,
                repeat: Infinity,
                repeatDelay: Math.random() * 5,
                ease: "linear"
              }}
              className="absolute"
            >
              <div className="relative">
                <div 
                  className="w-4 h-6 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #D98F00, #B8431A)',
                    boxShadow: '0 2px 8px rgba(217, 143, 0, 0.3)'
                  }}
                />
                <div 
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full"
                  style={{
                    background: '#D98F00',
                    opacity: 0.6
                  }}
                />
              </div>
            </motion.div>
          ))}
          
          {/* Golden Light Rays */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`ray-${i}`}
              initial={{ 
                x: window.innerWidth / 2,
                y: window.innerHeight / 2,
                opacity: 0,
                scale: 0,
                rotate: i * 60
              }}
              animate={{ 
                opacity: [0, 0.3, 0],
                scale: [0, 3, 6],
                rotate: i * 60 + 180
              }}
              transition={{ 
                duration: 3,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeOut"
              }}
              className="absolute"
            >
              <div 
                className="w-1 h-32 origin-top"
                style={{
                  background: 'linear-gradient(to bottom, transparent, #D98F00, transparent)',
                  transform: 'translateX(-50%)'
                }}
              />
            </motion.div>
          ))}
        </div>

        <div className="mx-auto max-w-2xl">
          {/* Main Success Card */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
            className="border-[3px] border-[#1F3D2B] bg-[#D98F00] p-6 sm:p-8 brutal-shadow-lg text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="mb-6 inline-flex items-center justify-center h-20 w-20 border-[3px] border-[#1F3D2B] bg-[#1F3D2B] text-[#D98F00] rounded-full"
            >
              <CheckCircle2 size={40} strokeWidth={3} />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-sm font-black uppercase tracking-[0.26em] text-[#1F3D2B] mb-2">Order Confirmed!</div>
              <h1 className="font-display font-black text-4xl sm:text-5xl text-[#1F3D2B] tracking-tighter mb-3">
                Thank You!
              </h1>
              <p className="max-w-lg mx-auto text-base font-bold text-[#1F3D2B]/80">
                Your order #{success.order_id} has been {paid ? "paid and" : ""} confirmed. We're preparing your pure, lab-tested oils for delivery.
              </p>
            </motion.div>
          </motion.div>

          {/* Order Stats */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            <ReceiptStat label="Order ID" value={success.order_id} mono />
            <ReceiptStat label="Total" value={formatMoney(success.total)} />
            <ReceiptStat label="Items" value={`${success.items?.length || 0} types`} />
            <ReceiptStat label="Payment" value={paymentLabel(success.payment_method)} />
          </motion.div>

          {/* Delivery Timeline */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-6 border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-6 brutal-shadow"
          >
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-[#B8431A] mb-4">
              <Truck size={16} strokeWidth={3} />
              Estimated Delivery Timeline
            </div>
            <div className="space-y-3">
              {[
                { label: "Order Confirmed", time: "Just now", done: true },
                { label: "Processing", time: "Today", done: false },
                { label: "Shipped", time: "Tomorrow", done: false },
                { label: "Delivered", time: "4-6 days", done: false },
              ].map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-8 h-8 border-2 border-[#1F3D2B] flex items-center justify-center flex-shrink-0 ${
                    step.done ? 'bg-[#D98F00]' : 'bg-[#F5F1E8]'
                  }`}>
                    {step.done ? <Check size={12} strokeWidth={3} /> : <span className="text-xs font-black">{index + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <div className={`font-black text-sm ${step.done ? 'text-[#1F3D2B]' : 'text-[#1F3D2B]/60'}`}>
                      {step.label}
                    </div>
                    <div className="text-xs font-bold text-[#1F3D2B]/50">{step.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-6 flex flex-col sm:flex-row gap-3"
          >
            <button
              data-testid="download-invoice"
              onClick={() => downloadInvoice(success)}
              className="touch-target flex-1 inline-flex items-center justify-center gap-2 bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-4 py-3 font-black uppercase tracking-[0.14em] text-sm hover:bg-[#B8431A] hover:border-[#B8431A] transition-colors"
            >
              <Download size={16} strokeWidth={3} /> Download Invoice
            </button>
            
            <button
              onClick={shareOrder}
              className="touch-target flex-1 inline-flex items-center justify-center gap-2 border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#1F3D2B] hover:bg-[#D98F00] transition-colors"
            >
              <Share2 size={16} strokeWidth={3} /> Share Order
            </button>
            
            {user && (
              <Link
                to="/account"
                className="touch-target flex-1 inline-flex items-center justify-center gap-2 border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-[#1F3D2B] hover:bg-[#D98F00] transition-colors"
              >
                <PackageCheck size={16} strokeWidth={3} /> Track Order
              </Link>
            )}
          </motion.div>

          {/* Continue Shopping */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-4 text-center"
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#B8431A] hover:text-[#1F3D2B] transition-colors"
            >
              <ShoppingBag size={16} strokeWidth={3} /> Continue Shopping
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div data-testid="checkout-page" className="px-3 sm:px-5 md:px-10 py-4 md:py-10 pb-32 md:pb-10">
      <div className="border-b-[3px] border-[#1F3D2B] pb-3 md:pb-4 mb-4 md:mb-6 flex items-end justify-between gap-3">
        <div>
          <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#B8431A]">Secure checkout</div>
          <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-[#1F3D2B] tracking-tighter">Checkout.</h1>
        </div>
        <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.14em] text-[#1F3D2B]/70">
          Step {step}/2
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5 md:gap-6">
        <div className="col-span-12 lg:col-span-8">
          <div className="grid grid-cols-2 mb-4 md:mb-5 border-[3px] border-[#1F3D2B]">
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
                  className={`p-2 sm:p-3 flex items-center justify-center sm:justify-start gap-2 ${
                    index < steps.length - 1 ? "border-r-[3px] border-[#1F3D2B]" : ""
                  } ${active ? "bg-[#D98F00]" : done ? "bg-[#1F3D2B] text-[#F5F1E8]" : "bg-[#F5F1E8]"}`}
                >
                  <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                    {done && <Check size={12} strokeWidth={3} className="text-[#D98F00] mb-1" />}
                    <span className={`font-display font-black text-sm sm:text-base ${
                      active ? "text-[#1F3D2B]" : done ? "text-[#F5F1E8]" : "text-[#1F3D2B]/50"
                    }`}>
                      {item.id === 1 ? "Shipping" : "Billing"}
                    </span>
                    <span className="hidden sm:block text-[9px] font-black uppercase tracking-[0.16em] opacity-70 mt-1">
                      {item.label}
                    </span>
                  </div>
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
                className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-3 sm:p-5 brutal-shadow"
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

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
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

                <label className="mt-3 flex cursor-pointer items-start gap-3 border-2 border-[#1F3D2B] bg-[#D98F00]/20 px-3 py-2 text-sm font-bold text-[#1F3D2B]">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(event) => setSaveAddress(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#1F3D2B]"
                  />
                  <span>Save this address for future checkouts</span>
                </label>

                {/* Simple Delivery Info */}
                <div className="mt-3 border-t-2 border-[#1F3D2B]/20 pt-3">
                  <div className="flex items-center justify-between p-3 border-[3px] border-[#1F3D2B] bg-[#D98F00]/10">
                    <div>
                      <div className="font-display font-black text-sm text-[#1F3D2B]">Standard Delivery</div>
                      <div className="text-[9px] font-bold text-[#1F3D2B]/70">Reliable delivery to your doorstep</div>
                      <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.1em] text-[#1F3D2B]">
                        <Clock3 size={10} strokeWidth={3} /> {deliveryWindow(4, 6)}
                      </div>
                    </div>
                    <div className="font-display font-black text-sm text-[#1F3D2B]">₹49</div>
                  </div>
                </div>
              </motion.section>
            )}

            {step === 2 && (
              <motion.section
                key="payment-review"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                className="space-y-4"
              >
                {/* Compact Review Summary */}
                <div className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-2 sm:p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#1F3D2B]/70 mb-2">Delivering to</div>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs sm:text-sm text-[#1F3D2B]">
                    <span className="font-black">{form.name}</span>
                    <span className="text-[9px] text-[#1F3D2B]/70">{form.city} - {form.pincode}</span>
                    <span className="text-[9px] font-bold text-[#1F3D2B]/70 capitalize">{delivery} · {deliveryOptions.find((o) => o.id === delivery)?.eta}</span>
                    <button type="button" onClick={() => setStep(1)} className="text-[9px] font-black uppercase tracking-[0.14em] text-[#B8431A] ml-auto">Edit</button>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-2 sm:p-4">
                  <div className="text-[10px] sm:text-xs font-black uppercase tracking-[0.22em] text-[#B8431A] mb-2">Payment method</div>
                  <div className="grid grid-cols-1 gap-2">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      const selected = paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`text-left border-[3px] p-2 transition ${
                            selected
                              ? "border-[#1F3D2B] bg-[#D98F00] shadow-[4px_4px_0_0_#1F3D2B]"
                              : "border-[#1F3D2B] bg-[#F5F1E8] hover:bg-[#D98F00]/25"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`flex h-6 w-6 items-center justify-center border-2 border-[#1F3D2B] ${selected ? "bg-[#1F3D2B] text-[#D98F00]" : "bg-[#F5F1E8] text-[#1F3D2B]"}`}>
                              <Icon size={12} strokeWidth={3} />
                            </span>
                            <span>
                              <span className="block font-display font-black text-xs sm:text-sm text-[#1F3D2B]">{method.title}</span>
                              <span className="block text-[9px] font-bold text-[#1F3D2B]/70">{method.desc}</span>
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Login Prompt (if not logged in) */}
                {!user && (
                  <div className="border-[3px] border-[#1F3D2B] bg-white p-3 sm:p-4 shadow-[4px_4px_0_0_#D98F00]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#B8431A]">
                          <ShieldCheck size={14} strokeWidth={3} /> Account required
                        </div>
                        <p className="mt-1 text-xs font-bold text-[#1F3D2B]/75">
                          Sign in for payment, invoices, and delivery updates.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to="/login"
                          state={{ from: "/checkout", checkoutIntent: true }}
                          className="touch-target-sm inline-flex items-center justify-center border-[3px] border-[#1F3D2B] bg-[#1F3D2B] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#F5F1E8] hover:bg-[#B8431A] hover:border-[#B8431A]"
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          state={{ from: "/checkout", checkoutIntent: true }}
                          className="touch-target-sm inline-flex items-center justify-center border-[3px] border-[#1F3D2B] bg-[#F5F1E8] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#1F3D2B] hover:bg-[#D98F00]"
                        >
                          Register
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {payError && (
                  <div className="border-2 border-[#B8431A] bg-[#B8431A]/10 px-3 py-2 text-sm font-bold text-[#B8431A]">
                    {payError}
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>

          <div className="mt-4 flex flex-col-reverse gap-2 md:flex md:flex-row md:justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1}
              className="touch-target inline-flex items-center justify-center gap-2 border-[3px] border-[#1F3D2B] px-3 sm:px-6 py-2 font-black uppercase tracking-[0.14em] bg-[#F5F1E8] disabled:opacity-40 text-[10px] sm:text-xs"
            >
              <ArrowLeft size={12} strokeWidth={3} /> Back
            </button>
            {step < 2 ? (
              <button
                data-testid="next-step"
                type="button"
                onClick={goNext}
                className="touch-target inline-flex items-center justify-center gap-2 bg-[#1F3D2B] text-[#F5F1E8] border-[3px] border-[#1F3D2B] px-4 sm:px-8 py-2 font-black uppercase tracking-[0.14em] hover:bg-[#B8431A] hover:border-[#B8431A] text-[10px] sm:text-xs"
              >
                {primaryLabel} <ArrowRight size={12} strokeWidth={3} />
              </button>
            ) : (
              <button
                data-testid="place-order-btn"
                type="button"
                disabled={busy}
                onClick={pay}
                className="touch-target inline-flex items-center justify-center gap-2 bg-[#D98F00] text-[#1F3D2B] border-[3px] border-[#1F3D2B] px-4 sm:px-8 py-2 font-black uppercase tracking-[0.14em] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#1F3D2B] transition-all disabled:opacity-60 text-[10px] sm:text-xs"
              >
                {busy ? "Processing" : finalCtaLabel} <CheckCircle2 size={14} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4 mt-4 lg:mt-0">
          <div className="border-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-3 sm:p-5 brutal-shadow sticky top-24">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.28em] text-[#1F3D2B]">Order Summary</div>
                <div className="mt-1 text-xs font-bold text-[#1F3D2B]/70">{items.length} item type{items.length === 1 ? "" : "s"}</div>
              </div>
              <div className="border-2 border-[#1F3D2B] bg-[#D98F00] px-2 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#1F3D2B]">
                Step {step}/2
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

      <div className="fixed inset-x-0 bottom-0 z-40 border-t-[3px] border-[#1F3D2B] bg-[#F5F1E8] p-3 shadow-[0_-6px_0_0_rgba(31,61,43,0.12)] md:hidden">
        {payError && <div className="mb-2 border-2 border-[#B8431A] bg-[#B8431A]/10 px-3 py-2 text-xs font-bold text-[#B8431A]">{payError}</div>}
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1F3D2B]/70">Total</div>
            <div className="font-display text-2xl font-black text-[#1F3D2B]">{formatMoney(total)}</div>
          </div>
          <div className="max-w-[48%] text-right text-[10px] font-black uppercase tracking-[0.12em] text-[#1F3D2B]/70">
            {deliveryPromise(form.pincode, delivery)}
          </div>
        </div>
        <div className="grid grid-cols-[0.8fr_1.2fr] gap-2">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1}
            className="touch-target border-[3px] border-[#1F3D2B] bg-[#F5F1E8] py-3 text-xs font-black uppercase tracking-[0.14em] text-[#1F3D2B] disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={step < 2 ? goNext : pay}
            disabled={busy}
            className="touch-target border-[3px] border-[#1F3D2B] bg-[#D98F00] py-3 text-xs font-black uppercase tracking-[0.14em] text-[#1F3D2B] disabled:opacity-60"
          >
            {busy ? "Processing" : primaryLabel}
          </button>
        </div>
      </div>

      {/* Payment Loading Overlay */}
      {paymentLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F3D2B]/90 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-[#F5F1E8] border-[3px] border-[#1F3D2B] p-6 brutal-shadow">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 border-[3px] border-[#D98F00] bg-[#D98F00]/20 mb-4">
                <div className="animate-spin">
                  <Loader2 size={32} strokeWidth={3} className="text-[#D98F00]" />
                </div>
              </div>
              <h3 className="font-display font-black text-xl text-[#1F3D2B] mb-2">Processing Payment</h3>
              <p className="text-sm font-bold text-[#1F3D2B]/70">{paymentTip}</p>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-black uppercase tracking-[0.12em] text-[#1F3D2B]/70 mb-2">
                <span>Progress</span>
                <span>{paymentProgress}%</span>
              </div>
              <div className="h-3 border-2 border-[#1F3D2B] bg-[#F5F1E8] overflow-hidden">
                <motion.div 
                  className="h-full bg-[#D98F00] border-r-2 border-[#1F3D2B]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${paymentProgress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#1F3D2B]/60">
              <ShieldCheck size={12} strokeWidth={3} />
              <span>Secure Payment Gateway</span>
            </div>
          </div>
        </div>
      )}
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
