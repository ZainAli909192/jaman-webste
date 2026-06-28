import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { pages } from './pages';
import './styles.css';

const titles = {
  '/': 'Jaman Apparel',
  '/about': 'About | Jaman Apparel',
  '/blog': 'Blog | Jaman Apparel',
};


const mobileLinks = [
  ['Services', '/#services'],
  ['Customization', '/#customization'],
  ['Portfolio', '/#portfolio'],
  ['About Us', '/about'],
  ['Blog', '/blog'],
  ['Start Your Order', '/#order'],
];

function setupMobileMenu() {
  const nav = document.querySelector('nav');
  const button = nav ? [...nav.querySelectorAll('button')].find((item) => item.classList.contains('lg:hidden')) : null;
  if (!nav || !button) return () => {};

  nav.classList.add('relative');
  button.setAttribute('type', 'button');
  button.setAttribute('aria-label', 'Open menu');
  button.setAttribute('aria-expanded', 'false');

  let menu = nav.querySelector('[data-mobile-menu]');
  if (!menu) {
    menu = document.createElement('div');
    menu.dataset.mobileMenu = 'true';
    menu.className = 'mobile-menu lg:hidden absolute left-0 right-0 top-full bg-white border-b border-gray-100 shadow-xl overflow-hidden max-h-0 opacity-0 pointer-events-none transition-all duration-300 ease-out';
    menu.innerHTML = `<div class="px-6 py-5 flex flex-col gap-1">${mobileLinks
      .map(([label, href], index) => {
        const primary = index === mobileLinks.length - 1;
        const classes = primary
          ? 'mt-4 bg-[var(--primary)] text-white px-5 py-4 rounded-sm text-xs font-bold uppercase tracking-widest text-center'
          : 'px-1 py-4 text-sm font-semibold text-black border-b border-gray-100 hover:text-[var(--primary)] transition-colors';
        return `<a href="${href}" class="${classes}">${label}</a>`;
      })
      .join('')}</div>`;
    nav.appendChild(menu);
  }

  const setOpen = (open) => {
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('max-h-0', !open);
    menu.classList.toggle('opacity-0', !open);
    menu.classList.toggle('pointer-events-none', !open);
    menu.classList.toggle('max-h-[520px]', open);
    menu.classList.toggle('opacity-100', open);
  };

  const toggle = () => setOpen(button.getAttribute('aria-expanded') !== 'true');
  const close = () => setOpen(false);
  button.addEventListener('click', toggle);
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) close();
  });

  return () => {
    button.removeEventListener('click', toggle);
  };
}

function normalizePath(pathname) {
  const path = pathname.replace(/\/$/, '') || '/';
  return pages[path] ? path : '/';
}

function App() {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  const html = useMemo(() => pages[path], [path]);

  useEffect(() => {
    const onClick = (event) => {
      const anchor = event.target.closest('a');
      if (!anchor) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (!pages[normalizePath(url.pathname)] && url.pathname !== '/') return;
      event.preventDefault();
      const nextPath = normalizePath(url.pathname);
      window.history.pushState({}, '', url.pathname + url.hash);
      setPath(nextPath);
      requestAnimationFrame(() => {
        if (url.hash) document.querySelector(url.hash)?.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    };
    const onPop = () => setPath(normalizePath(window.location.pathname));
    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPop);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onPop);
    };
  }, []);

  useEffect(() => {
    document.title = titles[path] || 'Jaman Apparel';
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    );
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
    const cleanupMobileMenu = setupMobileMenu();
    return () => {
      revealObserver.disconnect();
      cleanupMobileMenu();
    };
  }, [path, html]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

createRoot(document.getElementById('root')).render(<App />);
