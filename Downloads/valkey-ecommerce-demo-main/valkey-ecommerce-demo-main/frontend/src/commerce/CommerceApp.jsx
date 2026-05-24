import React, { useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";
import {
  ArrowRight,
  ChartLine,
  CheckCircle,
  CreditCard,
  Eye,
  Heart,
  Lightning,
  List,
  ListChecks,
  MagnifyingGlass,
  Minus,
  Package,
  Plus,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  SignOut,
  SlidersHorizontal,
  Star,
  Storefront,
  Tag,
  Trash,
  TrendUp,
  Truck,
  User,
  X
} from "@phosphor-icons/react";
import { api } from "./api";
import { useCommerce } from "./CommerceContext";
import { useSeo } from "./useSeo";

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Number(value || 0));

const FALLBACK_IMAGE = "assets/images/commerce/product-fallback.png";

const imageUrl = (src) => {
  const value = src || FALLBACK_IMAGE;
  if (/^(https?:|data:|blob:)/.test(value)) return value;
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedPath = value.startsWith("/") ? value.slice(1) : value;
  return `${normalizedBase}${normalizedPath}`;
};

const ProductImage = ({ src, alt = "", className = "", loading = "lazy", fetchPriority }) => {
  const [currentSrc, setCurrentSrc] = useState(src || FALLBACK_IMAGE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setCurrentSrc(src || FALLBACK_IMAGE);
  }, [src]);

  return (
    <img
      src={imageUrl(currentSrc)}
      alt={alt}
      className={`${className} ${loaded ? "is-loaded" : "is-loading"}`.trim()}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      onLoad={() => setLoaded(true)}
      onError={() => {
        if (currentSrc !== FALLBACK_IMAGE) setCurrentSrc(FALLBACK_IMAGE);
      }}
    />
  );
};

const statusLabel = (status) => String(status || "").replaceAll("_", " ");

const ProductSkeleton = () => (
  <div className="vc-product-card vc-skeleton-card" aria-hidden="true">
    <div className="vc-skeleton vc-skeleton--image" />
    <div className="vc-skeleton vc-skeleton--line" />
    <div className="vc-skeleton vc-skeleton--line short" />
  </div>
);

const EmptyState = ({ icon = Package, title, body, action }) => {
  const Icon = icon;
  return (
    <div className="vc-empty">
      <span className="vc-empty__icon">
        <Icon size={30} />
      </span>
      <h2>{title}</h2>
      <p>{body}</p>
      {action}
    </div>
  );
};

const Rating = ({ value, count }) => (
  <div className="vc-rating" aria-label={`${value} stars`}>
    <Star size={16} weight="fill" />
    <strong>{Number(value).toFixed(1)}</strong>
    {count !== undefined && <span>({count.toLocaleString()})</span>}
  </div>
);

const discountPercent = (product) =>
  product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

