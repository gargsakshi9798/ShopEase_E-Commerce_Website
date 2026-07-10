import React from "react";

const Home                       = React.lazy(() => import("./pages/public/Home"));
const Fashion                    = React.lazy(() => import("./pages/public/Fashion"));
const FashionProductDetail       = React.lazy(() => import("./pages/public/FashionProductDetail"));
const Electronics                = React.lazy(() => import("./pages/public/Electronics"));
const ElectronicsProductDetail   = React.lazy(() => import("./pages/public/ElectronicsProductDetail"));
const Wishlist                   = React.lazy(() => import("./pages/public/Wishlist"));
const Cart                       = React.lazy(() => import("./pages/public/Cart"));
const Checkout                   = React.lazy(() => import("./pages/public/Checkout"));
const Page404                    = React.lazy(() => import("./pages/Page404"));

const publicRoutes = [
  { path: "/",                              element: Home },
  { path: "/home",                          element: Home },
  { path: "/fashion",                       element: Fashion },
  { path: "/fashion/product/:id",           element: FashionProductDetail },
  { path: "/electronics",                   element: Electronics },
  { path: "/electronics/product/:id",       element: ElectronicsProductDetail },
  { path: "/wishlist",                      element: Wishlist },
  { path: "/cart",                          element: Cart },
  { path: "/checkout",                      element: Checkout },
  { path: "*",                              element: Page404 },
];

export default publicRoutes;
