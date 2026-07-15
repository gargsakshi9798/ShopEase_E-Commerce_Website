import React from "react";
import ProtectedCustomerRoute from "./components/public/ProtectedCustomerRoute";

// ── Core Public Pages ─────────────────────────────────────────────────────────
const Home                       = React.lazy(() => import("./pages/public/Home"));
const AllCategories              = React.lazy(() => import("./pages/public/AllCategories"));
const More                       = React.lazy(() => import("./pages/public/More"));
const Page404                    = React.lazy(() => import("./pages/Page404"));

// ── Generic Product Detail (dynamic — used by ALL categories) ────────────────
const ProductDetail              = React.lazy(() => import("./pages/public/ProductDetail"));

// ── Category Pages (all dynamic via CategoryPage component) ──────────────────
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

// Legacy category product-detail pages — they redirect to /product/:id
const FashionProductDetail       = React.lazy(() => import("./pages/public/FashionProductDetail"));
const ElectronicsProductDetail   = React.lazy(() => import("./pages/public/ElectronicsProductDetail"));
const MobilesProductDetail       = React.lazy(() => import("./pages/public/MobilesProductDetail"));
const HomeKitchenProductDetail   = React.lazy(() => import("./pages/public/HomeKitchenProductDetail"));
const AppliancesProductDetail    = React.lazy(() => import("./pages/public/AppliancesProductDetail"));
const BeautyProductDetail        = React.lazy(() => import("./pages/public/BeautyProductDetail"));
const SportsProductDetail        = React.lazy(() => import("./pages/public/SportsProductDetail"));
const BooksProductDetail         = React.lazy(() => import("./pages/public/BooksProductDetail"));
const ToysProductDetail          = React.lazy(() => import("./pages/public/ToysProductDetail"));
const GroceryProductDetail       = React.lazy(() => import("./pages/public/GroceryProductDetail"));
const AutomotiveProductDetail    = React.lazy(() => import("./pages/public/AutomotiveProductDetail"));

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

// Helper: wraps element in ProtectedCustomerRoute
const guard = (Component) => (
  <ProtectedCustomerRoute>
    <Component />
  </ProtectedCustomerRoute>
);

const publicRoutes = [
  // ── Home ──
  { path: "/",     element: Home },
  { path: "/home", element: Home },

  // ── Generic Product Detail (primary route for all products) ──
  { path: "/product/:slug", element: ProductDetail },

  // ── Categories ──
  { path: "/categories", element: AllCategories },
  { path: "/more",       element: More },

  // ── Fashion ──
  { path: "/fashion",                 element: Fashion },
  { path: "/fashion/product/:id",     element: FashionProductDetail },

  // ── Electronics ──
  { path: "/electronics",             element: Electronics },
  { path: "/electronics/product/:id", element: ElectronicsProductDetail },

  // ── Mobiles ──
  { path: "/mobiles",                 element: Mobiles },
  { path: "/mobiles/product/:id",     element: MobilesProductDetail },

  // ── Home & Kitchen ──
  { path: "/home-kitchen",                 element: HomeKitchen },
  { path: "/home-kitchen/product/:id",     element: HomeKitchenProductDetail },

  // ── Appliances ──
  { path: "/appliances",              element: Appliances },
  { path: "/appliances/product/:id",  element: AppliancesProductDetail },

  // ── Beauty ──
  { path: "/beauty",                  element: Beauty },
  { path: "/beauty/product/:id",      element: BeautyProductDetail },

  // ── Sports ──
  { path: "/sports",                  element: Sports },
  { path: "/sports/product/:id",      element: SportsProductDetail },

  // ── Books ──
  { path: "/books",                   element: Books },
  { path: "/books/product/:id",       element: BooksProductDetail },

  // ── Toys ──
  { path: "/toys",                    element: Toys },
  { path: "/toys/product/:id",        element: ToysProductDetail },

  // ── Grocery ──
  { path: "/grocery",                 element: Grocery },
  { path: "/grocery/product/:id",     element: GroceryProductDetail },

  // ── Automotive ──
  { path: "/automotive",              element: Automotive },
  { path: "/automotive/product/:id",  element: AutomotiveProductDetail },

  // ── Shopping ──
  { path: "/wishlist", element: Wishlist },
  { path: "/cart",     element: Cart },
  { path: "/checkout", element: Checkout, protected: true },

  // ── Customer Account (protected) ──
  { path: "/account",                element: MyAccount,    protected: true },
  { path: "/my-profile",             element: MyProfile,    protected: true },
  { path: "/my-orders",              element: MyOrders,     protected: true },
  { path: "/my-orders/:id",          element: OrderDetail,  protected: true },
  { path: "/orders",                 element: MyOrders,     protected: true },
  { path: "/orders/:id",             element: OrderDetail,  protected: true },
  { path: "/my-addresses",           element: MyAddresses,  protected: true },
  { path: "/account/addresses",      element: MyAddresses,  protected: true },
  { path: "/my-coupons",             element: MyCoupons,    protected: true },
  { path: "/notifications",          element: Notifications,protected: true },
  { path: "/account/notifications",  element: Notifications,protected: true },
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