const QuickView = ({ product, onClose }) => {
  const { addToCart, toggleWishlist, wishlist } = useCommerce();
  const saved = wishlist.some((item) => item.id === product.id);
  const [mainImage, setMainImage] = useState(product.gallery?.[0] || product.image);
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id || "");
  const discount = discountPercent(product);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="vc-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <article
        className="vc-quick-view"
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} quick view`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="vc-icon-button vc-modal-close"
          type="button"
          aria-label="Close quick view"
          title="Close quick view"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <div className="vc-quick-view__gallery">
          <ProductImage src={mainImage} alt={product.name} loading="eager" />
          <div>
            {product.gallery?.map((image) => (
              <button
                type="button"
                key={image}
                className={mainImage === image ? "is-active" : ""}
                onClick={() => setMainImage(image)}
              >
                <ProductImage src={image} alt="" />
              </button>
            ))}
          </div>
        </div>
        <div className="vc-quick-view__copy">
          <span className="vc-eyebrow">{product.brand}</span>
          <h2>{product.name}</h2>
          <div className="vc-detail-meta">
            <Rating value={product.rating} count={product.reviewCount} />
            <span>{product.subcategory}</span>
            {discount > 0 && <span>{discount}% off</span>}
          </div>
          <p>{product.description}</p>
          <div className="vc-price-line">
            <strong>{money(product.price)}</strong>
            {product.originalPrice > product.price && <span>{money(product.originalPrice)}</span>}
          </div>
          <div className="vc-variant-grid">
            {product.variants?.map((variant) => (
              <button
                type="button"
                key={variant.id}
                className={variantId === variant.id ? "is-active" : ""}
                onClick={() => setVariantId(variant.id)}
              >
                {variant.label}
              </button>
            ))}
          </div>
          <div className="vc-quick-view__actions">
            <button
              className="vc-button vc-button--primary"
              type="button"
              onClick={() => addToCart(product.id, 1, variantId)}
            >
              <ShoppingCart size={18} /> Add to cart
            </button>
            <button
              className={`vc-icon-button ${saved ? "is-active" : ""}`}
              type="button"
              aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
              title={saved ? "Remove from wishlist" : "Add to wishlist"}
              onClick={() => toggleWishlist(product.id)}
            >
              <Heart size={20} weight={saved ? "fill" : "regular"} />
            </button>
            <Link className="vc-button vc-button--ghost" to={`/product/${product.id}`} onClick={onClose}>
              Details <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
};

const ProductCard = ({ product, compact = false }) => {
  const { addToCart, toggleWishlist, wishlist } = useCommerce();
  const saved = wishlist.some((item) => item.id === product.id);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const hoverImage =
    product.hoverImage || product.gallery?.find((image) => image !== product.image);
  const discount = discountPercent(product);

  return (
    <article className={`vc-product-card ${compact ? "vc-product-card--compact" : ""}`}>
      <div className="vc-product-card__media">
        <Link className="vc-product-card__image-link" to={`/product/${product.id}`}>
          <ProductImage
            src={product.image}
            alt={product.name}
            className="vc-product-card__image vc-product-card__image--primary"
          />
          {hoverImage && (
            <ProductImage
              src={hoverImage}
              alt=""
              className="vc-product-card__image vc-product-card__image--secondary"
            />
          )}
        </Link>
        <div className="vc-product-card__badges">
          {discount > 0 && <span className="vc-sale-pill">-{discount}%</span>}
          {product.badges?.slice(0, 2).map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </div>
        <button
          className="vc-icon-button vc-product-card__quick"
          type="button"
          aria-label={`Quick view ${product.name}`}
          title="Quick view"
          onClick={() => setQuickViewOpen(true)}
        >
          <Eye size={19} />
        </button>
      </div>
      <div className="vc-product-card__body">
        <div className="vc-product-card__meta">
          <span>{product.brand}</span>
          <Rating value={product.rating} />
        </div>
        <h3>
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <p>{product.description}</p>
        <div className="vc-product-card__footer">
          <div>
            <strong>{money(product.price)}</strong>
            {product.originalPrice > product.price && (
              <span>{money(product.originalPrice)}</span>
            )}
          </div>
          <div className="vc-icon-row">
            <button
              className={`vc-icon-button ${saved ? "is-active" : ""}`}
              type="button"
              aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
              title={saved ? "Remove from wishlist" : "Add to wishlist"}
              onClick={() => toggleWishlist(product.id)}
            >
              <Heart size={20} weight={saved ? "fill" : "regular"} />
            </button>
            <button
              className="vc-icon-button vc-icon-button--primary"
              type="button"
              aria-label="Add to cart"
              title="Add to cart"
              onClick={() => addToCart(product.id, 1)}
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>
      {quickViewOpen && <QuickView product={product} onClose={() => setQuickViewOpen(false)} />}
    </article>
  );
};

const Header = () => {
  const { cart, user, wishlist, apiStatus } = useCommerce();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const cartCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return undefined;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const response = await api.suggestions(query);
        setSuggestions(response.data || []);
      } catch (_error) {
        setSuggestions([]);
      }
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [query]);

  const submitSearch = (event) => {
    event.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(query)}`);
    setOpen(false);
    setMobileOpen(false);
  };

  const nav = (
    <>
      <NavLink to="/" onClick={() => setMobileOpen(false)}>
        Home
      </NavLink>
      <NavLink to="/shop" onClick={() => setMobileOpen(false)}>
        Shop
      </NavLink>
      <NavLink to="/wishlist" onClick={() => setMobileOpen(false)}>
        Wishlist
      </NavLink>
      <NavLink to="/account" onClick={() => setMobileOpen(false)}>
        Account
      </NavLink>
      {user?.role === "admin" && (
        <NavLink to="/admin" onClick={() => setMobileOpen(false)}>
          Admin
        </NavLink>
      )}
    </>
  );

  return (
    <header className="vc-header">
      <div className="vc-header__bar">
        <Link className="vc-brand" to="/">
          <span className="vc-brand__mark">
            <Lightning size={22} weight="fill" />
          </span>
          <span>
            <strong>VAL-HYD</strong>
            <small>Premium store</small>
          </span>
        </Link>

        <form className="vc-search" onSubmit={submitSearch} role="search">
          <MagnifyingGlass size={19} />
          <input
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            placeholder="Search products, categories, brands"
            aria-label="Search products"
          />
          {query && (
            <button
              type="button"
              className="vc-search__clear"
              aria-label="Clear search"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
              }}
            >
              <X size={16} />
            </button>
          )}
          {open && suggestions.length > 0 && (
            <div className="vc-suggestions">
              {suggestions.map((item) => (
                <Link
                  to={`/product/${item.id}`}
                  key={item.id}
                  onClick={() => setOpen(false)}
                >
                  <ProductImage src={item.image} alt="" />
                  <span>{item.name}</span>
                  <small>{item.category}</small>
                </Link>
              ))}
            </div>
          )}
        </form>

        <nav className="vc-nav">{nav}</nav>

        <div className="vc-header__actions">
          <span className={`vc-status vc-status--${apiStatus}`}>
            {apiStatus === "valkey" ? "Valkey live" : apiStatus}
          </span>
          <Link className="vc-icon-button" to="/wishlist" aria-label="Wishlist" title="Wishlist">
            <Heart size={20} />
            {wishlist.length > 0 && <span>{wishlist.length}</span>}
          </Link>
          <Link className="vc-icon-button" to="/account" aria-label="Account" title="Account">
            <User size={20} />
          </Link>
          <Link className="vc-cart-button" to="/cart">
            <ShoppingCart size={20} />
            <span>{cartCount}</span>
          </Link>
          <button
            className="vc-icon-button vc-mobile-toggle"
            type="button"
            aria-label="Open navigation"
            title="Open navigation"
            onClick={() => setMobileOpen(true)}
          >
            <List size={22} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="vc-mobile-panel">
          <button
            className="vc-icon-button"
            type="button"
            aria-label="Close navigation"
            title="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
          <nav>{nav}</nav>
        </div>
      )}
    </header>
  );
};

