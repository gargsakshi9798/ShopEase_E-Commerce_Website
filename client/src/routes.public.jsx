import React from "react";
import { Navigate, useParams } from "react-router-dom";

// ── Core Public Pages ─────────────────────────────────────────────────────────
const Home                       = React.lazy(() => import("./pages/public/Home"));
const Products                   = React.lazy(() => import("./pages/public/Products"));
const AllCategories              = React.lazy(() => import("./pages/public/AllCategories"));
const More                       = React.lazy(() => import("./pages/public/More"));
const Page404                    = React.lazy(() => import("./pages/Page404"));

// ── Generic Product Detail (dynamic — used by ALL categories) ────────────────
const ProductDetail              = React.lazy(() => import("./pages/public/ProductDetail"));

// ── Category Pages ────────────────────────────────────────────────────────────
const Fashion                    = React.lazy(() => import("./pages/public/Fashion"));
const Electronics                = React.lazy(() => import("./pages/public/Electronics"));
const Mobiles                    = React.lazy(() => import("./pages/public/Mobiles"));
const HomeKitchen                = React.lazy(() => import("./pages/public/HomeKitchen"));
const Appliances                 = React.lazy(() => import("./pages/public/Appliances"));
const Beauty                     = React.lazy(() => import("./pages/public/Beauty"));
const Sports                     = React.lazy(() => import("./pages/public/Sports"));
const Books                      = React.lazy(() => import("./pages/public/Books"));
const Toys                       = React.lazy(() => import("./pages/public/Toys"));
const Grocery                    = React.lazy(() => import("./pages/public/Grocery"));
const Automotive                 = React.lazy(() => import("./pages/public/Automotive"));

// ── Shopping Pages ────────────────────────────────────────────────────────────
const Wishlist                   = React.lazy(() => import("./pages/public/Wishlist"));
const Cart                       = React.lazy(() => import("./pages/public/Cart"));
const Checkout                   = React.lazy(() => import("./pages/public/Checkout"));

// ── Customer Account Pages (protected) ────────────────────────────────────────
const MyAccount                  = React.lazy(() => import("./pages/public/MyAccount"));
const MyProfile                  = React.lazy(() => import("./pages/public/MyProfile"));
const MyOrders                   = React.lazy(() => import("./pages/public/MyOrders"));
const OrderDetail                = React.lazy(() => import("./pages/public/OrderDetail"));
const MyAddresses                = React.lazy(() => import("./pages/public/MyAddresses"));
const MyCoupons                  = React.lazy(() => import("./pages/public/MyCoupons"));
const Notifications              = React.lazy(() => import("./pages/public/Notifications"));
const MySettings                 = React.lazy(() => import("./pages/public/MySettings"));
const MyReviews                  = React.lazy(() => import("./pages/public/MyReviews"));
const MyTickets                  = React.lazy(() => import("./pages/public/MyTickets"));
const OrderSuccess               = React.lazy(() => import("./pages/public/OrderSuccess"));

// ── Customer Service / Info Pages ────────────────────────────────────────────
const HelpCenter                 = React.lazy(() => import("./pages/public/HelpCenter"));
const TrackOrder                 = React.lazy(() => import("./pages/public/TrackOrder"));
const Returns                    = React.lazy(() => import("./pages/public/Returns"));
const ShippingPolicy             = React.lazy(() => import("./pages/public/ShippingPolicy"));
const CancellationPolicy         = React.lazy(() => import("./pages/public/CancellationPolicy"));
const ContactUs                  = React.lazy(() => import("./pages/public/ContactUs"));
const AboutUs                    = React.lazy(() => import("./pages/public/AboutUs"));
const Careers                    = React.lazy(() => import("./pages/public/Careers"));
const PressMedia                 = React.lazy(() => import("./pages/public/PressMedia"));
const BecomeSeller               = React.lazy(() => import("./pages/public/BecomeSeller"));
const Affiliate                  = React.lazy(() => import("./pages/public/Affiliate"));
const TermsConditions            = React.lazy(() => import("./pages/public/TermsConditions"));
const PrivacyPolicy              = React.lazy(() => import("./pages/public/PrivacyPolicy"));
const GiftCards                  = React.lazy(() => import("./pages/public/GiftCards"));
const BulkOrders                 = React.lazy(() => import("./pages/public/BulkOrders"));
const StoreLocator               = React.lazy(() => import("./pages/public/StoreLocator"));
const Sitemap                    = React.lazy(() => import("./pages/public/Sitemap"));

