import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSettings, updateSettings } from "../../features/settings/settingsSlice";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  MdStore, MdPayment, MdLocalShipping, MdEmail,
  MdSecurity, MdNotifications, MdSave, MdRefresh,
} from "react-icons/md";

const TABS = [
  { id: "general",    label: "General",         icon: MdStore },
  { id: "payment",    label: "Payment",          icon: MdPayment },
  { id: "shipping",   label: "Shipping & Tax",   icon: MdLocalShipping },
  { id: "email",      label: "Email / SMTP",     icon: MdEmail },
  { id: "notify",     label: "Notifications",    icon: MdNotifications },
];

const Field = ({ label, hint, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {children}
    {hint  && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-card p-5 space-y-4">
    <h3 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-3">{title}</h3>
    {children}
  </div>
);

const Toggle = ({ label, hint, id, register }) => (
  <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group py-1">
    <div className="relative mt-0.5">
      <input type="checkbox" id={id} className="sr-only peer" {...register(id)} />
      <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-primary-600 transition-colors" />
      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-all peer-checked:translate-x-5" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-700 group-hover:text-primary-700">{label}</p>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  </label>
);

const Settings = () => {
  const dispatch = useDispatch();
  const { data } = useSelector((s) => s.settings);
  const [activeTab, setActiveTab] = useState("general");

  const { register, handleSubmit, reset, formState: { isSubmitting, isDirty } } = useForm();

  useEffect(() => { dispatch(fetchSettings()); }, [dispatch]);
  useEffect(() => { if (data) reset(data); }, [data]);

  const onSubmit = async (formData) => {
    try {
      const res = await dispatch(updateSettings(formData));
      if (res.payload?.success) toast.success("Settings saved successfully!");
      else toast.error("Failed to save settings");
    } catch { toast.error("Something went wrong"); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configure your store preferences and integrations</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => dispatch(fetchSettings())}
            className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50" title="Refresh">
            <MdRefresh size={18} />
          </button>
          <button type="submit" form="settings-form" disabled={isSubmitting}
            className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
            <MdSave size={16} /> {isSubmitting ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1 sticky top-20">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                  activeTab === tab.id
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}>
                <tab.icon size={17} /> {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Form */}
        <form id="settings-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-5">

          {/* ── General ──────────────────────────────────────────────── */}
          {activeTab === "general" && (
            <>
              <SectionCard title="Store Information">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Store Name *">
                    <input className="input-field" placeholder="e.g. ShopEase" {...register("site_name")} />
                  </Field>
                  <Field label="Tagline">
                    <input className="input-field" placeholder="Your store tagline" {...register("site_tagline")} />
                  </Field>
                  <Field label="Support Email">
                    <input type="email" className="input-field" placeholder="support@shopease.com" {...register("contact_email")} />
                  </Field>
                  <Field label="Support Phone">
                    <input className="input-field" placeholder="+91 99999 99999" {...register("contact_phone")} />
                  </Field>
                  <Field label="Store Address" hint="Shown on invoices">
                    <input className="input-field" placeholder="123, Street, City" {...register("store_address")} />
                  </Field>
                  <Field label="GST Number">
                    <input className="input-field" placeholder="e.g. 22AAAAA0000A1Z5" {...register("gst_number")} />
                  </Field>
                </div>
              </SectionCard>
              <SectionCard title="Currency & Locale">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Currency Code">
                    <input className="input-field" placeholder="INR" {...register("currency")} />
                  </Field>
                  <Field label="Currency Symbol">
                    <input className="input-field" placeholder="₹" {...register("currency_symbol")} />
                  </Field>
                  <Field label="Timezone">
                    <input className="input-field" placeholder="Asia/Kolkata" {...register("timezone")} />
                  </Field>
                  <Field label="Date Format">
                    <select className="input-field" {...register("date_format")}>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </Field>
                </div>
              </SectionCard>
              <SectionCard title="Store Status">
                <Toggle id="maintenance_mode" label="Maintenance Mode"
                  hint="Customers will see a maintenance page when enabled"
                  register={register} />
                <Toggle id="allow_guest_checkout" label="Allow Guest Checkout"
                  hint="Let customers order without creating an account"
                  register={register} />
                <Toggle id="show_out_of_stock" label="Show Out of Stock Products"
                  hint="Display products with 0 stock on the storefront"
                  register={register} />
              </SectionCard>
            </>
          )}

          {/* ── Payment ───────────────────────────────────────────────── */}
          {activeTab === "payment" && (
            <>
              <SectionCard title="Payment Methods">
                <Toggle id="cod_enabled"      label="Cash on Delivery (COD)" hint="Allow pay on delivery" register={register} />
                <Toggle id="razorpay_enabled" label="Razorpay"               hint="Online payment gateway" register={register} />
                <Toggle id="stripe_enabled"   label="Stripe"                 hint="International payments" register={register} />
                <Toggle id="wallet_enabled"   label="Wallet"                 hint="Store wallet / credits" register={register} />
              </SectionCard>
              <SectionCard title="Razorpay Configuration">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Razorpay Key ID" hint="From your Razorpay dashboard">
                    <input className="input-field" placeholder="rzp_live_..." {...register("razorpay_key_id")} />
                  </Field>
                  <Field label="Razorpay Secret" hint="Keep this confidential">
                    <input type="password" className="input-field" placeholder="••••••••" {...register("razorpay_secret")} />
                  </Field>
                </div>
                <Toggle id="razorpay_test_mode" label="Test Mode" hint="Use test credentials for development" register={register} />
              </SectionCard>
              <SectionCard title="COD Settings">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="COD Charge (₹)" hint="Extra charge for COD orders">
                    <input type="number" min="0" className="input-field" placeholder="0" {...register("cod_charge")} />
                  </Field>
                  <Field label="Max COD Order Amount (₹)" hint="Disable COD above this amount">
                    <input type="number" min="0" className="input-field" placeholder="10000" {...register("cod_max_amount")} />
                  </Field>
                </div>
              </SectionCard>
            </>
          )}

          {/* ── Shipping ──────────────────────────────────────────────── */}
          {activeTab === "shipping" && (
            <>
              <SectionCard title="Shipping Configuration">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Default Shipping Charge (₹)">
                    <input type="number" min="0" className="input-field" placeholder="49" {...register("default_shipping_charge")} />
                  </Field>
                  <Field label="Free Shipping Above (₹)" hint="Set 0 to disable free shipping">
                    <input type="number" min="0" className="input-field" placeholder="499" {...register("free_shipping_threshold")} />
                  </Field>
                  <Field label="Max Delivery Days" hint="Expected delivery timeframe">
                    <input type="number" min="1" className="input-field" placeholder="7" {...register("max_delivery_days")} />
                  </Field>
                  <Field label="Min Delivery Days">
                    <input type="number" min="1" className="input-field" placeholder="2" {...register("min_delivery_days")} />
                  </Field>
                </div>
                <Toggle id="free_shipping_enabled" label="Enable Free Shipping Offer" hint="Show free shipping badge on qualifying orders" register={register} />
              </SectionCard>
              <SectionCard title="Tax Configuration">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="GST Percent (%)" hint="Inclusive tax rate">
                    <input type="number" min="0" max="100" className="input-field" placeholder="18" {...register("gst_percent")} />
                  </Field>
                  <Field label="Tax Calculation">
                    <select className="input-field" {...register("tax_type")}>
                      <option value="inclusive">Inclusive (price includes tax)</option>
                      <option value="exclusive">Exclusive (tax added on top)</option>
                    </select>
                  </Field>
                </div>
                <Toggle id="tax_enabled" label="Enable Tax Calculation" hint="Apply GST to all orders" register={register} />
              </SectionCard>
            </>
          )}

          {/* ── Email ─────────────────────────────────────────────────── */}
          {activeTab === "email" && (
            <>
              <SectionCard title="SMTP Configuration">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="SMTP Host">
                    <input className="input-field" placeholder="smtp.gmail.com" {...register("smtp_host")} />
                  </Field>
                  <Field label="SMTP Port">
                    <input type="number" className="input-field" placeholder="587" {...register("smtp_port")} />
                  </Field>
                  <Field label="SMTP Username">
                    <input className="input-field" placeholder="your@email.com" {...register("smtp_user")} />
                  </Field>
                  <Field label="SMTP Password">
                    <input type="password" className="input-field" placeholder="••••••••" {...register("smtp_pass")} />
                  </Field>
                  <Field label="From Name">
                    <input className="input-field" placeholder="ShopEase" {...register("email_from_name")} />
                  </Field>
                  <Field label="From Email">
                    <input type="email" className="input-field" placeholder="no-reply@shopease.com" {...register("email_from")} />
                  </Field>
                </div>
                <Toggle id="smtp_secure" label="Use SSL/TLS" hint="Enable for port 465" register={register} />
              </SectionCard>
              <SectionCard title="Email Templates">
                <Toggle id="send_order_confirmation" label="Order Confirmation Email"    hint="Send when order is placed"        register={register} />
                <Toggle id="send_order_shipped"      label="Order Shipped Email"         hint="Send when order is shipped"       register={register} />
                <Toggle id="send_order_delivered"    label="Order Delivered Email"       hint="Send on delivery confirmation"    register={register} />
                <Toggle id="send_welcome_email"      label="Welcome Email"               hint="Send on new registration"         register={register} />
                <Toggle id="send_password_reset"     label="Password Reset Email"        hint="Enable forgot password flow"      register={register} />
              </SectionCard>
            </>
          )}

          {/* ── Notifications ─────────────────────────────────────────── */}
          {activeTab === "notify" && (
            <SectionCard title="Push & In-App Notifications">
              <Toggle id="push_notifications"      label="Enable Push Notifications"    hint="Mobile push notifications via Firebase" register={register} />
              <Toggle id="order_notify_admin"      label="New Order Alert (Admin)"      hint="Notify admin on every new order"        register={register} />
              <Toggle id="low_stock_notify"        label="Low Stock Alert"              hint="Notify when product stock is low"       register={register} />
              <Toggle id="review_notify_admin"     label="New Review Alert (Admin)"     hint="Notify on customer review"              register={register} />
              <Toggle id="refund_notify_customer"  label="Refund Notification"          hint="Notify customer on refund processed"    register={register} />
              <div className="pt-3 border-t border-gray-100">
                <Field label="Low Stock Threshold" hint="Alert when stock falls below this">
                  <input type="number" min="1" className="input-field max-w-xs" placeholder="10" {...register("low_stock_alert_threshold")} />
                </Field>
              </div>
            </SectionCard>
          )}

        </form>
      </div>
    </div>
  );
};

export default Settings;
