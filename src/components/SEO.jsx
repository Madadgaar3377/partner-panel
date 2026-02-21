import React, { useEffect } from 'react';

const SITE_NAME = 'Madadgaar Partner Portal';
const BASE_URL = 'https://partner.madadgaar.com.pk';
const DEFAULT_DESCRIPTION = 'Partner dashboard for Madadgaar – manage installments, properties, loans, insurance, agents, and commissions in Pakistan.';

function setMeta(nameOrProp, value, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${nameOrProp}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, nameOrProp);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value || '');
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href || BASE_URL + '/';
}

/**
 * SEO component – updates document title and meta tags per page.
 * Use once per route (e.g. in App based on pathname).
 */
const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath = '',
  noIndex = true,
  ogImage = `${BASE_URL}/madadgaar-logo.jpg`,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = canonicalPath ? `${BASE_URL}${canonicalPath.startsWith('/') ? canonicalPath : '/' + canonicalPath}` : BASE_URL + '/';

  useEffect(() => {
    document.title = fullTitle;
    setMeta('description', description);
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setCanonical(canonicalUrl);
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:image', ogImage, true);
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);
  }, [fullTitle, description, canonicalUrl, noIndex, ogImage]);

  return null;
};

export default SEO;