// ── Legacy category product-detail redirect helper ────────────────────────────
// All /category/product/:id routes redirect to the canonical /product/:id.
// A tiny component is needed to read the dynamic :id param from the URL.
const RedirectToProduct = () => {
  const { id } = useParams();
  return <Navigate to={`/product/${id}`} replace />;
};

const publicRoutes = [
  // ── Home ──
  { path: "/", element: Home },

  // ── Generic Product Detail (primary route for all products) ──
  { path: "/product/:slug", element: ProductDetail },

  // ── All Products (search / filter / browse) ──
  { path: "/products", element: Products },

  // ── Categories ──
  { path: "/categories", element: AllCategories },
  { path: "/more",       element: More },

  // ── Fashion ──
  { path: "/fashion",                 element: Fashion },
  { path: "/fashion/product/:id",     element: RedirectToProduct },

  // ── Electronics ──
  { path: "/electronics",             element: Electronics },
  { path: "/electronics/product/:id", element: RedirectToProduct },

  // ── Mobiles ──
  { path: "/mobiles",                 element: Mobiles },
  { path: "/mobiles/product/:id",     element: RedirectToProduct },

  // ── Home & Kitchen ──
  { path: "/home-kitchen",                 element: HomeKitchen },
  { path: "/home-kitchen/product/:id",     element: RedirectToProduct },

  // ── Appliances ──
  { path: "/appliances",              element: Appliances },
  { path: "/appliances/product/:id",  element: RedirectToProduct },

  // ── Beauty ──
  { path: "/beauty",                  element: Beauty },
  { path: "/beauty/product/:id",      element: RedirectToProduct },

  // ── Sports ──
  { path: "/sports",                  element: Sports },
  { path: "/sports/product/:id",      element: RedirectToProduct },

  // ── Books ──
  { path: "/books",                   element: Books },
  { path: "/books/product/:id",       element: RedirectToProduct },

  // ── Toys ──
  { path: "/toys",                    element: Toys },
  { path: "/toys/product/:id",        element: RedirectToProduct },

  // ── Grocery ──
  { path: "/grocery",                 element: Grocery },
  { path: "/grocery/product/:id",     element: RedirectToProduct },

  // ── Automotive ──
  { path: "/automotive",              element: Automotive },
  { path: "/automotive/product/:id",  element: RedirectToProduct },

  // ── Shopping ──
  { path: "/wishlist", element: Wishlist },
  { path: "/cart",     element: Cart },
  { path: "/checkout", element: Checkout, protected: true },

  // ── Customer Account (protected) ──
  { path: "/account",                element: MyAccount,    protected: true },
  { path: "/my-profile",             element: MyProfile,    protected: true },
  { path: "/my-orders",              element: MyOrders,     protected: true },
  { path: "/my-orders/:id",          element: OrderDetail,  protected: true },
  { path: "/my-addresses",           element: MyAddresses,  protected: true },
  { path: "/my-coupons",             element: MyCoupons,    protected: true },
  { path: "/notifications",          element: Notifications,protected: true },
  { path: "/my-settings",            element: MySettings,   protected: true },
  { path: "/my-reviews",             element: MyReviews,    protected: true },
  { path: "/my-tickets",             element: MyTickets,    protected: true },
  { path: "/order-success/:id",      element: OrderSuccess, protected: true },

  // ── Customer Service / Info ──
  { path: "/help-center",          element: HelpCenter         },
  { path: "/track-order",          element: TrackOrder         },
  { path: "/returns",              element: Returns            },
  { path: "/shipping-policy",      element: ShippingPolicy     },
  { path: "/cancellation-policy",  element: CancellationPolicy },
  { path: "/contact-us",           element: ContactUs          },
  { path: "/about-us",             element: AboutUs            },
  { path: "/careers",              element: Careers            },
  { path: "/press-media",          element: PressMedia         },
  { path: "/become-seller",        element: BecomeSeller       },
  { path: "/affiliate",            element: Affiliate          },
  { path: "/terms-conditions",     element: TermsConditions    },
  { path: "/privacy-policy",       element: PrivacyPolicy      },
  { path: "/gift-cards",           element: GiftCards          },
  { path: "/bulk-orders",          element: BulkOrders         },
  { path: "/store-locator",        element: StoreLocator       },
  { path: "/sitemap",              element: Sitemap            },

  // ── 404 ──
  { path: "*", element: Page404 },
];

export default publicRoutes;