const Footer = () => (
  <footer className="vc-footer">
    <div>
      <Link className="vc-brand" to="/">
        <span className="vc-brand__mark">
          <Lightning size={22} weight="fill" />
        </span>
        <span>
          <strong>VAL-HYD</strong>
          <small>Premium store</small>
        </span>
      </Link>
      <p>
        A production-grade ecommerce demo using Valkey for cache, carts, sessions,
        rate limiting, recommendations, and analytics.
      </p>
    </div>
    <div>
      <strong>Platform</strong>
      <Link to="/shop">Catalog</Link>
      <Link to="/cart">Cart</Link>
      <Link to="/checkout">Checkout</Link>
    </div>
    <div>
      <strong>Operations</strong>
      <Link to="/admin">Admin</Link>
      <Link to="/account">Profile</Link>
      <Link to="/contact">Support</Link>
    </div>
  </footer>
);

const HomePage = () => {
  useSeo("Modern VAL-HYD Storefront", "Shop a fast ecommerce platform powered by Valkey.");
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recent, setRecent] = useState([]);
  const [categoryFacets, setCategoryFacets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [featuredResponse, trendingResponse, recentResponse] = await Promise.all([
          api.products({ limit: 8, sort: "featured" }),
          api.trending(4),
          api.recentlyViewed()
        ]);
        setFeatured(featuredResponse.data || []);
        setCategoryFacets(featuredResponse.facets?.categories || []);
        setTrending(trendingResponse.data || []);
        setRecent(recentResponse.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const heroProduct = featured[0];

  return (
    <main>
      <section className="vc-hero">
        <div className="vc-hero__content">
          <span className="vc-eyebrow">
            <Lightning size={16} weight="fill" /> VAL-HYD commerce
          </span>
          <h1>Premium retail discovery with instant catalog, cart, and inventory signals.</h1>
          <p>
            Explore a modern cross-category storefront with polished product galleries,
            smart recommendations, resilient carts, and Valkey-backed retail analytics.
          </p>
          <div className="vc-hero__actions">
            <Link className="vc-button vc-button--primary" to="/shop">
              Shop collection <ArrowRight size={18} />
            </Link>
            <Link className="vc-button vc-button--ghost" to="/admin">
              View analytics <ChartLine size={18} />
            </Link>
          </div>
          <div className="vc-metric-strip">
            <span>
              <strong>90s</strong>
              <small>catalog cache TTL</small>
            </span>
            <span>
              <strong>30d</strong>
              <small>cart persistence</small>
            </span>
            <span>
              <strong>RBAC</strong>
              <small>admin controls</small>
            </span>
          </div>
        </div>
        <div className="vc-hero__visual">
          {heroProduct ? (
            <article>
              <ProductImage src={heroProduct.image} alt={heroProduct.name} loading="eager" />
              <div>
                <span>{heroProduct.category}</span>
                <h2>{heroProduct.name}</h2>
                <p>{heroProduct.description}</p>
                <strong>{money(heroProduct.price)}</strong>
              </div>
            </article>
          ) : (
            <ProductSkeleton />
          )}
        </div>
      </section>

      <section className="vc-feature-band">
        {[
          [ShieldCheck, "Secure sessions", "JWT sessions stored and revoked through Valkey."],
          [ShoppingCart, "Cached carts", "Anonymous and signed-in carts use shared service logic."],
          [TrendUp, "Hot products", "Sorted-set tracking surfaces trending product demand."],
          [Truck, "Checkout ready", "Orders, invoices, tracking states, and payment placeholders."]
        ].map(([Icon, title, body]) => (
          <article key={title}>
            <Icon size={24} />
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </section>

      {categoryFacets.length > 0 && (
        <section className="vc-section vc-category-showcase">
          <div className="vc-section__header">
            <div>
              <span className="vc-eyebrow">Departments</span>
              <h2>Shop by category</h2>
            </div>
            <Link className="vc-link" to="/shop">
              Browse catalog <ArrowRight size={16} />
            </Link>
          </div>
          <div className="vc-category-showcase__grid">
            {categoryFacets.map((category) => (
              <Link to={`/shop?category=${encodeURIComponent(category.name)}`} key={category.name}>
                <span>{category.name}</span>
                <strong>{category.count}</strong>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ProductSection
        title="Featured Products"
        body="Curated launch products with premium galleries, live stock, wishlist, and cart actions."
        products={featured}
        loading={loading}
      />

      <ProductSection
        title="Trending Now"
        body="Ranked by Valkey hot-product signals with sold-count fallback."
        products={trending}
        loading={loading}
        compact
      />

      {recent.length > 0 && (
        <section className="vc-section">
          <div className="vc-section__header">
            <div>
              <span className="vc-eyebrow">Recently viewed</span>
              <h2>Pick up where you left off</h2>
            </div>
          </div>
          <div className="vc-recent-grid">
            {recent.map((item) => (
              <Link to={`/product/${item.id}`} key={item.id}>
                <ProductImage src={item.image} alt="" />
                <span>{item.name}</span>
                <strong>{money(item.price)}</strong>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

const ProductSection = ({ title, body, products, loading, compact }) => (
  <section className="vc-section">
    <div className="vc-section__header">
      <div>
        <span className="vc-eyebrow">Storefront</span>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      <Link className="vc-link" to="/shop">
        View all <ArrowRight size={16} />
      </Link>
    </div>
    <div className={`vc-product-grid ${compact ? "vc-product-grid--compact" : ""}`}>
      {loading
        ? Array.from({ length: compact ? 4 : 8 }, (_, index) => <ProductSkeleton key={index} />)
        : products.map((product) => (
            <ProductCard product={product} key={product.id} compact={compact} />
          ))}
    </div>
  </section>
);

const ShopPage = () => {
  useSeo("Shop", "Search, filter, and sort the VAL-HYD catalog.");
  const [searchParams, setSearchParams] = useSearchParams();
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const query = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      brand: searchParams.get("brand") || "",
      subcategory: searchParams.get("subcategory") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      rating: searchParams.get("rating") || "",
      sort: searchParams.get("sort") || "featured",
      page: searchParams.get("page") || 1,
      limit: 16
    }),
    [searchParams]
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        setResponse(await api.products(query));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [query]);

  const updateQuery = (next) => {
    const merged = { ...query, ...next, page: next.page || 1 };
    Object.keys(merged).forEach((key) => {
      if (!merged[key]) delete merged[key];
    });
    setSearchParams(merged);
  };

  const products = response?.data || [];
  const categoryFacets = response?.facets?.categories || [];

  return (
    <main className="vc-page">
      <section className="vc-page-heading">
        <div>
          <span className="vc-eyebrow">Catalog</span>
          <h1>Shop the collection</h1>
          <p>
            Search, sort, filter, paginate, and cache product responses through the API.
          </p>
        </div>
        <button
          className="vc-button vc-button--ghost vc-filter-trigger"
          type="button"
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal size={18} /> Filters
        </button>
      </section>

      {categoryFacets.length > 0 && (
        <nav className="vc-category-rail" aria-label="Product categories">
          <button
            type="button"
            className={!query.category ? "is-active" : ""}
            onClick={() => updateQuery({ category: "" })}
          >
            All
          </button>
          {categoryFacets.map((category) => (
            <button
              type="button"
              key={category.name}
              className={query.category === category.name ? "is-active" : ""}
              onClick={() => updateQuery({ category: category.name })}
            >
              {category.name}
              <span>{category.count}</span>
            </button>
          ))}
        </nav>
      )}

      <section className="vc-shop-layout">
        <aside className={`vc-filters ${filtersOpen ? "is-open" : ""}`}>
          <button
            className="vc-icon-button vc-filters__close"
            type="button"
            aria-label="Close filters"
            title="Close filters"
            onClick={() => setFiltersOpen(false)}
          >
            <X size={18} />
          </button>
          <h2>Filters</h2>
          <label>
            Search
            <input
              value={query.search}
              onChange={(event) => updateQuery({ search: event.target.value })}
              placeholder="Product or brand"
            />
          </label>
          <label>
            Category
            <select
              value={query.category}
              onChange={(event) => updateQuery({ category: event.target.value })}
            >
              <option value="">All categories</option>
              {response?.facets?.categories?.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </label>
          <label>
            Brand
            <select
              value={query.brand}
              onChange={(event) => updateQuery({ brand: event.target.value })}
            >
              <option value="">All brands</option>
              {response?.facets?.brands?.map((brand) => (
                <option key={brand.name} value={brand.name}>
                  {brand.name} ({brand.count})
                </option>
              ))}
            </select>
          </label>
          <label>
            Subcategory
            <select
              value={query.subcategory}
              onChange={(event) => updateQuery({ subcategory: event.target.value })}
            >
              <option value="">All subcategories</option>
              {response?.facets?.subcategories?.map((subcategory) => (
                <option key={subcategory.name} value={subcategory.name}>
                  {subcategory.name} ({subcategory.count})
                </option>
              ))}
            </select>
          </label>
          <div className="vc-filter-pair">
            <label>
              Min price
              <input
                type="number"
                min="0"
                value={query.minPrice}
                onChange={(event) => updateQuery({ minPrice: event.target.value })}
              />
            </label>
            <label>
              Max price
              <input
                type="number"
                min="0"
                value={query.maxPrice}
                onChange={(event) => updateQuery({ maxPrice: event.target.value })}
              />
            </label>
          </div>
          <label>
            Rating
            <select
              value={query.rating}
              onChange={(event) => updateQuery({ rating: event.target.value })}
            >
              <option value="">Any rating</option>
              <option value="4.8">4.8 and up</option>
              <option value="4.6">4.6 and up</option>
              <option value="4.4">4.4 and up</option>
            </select>
          </label>
          <button className="vc-button vc-button--ghost" type="button" onClick={() => setSearchParams({})}>
            Reset filters
          </button>
        </aside>

        <div className="vc-shop-results">
          <div className="vc-results-bar">
            <span>
              {response?.pagination?.total || 0} products
              {response?.cache && (
                <small> Cache {response.cache.hit ? "hit" : "miss"} via {response.cache.mode}</small>
              )}
            </span>
            <select
              value={query.sort}
              onChange={(event) => updateQuery({ sort: event.target.value })}
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="trending">Trending</option>
              <option value="rating">Top rated</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price low to high</option>
              <option value="price-desc">Price high to low</option>
            </select>
          </div>

          {loading ? (
            <div className="vc-product-grid">
              {Array.from({ length: 12 }, (_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          ) : products.length ? (
            <>
              <div className="vc-product-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="vc-pagination">
                <button
                  className="vc-button vc-button--ghost"
                  type="button"
                  disabled={Number(query.page) <= 1}
                  onClick={() => updateQuery({ page: Number(query.page) - 1 })}
                >
                  Previous
                </button>
                <span>
                  Page {response.pagination.page} of {response.pagination.totalPages}
                </span>
                <button
                  className="vc-button vc-button--ghost"
                  type="button"
                  disabled={response.pagination.page >= response.pagination.totalPages}
                  onClick={() => updateQuery({ page: Number(query.page) + 1 })}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <EmptyState
              icon={MagnifyingGlass}
              title="No matching products"
              body="Try a different search, category, price range, or rating filter."
              action={
                <button className="vc-button vc-button--primary" type="button" onClick={() => setSearchParams({})}>
                  Clear filters
                </button>
              }
            />
          )}
        </div>
      </section>
    </main>
  );
};

const ProductDetailsPage = ({ fallbackId = "astra-nova-x1-smartphone" }) => {
  const params = useParams();
  const id = params.id || fallbackId;
  const { addToCart, toggleWishlist, wishlist } = useCommerce();
  const [data, setData] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [variantId, setVariantId] = useState("");

  useSeo(data?.data?.name || "Product Details", data?.data?.description);

  useEffect(() => {
    const load = async () => {
      const response = await api.product(id);
      setData(response);
      setMainImage(response.data.gallery?.[0] || response.data.image);
      setVariantId(response.data.variants?.[0]?.id || "");
    };
    load();
  }, [id]);

  if (!data) {
    return (
      <main className="vc-page">
        <div className="vc-detail-skeleton">
          <ProductSkeleton />
          <ProductSkeleton />
        </div>
      </main>
    );
  }

  const product = data.data;
  const saved = wishlist.some((item) => item.id === product.id);
  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const discount = discountPercent(product);

  return (
    <main className="vc-page">
      <section className="vc-product-detail">
        <div className="vc-gallery">
          <div className="vc-gallery__main">
            <ProductImage
              src={mainImage}
              alt={product.name}
              loading="eager"
              fetchPriority="high"
              className="vc-gallery__image"
            />
          </div>
          <div className="vc-gallery__thumbs">
            {gallery.map((image) => (
              <button
                type="button"
                key={image}
                className={mainImage === image ? "is-active" : ""}
                onClick={() => setMainImage(image)}
              >
                <ProductImage src={image} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="vc-detail-copy">
          <span className="vc-eyebrow">{product.brand}</span>
          <h1>{product.name}</h1>
          <div className="vc-detail-meta">
            <Rating value={product.rating} count={product.reviewCount} />
            <span>{product.category}</span>
            <span>{product.subcategory}</span>
            <span>SKU {product.sku}</span>
            <span>{product.inventoryStatus.replaceAll("_", " ")}</span>
            {discount > 0 && <span>{discount}% off</span>}
          </div>
          <p>{product.description}</p>
          <div className="vc-price-line">
            <strong>{money(product.price)}</strong>
            {product.originalPrice > product.price && <span>{money(product.originalPrice)}</span>}
          </div>

          <div className="vc-variant-grid" aria-label="Product variants">
            {product.variants.map((variant) => (
              <button
                type="button"
                key={variant.id}
                className={variantId === variant.id ? "is-active" : ""}
                onClick={() => setVariantId(variant.id)}
              >
                {variant.label}
                <small>{variant.stock} left</small>
              </button>
            ))}
          </div>

          <div className="vc-quantity-row">
            <div className="vc-stepper">
              <button type="button" onClick={() => setQuantity(Math.max(quantity - 1, 1))}>
                <Minus size={16} />
              </button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity(quantity + 1)}>
                <Plus size={16} />
              </button>
            </div>
            <button
              className="vc-button vc-button--primary"
              type="button"
              onClick={() => addToCart(product.id, quantity, variantId)}
            >
              <ShoppingCart size={18} /> Add to cart
            </button>
            <button
              className={`vc-icon-button ${saved ? "is-active" : ""}`}
              type="button"
              aria-label="Wishlist"
              title="Wishlist"
              onClick={() => toggleWishlist(product.id)}
            >
              <Heart size={21} weight={saved ? "fill" : "regular"} />
            </button>
          </div>

          <div className="vc-assurance-grid">
            <span>
              <Truck size={20} /> Free returns
            </span>
            <span>
              <ShieldCheck size={20} /> Secure checkout
            </span>
            <span>
              <Package size={20} /> Stock tracked live
            </span>
          </div>
        </div>
      </section>

      <section className="vc-detail-panels">
        <article>
          <h2>Specifications</h2>
          <dl>
            {Object.entries(product.specs).map(([key, value]) => (
              <React.Fragment key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </React.Fragment>
            ))}
          </dl>
        </article>
        <article>
          <h2>Reviews</h2>
          {data.reviews.length ? (
            data.reviews.map((review) => (
              <div className="vc-review" key={review.id}>
                <Rating value={review.rating} />
                <strong>{review.title}</strong>
                <p>{review.body}</p>
                <small>{review.user}</small>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </article>
      </section>

      <ProductSection
        title="Related Products"
        body="Recommendations use category and tag affinity with catalog signals."
        products={data.related}
        loading={false}
        compact
      />
    </main>
  );
};

const CartPage = () => {
  useSeo("Cart", "Review cart items and apply coupons.");
  const { cart, updateCartItem, removeCartItem, applyCoupon } = useCommerce();
  const [coupon, setCoupon] = useState("");

  if (!cart) {
    return (
      <main className="vc-page">
        <ProductSkeleton />
      </main>
    );
  }

  if (!cart.items.length) {
    return (
      <main className="vc-page vc-page--center">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is ready when you are"
          body="Add products from the catalog and Valkey will keep the cart available across sessions."
          action={
            <Link className="vc-button vc-button--primary" to="/shop">
              Shop products
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="vc-page">
      <section className="vc-page-heading">
        <div>
          <span className="vc-eyebrow">Cart</span>
          <h1>Review your cart</h1>
        </div>
      </section>
      <section className="vc-cart-layout">
        <div className="vc-cart-items">
          {cart.items.map((item) => (
            <article className="vc-cart-item" key={`${item.product.id}-${item.variant?.id || "default"}`}>
              <ProductImage src={item.product.image} alt={item.product.name} />
              <div>
                <h2>{item.product.name}</h2>
                <p>{item.product.category}{item.variant ? ` / ${item.variant.label}` : ""}</p>
                <strong>{money(item.product.price)}</strong>
              </div>
              <div className="vc-stepper">
                <button
                  type="button"
                  onClick={() => updateCartItem(item.product.id, Math.max(item.quantity - 1, 0), item.variant?.id)}
                >
                  <Minus size={16} />
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateCartItem(item.product.id, item.quantity + 1, item.variant?.id)}
                >
                  <Plus size={16} />
                </button>
              </div>
              <strong>{money(item.lineTotal)}</strong>
              <button
                className="vc-icon-button"
                type="button"
                aria-label="Remove item"
                title="Remove item"
                onClick={() => removeCartItem(item.product.id, item.variant?.id)}
              >
                <Trash size={19} />
              </button>
            </article>
          ))}
        </div>
        <aside className="vc-summary">
          <h2>Order summary</h2>
          <div className="vc-coupon">
            <input
              value={coupon}
              onChange={(event) => setCoupon(event.target.value)}
              placeholder="Coupon code"
            />
            <button
              className="vc-button vc-button--ghost"
              type="button"
              onClick={() => applyCoupon(coupon)}
            >
              Apply
            </button>
          </div>
          {cart.coupon && <p className="vc-success-line"><Tag size={16} /> {cart.coupon.description}</p>}
          <SummaryRows totals={cart.totals} />
          <Link className="vc-button vc-button--primary vc-button--full" to="/checkout">
            Checkout <ArrowRight size={18} />
          </Link>
        </aside>
      </section>
    </main>
  );
};

const SummaryRows = ({ totals }) => (
  <div className="vc-summary-rows">
    <span>Subtotal <strong>{money(totals.subtotal)}</strong></span>
    <span>Discount <strong>-{money(totals.discount)}</strong></span>
    <span>Shipping <strong>{money(totals.shipping)}</strong></span>
    <span>Tax <strong>{money(totals.tax)}</strong></span>
    <span className="total">Total <strong>{money(totals.total)}</strong></span>
  </div>
);

const CheckoutPage = () => {
  useSeo("Checkout", "Complete a multi-step checkout with payment placeholder.");
  const { cart, checkout } = useCommerce();
  const [step, setStep] = useState(1);
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    paymentProvider: "stripe-placeholder"
  });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const placeOrder = async () => {
    const next = await checkout({
      paymentProvider: form.paymentProvider,
      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone
      },
      shippingAddress: {
        line1: form.line1,
        line2: form.line2,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country
      }
    });
    setOrder(next);
  };

  if (order) {
    return (
      <main className="vc-page vc-page--center">
        <EmptyState
          icon={CheckCircle}
          title="Order placed"
          body={`Invoice ${order.invoice.number} is ready. Your order is now ${statusLabel(order.status)}.`}
          action={
            <Link className="vc-button vc-button--primary" to="/account">
              View account
            </Link>
          }
        />
      </main>
    );
  }

  if (!cart?.items?.length) {
    return (
      <main className="vc-page vc-page--center">
        <EmptyState
          icon={ShoppingCart}
          title="Checkout needs a cart"
          body="Add a product first, then come back to complete the order."
          action={<Link className="vc-button vc-button--primary" to="/shop">Shop products</Link>}
        />
      </main>
    );
  }

  return (
    <main className="vc-page">
      <section className="vc-page-heading">
        <div>
          <span className="vc-eyebrow">Checkout</span>
          <h1>Complete your order</h1>
        </div>
      </section>
      <section className="vc-checkout-layout">
        <div className="vc-checkout-main">
          <div className="vc-steps">
            {["Customer", "Delivery", "Payment"].map((label, index) => (
              <button
                type="button"
                key={label}
                className={step === index + 1 ? "is-active" : ""}
                onClick={() => setStep(index + 1)}
              >
                {index + 1}. {label}
              </button>
            ))}
          </div>

          {step === 1 && (
            <div className="vc-form-grid">
              <Input label="Full name" value={form.name} onChange={(value) => update("name", value)} />
              <Input label="Email" type="email" value={form.email} onChange={(value) => update("email", value)} />
              <Input label="Phone" value={form.phone} onChange={(value) => update("phone", value)} />
            </div>
          )}
          {step === 2 && (
            <div className="vc-form-grid">
              <Input label="Address line 1" value={form.line1} onChange={(value) => update("line1", value)} />
              <Input label="Address line 2" value={form.line2} onChange={(value) => update("line2", value)} />
              <Input label="City" value={form.city} onChange={(value) => update("city", value)} />
              <Input label="State" value={form.state} onChange={(value) => update("state", value)} />
              <Input label="Postal code" value={form.postalCode} onChange={(value) => update("postalCode", value)} />
              <Input label="Country" value={form.country} onChange={(value) => update("country", value)} />
            </div>
          )}
          {step === 3 && (
            <div className="vc-payment-options">
              {[
                ["stripe-placeholder", CreditCard, "Card authorization placeholder"],
                ["manual-placeholder", Receipt, "Manual invoice placeholder"]
              ].map(([value, Icon, label]) => (
                <label className={form.paymentProvider === value ? "is-active" : ""} key={value}>
                  <input
                    type="radio"
                    name="payment"
                    value={value}
                    checked={form.paymentProvider === value}
                    onChange={(event) => update("paymentProvider", event.target.value)}
                  />
                  <Icon size={24} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          )}

          <div className="vc-form-actions">
            <button
              className="vc-button vc-button--ghost"
              type="button"
              disabled={step === 1}
              onClick={() => setStep(step - 1)}
            >
              Back
            </button>
            {step < 3 ? (
              <button className="vc-button vc-button--primary" type="button" onClick={() => setStep(step + 1)}>
                Continue
              </button>
            ) : (
              <button className="vc-button vc-button--primary" type="button" onClick={placeOrder}>
                Place order
              </button>
            )}
          </div>
        </div>
        <aside className="vc-summary">
          <h2>Your order</h2>
          {cart.items.map((item) => (
            <div className="vc-mini-line" key={item.product.id}>
              <span>{item.product.name} x {item.quantity}</span>
              <strong>{money(item.lineTotal)}</strong>
            </div>
          ))}
          <SummaryRows totals={cart.totals} />
        </aside>
      </section>
    </main>
  );
};

const Input = ({ label, value, onChange, type = "text" }) => (
  <label className="vc-field">
    {label}
    <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required />
  </label>
);

const AccountPage = () => {
  useSeo("Account", "Manage profile, authentication, and order history.");
  const { user, login, register, logout, setUser } = useCommerce();
  const [mode, setMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "admin@valkeycommerce.dev",
    password: "Admin123!"
  });
  const [orders, setOrders] = useState([]);
  const [profileName, setProfileName] = useState("");

  useEffect(() => {
    if (!user) return;
    setProfileName(user.name);
    api.orders().then((response) => setOrders(response.data || [])).catch(() => setOrders([]));
  }, [user]);

  const submitAuth = async (event) => {
    event.preventDefault();
    if (mode === "login") await login(authForm);
    else await register(authForm);
  };

  const saveProfile = async () => {
    const response = await api.updateMe({ name: profileName });
    setUser(response.user);
  };

  if (!user) {
    return (
      <main className="vc-page">
        <section className="vc-auth-layout">
          <div>
            <span className="vc-eyebrow">Account</span>
            <h1>Sign in to unlock saved carts, orders, and admin tools.</h1>
            <p>
              Demo admin credentials are prefilled. Register a customer account to test
              the customer flow.
            </p>
          </div>
          <form className="vc-auth-card" onSubmit={submitAuth}>
            <div className="vc-segmented">
              <button type="button" className={mode === "login" ? "is-active" : ""} onClick={() => setMode("login")}>
                Login
              </button>
              <button type="button" className={mode === "register" ? "is-active" : ""} onClick={() => setMode("register")}>
                Register
              </button>
            </div>
            {mode === "register" && (
              <Input label="Name" value={authForm.name} onChange={(value) => setAuthForm({ ...authForm, name: value })} />
            )}
            <Input label="Email" type="email" value={authForm.email} onChange={(value) => setAuthForm({ ...authForm, email: value })} />
            <Input label="Password" type="password" value={authForm.password} onChange={(value) => setAuthForm({ ...authForm, password: value })} />
            <button className="vc-button vc-button--primary vc-button--full" type="submit">
              {mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="vc-page">
      <section className="vc-page-heading">
        <div>
          <span className="vc-eyebrow">Profile</span>
          <h1>{user.name}</h1>
          <p>{user.email} / {user.role}</p>
        </div>
        <button className="vc-button vc-button--ghost" type="button" onClick={logout}>
          <SignOut size={18} /> Sign out
        </button>
      </section>

      <section className="vc-account-grid">
        <article className="vc-panel">
          <h2>Profile</h2>
          <Input label="Display name" value={profileName} onChange={setProfileName} />
          <button className="vc-button vc-button--primary" type="button" onClick={saveProfile}>
            Save profile
          </button>
        </article>
        <article className="vc-panel">
          <h2>Order history</h2>
          {orders.length ? (
            orders.map((order) => (
              <div className="vc-order-line" key={order.id}>
                <span>{order.invoice.number}</span>
                <strong>{money(order.totals.total)}</strong>
                <small>{statusLabel(order.status)}</small>
              </div>
            ))
          ) : (
            <p>No orders yet.</p>
          )}
        </article>
        {user.role === "admin" && (
          <article className="vc-panel vc-panel--accent">
            <h2>Admin access</h2>
            <p>Manage analytics, inventory, and order operations.</p>
            <Link className="vc-button vc-button--primary" to="/admin">
              Open dashboard
            </Link>
          </article>
        )}
      </section>
    </main>
  );
};

const WishlistPage = () => {
  useSeo("Wishlist", "Saved products and quick cart actions.");
  const { wishlist } = useCommerce();

  return (
    <main className="vc-page">
      <section className="vc-page-heading">
        <div>
          <span className="vc-eyebrow">Wishlist</span>
          <h1>Saved products</h1>
        </div>
      </section>
      {wishlist.length ? (
        <div className="vc-product-grid">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="No saved products yet"
          body="Tap the heart on products to keep them close."
          action={<Link className="vc-button vc-button--primary" to="/shop">Browse products</Link>}
        />
      )}
    </main>
  );
};

const AdminPage = () => {
  useSeo("Admin Dashboard", "Operational analytics, inventory management, and Valkey signals.");
  const { user, notify } = useCommerce();
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);

  const load = async () => {
    const [analyticsResponse, productResponse] = await Promise.all([
      api.analytics(),
      api.products({ limit: 48 })
    ]);
    setAnalytics(analyticsResponse.data);
    setProducts(productResponse.data || []);
  };

  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user]);

  const adjust = async (productId, delta) => {
    await api.updateInventory(productId, delta);
    notify("Inventory updated");
    await load();
  };

  if (user?.role !== "admin") {
    return (
      <main className="vc-page vc-page--center">
        <EmptyState
          icon={ShieldCheck}
          title="Admin access required"
          body="Log in with the demo admin account to view operational controls."
          action={<Link className="vc-button vc-button--primary" to="/account">Go to account</Link>}
        />
      </main>
    );
  }

  if (!analytics) {
    return (
      <main className="vc-page">
        <div className="vc-kpi-grid">
          {Array.from({ length: 4 }, (_, index) => <ProductSkeleton key={index} />)}
        </div>
      </main>
    );
  }

  return (
    <main className="vc-page">
      <section className="vc-page-heading">
        <div>
          <span className="vc-eyebrow">Admin</span>
          <h1>Operations dashboard</h1>
          <p>Valkey-backed signals and catalog controls for retail operations.</p>
        </div>
      </section>

      <section className="vc-kpi-grid">
        <Kpi icon={Storefront} label="Products" value={analytics.productCount} />
        <Kpi icon={Package} label="Low stock" value={analytics.lowStockCount} />
        <Kpi icon={Star} label="Average rating" value={analytics.averageRating.toFixed(2)} />
        <Kpi icon={ChartLine} label="Revenue signal" value={money(analytics.revenuePotential)} />
      </section>

      <section className="vc-admin-grid">
        <article className="vc-panel">
          <h2>Trending products</h2>
          {analytics.trending.map((product) => (
            <div className="vc-mini-line" key={product.id}>
              <span>{product.name}</span>
              <strong>{product.views?.toLocaleString?.() || product.views}</strong>
            </div>
          ))}
        </article>
        <article className="vc-panel">
          <h2>Category mix</h2>
          {analytics.categoryMix.map((category) => (
            <div className="vc-mini-line" key={category.name}>
              <span>{category.name}</span>
              <strong>{category.count}</strong>
            </div>
          ))}
        </article>
      </section>

      <section className="vc-panel">
        <h2>Inventory management</h2>
        <div className="vc-inventory-table">
          {products.map((product) => (
            <div key={product.id}>
              <ProductImage src={product.image} alt="" />
              <span>{product.name}</span>
              <strong>{product.stock}</strong>
              <button className="vc-icon-button" type="button" onClick={() => adjust(product.id, -1)}>
                <Minus size={16} />
              </button>
              <button className="vc-icon-button" type="button" onClick={() => adjust(product.id, 1)}>
                <Plus size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

const Kpi = ({ icon: Icon, label, value }) => (
  <article className="vc-kpi">
    <Icon size={24} />
    <span>{label}</span>
    <strong>{value}</strong>
  </article>
);

const ContentPage = ({ title, body, icon: Icon = ListChecks }) => {
  useSeo(title, body);
  return (
    <main className="vc-page vc-page--center">
      <EmptyState
        icon={Icon}
        title={title}
        body={body}
        action={<Link className="vc-button vc-button--primary" to="/shop">Explore shop</Link>}
      />
    </main>
  );
};

export const CommerceApp = () => (
  <>
    <Header />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/product/:id" element={<ProductDetailsPage />} />
      <Route path="/product-details" element={<ProductDetailsPage />} />
      <Route path="/product-details-two" element={<ProductDetailsPage fallbackId="pulse-anc-earbuds-pro" />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/wishlist" element={<WishlistPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/index-two" element={<HomePage />} />
      <Route path="/index-three" element={<HomePage />} />
      <Route path="/vendor" element={<ContentPage title="Vendor Network" body="Marketplace vendor workflows are represented through product vendors and admin operations." icon={Storefront} />} />
      <Route path="/vendor-details" element={<ContentPage title="Vendor Profile" body="Vendor detail pages can connect to the same catalog and analytics services." icon={Storefront} />} />
      <Route path="/vendor-two" element={<ContentPage title="Vendor Directory" body="A scalable vendor directory belongs behind the same API version and RBAC model." icon={Storefront} />} />
      <Route path="/vendor-two-details" element={<ContentPage title="Vendor Operations" body="Inventory, fulfillment, and performance signals are ready for extension." icon={Storefront} />} />
      <Route path="/become-seller" element={<ContentPage title="Become a Seller" body="Seller onboarding can be added with role elevation, verification, and catalog permissions." icon={Storefront} />} />
      <Route path="/blog" element={<ContentPage title="Commerce Journal" body="Editorial content can be served from a CMS or cached API endpoint." icon={Receipt} />} />
      <Route path="/blog-details" element={<ContentPage title="Commerce Insight" body="This route is preserved for deep links and ready for CMS-backed articles." icon={Receipt} />} />
      <Route path="/contact" element={<ContentPage title="Support" body="Customer support, returns, and fulfillment messaging can be integrated here." icon={Truck} />} />
      <Route path="*" element={<ContentPage title="Page not found" body="The route does not exist in this storefront." icon={X} />} />
    </Routes>
    <Footer />
  </>
);
