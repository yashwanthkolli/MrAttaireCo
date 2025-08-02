const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax', // CSRF protection
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/',
};

/**
 * Server-side cookie helper functions
 */
const serverCookieHelper = {
  /**
   * Get cookie from request
   * @param {Request} req - Express request object
   * @param {string} key - Cookie name
   * @returns {string|undefined} Cookie value
   */
  getCookie(req, key) {
    if (!req.cookies) return undefined;
    return req.cookies[key];
  },

  /**
   * Set cookie in response
   * @param {Response} res - Express response object
   * @param {string} key - Cookie name
   * @param {string} value - Cookie value
   * @param {object} [options] - Additional cookie options
   */
  setCookie(res, key, value, options = {}) {
    res.cookie(key, value, { ...COOKIE_OPTIONS, ...options });
  },

  /**
   * Clear cookie in response
   * @param {Response} res - Express response object
   * @param {string} key - Cookie name
   */
  clearCookie(res, key) {
    res.clearCookie(key, {
      ...COOKIE_OPTIONS,
      expires: new Date(0), // Immediate expiration
    });
  },
};

/**
 * Client-side cookie helper functions
 * (For use in browser environments)
 */
const clientCookieHelper = {
  /**
   * Get cookie from document
   * @param {string} key - Cookie name
   * @returns {string|undefined} Cookie value
   */
  getCookie(key) {
    if (typeof document === 'undefined') return undefined;
    
    const cookies = document.cookie.split(';').map(c => c.trim());
    const found = cookies.find(c => c.startsWith(`${key}=`));
    
    return found ? decodeURIComponent(found.split('=')[1]) : undefined;
  },

  /**
   * Set cookie in document
   * @param {string} key - Cookie name
   * @param {string} value - Cookie value
   * @param {object} [options] - Cookie options
   */
  setCookie(key, value, options = {}) {
    if (typeof document === 'undefined') return;

    const opts = {
      path: '/',
      ...options,
    };

    let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

    if (options.maxAge) {
      const d = new Date();
      d.setTime(d.getTime() + options.maxAge);
      cookie += `; expires=${d.toUTCString()}`;
    }

    if (options.path) cookie += `; path=${options.path}`;
    if (options.domain) cookie += `; domain=${options.domain}`;
    if (options.secure) cookie += '; secure';
    if (options.sameSite) cookie += `; samesite=${options.sameSite}`;

    document.cookie = cookie;
  },

  /**
   * Clear cookie in document
   * @param {string} key - Cookie name
   */
  clearCookie(key) {
    this.setCookie(key, '', {
      maxAge: -1, // Expire immediately
    });
  },
};

/**
 * Universal cookie helper that works in both environments
 */
const universalCookieHelper = {
  getCookie(req, key) {
    if (typeof window === 'undefined') {
      return serverCookieHelper.getCookie(req, key);
    }
    return clientCookieHelper.getCookie(key);
  },

  setCookie(res, key, value, options) {
    if (typeof window === 'undefined') {
      return serverCookieHelper.setCookie(res, key, value, options);
    }
    return clientCookieHelper.setCookie(key, value, options);
  },

  clearCookie(res, key) {
    if (typeof window === 'undefined') {
      return serverCookieHelper.clearCookie(res, key);
    }
    return clientCookieHelper.clearCookie(key);
  },
};

module.exports = {
  ...serverCookieHelper, // Default export for server-side usage
  client: clientCookieHelper,
  universal: universalCookieHelper,
};