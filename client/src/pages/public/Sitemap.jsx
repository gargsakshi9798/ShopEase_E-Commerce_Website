import { Link } from "react-router-dom";
import { MdArrowForward } from "react-icons/md";
import { FaSitemap } from "react-icons/fa";

const sections = [
  {
    title: "🛍️ Shop by Category",
    links: [
      { label:"Fashion",        path:"/fashion"      },
      { label:"Electronics",    path:"/electronics"  },
      { label:"Mobiles",        path:"/mobiles"      },
      { label:"Home & Kitchen", path:"/home-kitchen" },
      { label:"Appliances",     path:"/appliances"   },
      { label:"Beauty",         path:"/beauty"       },
      { label:"Sports",         path:"/sports"       },
      { label:"Books",          path:"/books"        },
      { label:"Toys",           path:"/toys"         },
      { label:"Grocery",        path:"/grocery"      },
      { label:"Automotive",     path:"/automotive"   },
      { label:"All Categories", path:"/categories"   },
    ],
  },
  {
    title: "🏠 Main Pages",
    links: [
      { label:"Home",           path:"/"           },
      { label:"My Wishlist",    path:"/wishlist"   },
      { label:"My Cart",        path:"/cart"       },
      { label:"Checkout",       path:"/checkout"   },
      { label:"More Deals",     path:"/more"       },
    ],
  },
  {
    title: "🎁 Special Services",
    links: [
      { label:"Gift Cards",     path:"/gift-cards"    },
      { label:"Bulk Orders",    path:"/bulk-orders"   },
      { label:"Store Locator",  path:"/store-locator" },
      { label:"Become a Seller",path:"/become-seller" },
      { label:"Affiliate Program",path:"/affiliate"  },
    ],
  },
  {
    title: "🎧 Customer Service",
    links: [
      { label:"Help Center",          path:"/help-center"         },
      { label:"Track Your Order",     path:"/track-order"         },
      { label:"Returns & Refunds",    path:"/returns"             },
      { label:"Shipping Policy",      path:"/shipping-policy"     },
      { label:"Cancellation Policy",  path:"/cancellation-policy" },
      { label:"Contact Us",           path:"/contact-us"          },
    ],
  },
  {
    title: "🏢 Company",
    links: [
      { label:"About Us",         path:"/about-us"      },
      { label:"Careers",          path:"/careers"       },
      { label:"Press & Media",    path:"/press-media"   },
    ],
  },
  {
    title: "📋 Legal",
    links: [
      { label:"Terms & Conditions",path:"/terms-conditions" },
      { label:"Privacy Policy",    path:"/privacy-policy"   },
    ],
  },
];

const Sitemap = () => (
  <div className="bg-gray-50 min-h-screen">
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white">
      <div className="max-w-[1000px] mx-auto px-4 py-14 text-center">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <FaSitemap size={28} className="text-white"/>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">Sitemap</h1>
        <p className="text-white/65 text-sm max-w-md mx-auto">A complete directory of every page on ShopEase.</p>
      </div>
    </div>
    <div className="max-w-[1000px] mx-auto px-4 py-10">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sections.map((sec) => (
          <div key={sec.title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-extrabold text-gray-900 mb-4">{sec.title}</h2>
            <ul className="space-y-2">
              {sec.links.map((l) => (
                <li key={l.path}>
                  <Link to={l.path}
                    className="flex items-center justify-between text-xs text-gray-600 hover:text-primary-600 group transition-colors py-0.5">
                    <span>{l.label}</span>
                    <MdArrowForward size={13} className="text-gray-300 group-hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-all"/>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </div>
);
export default Sitemap;
