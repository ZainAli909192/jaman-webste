import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { pages } from './pages';
import './styles.css';

const titles = {
  '/': 'Jaman Apparel',
  '/about': 'About | Jaman Apparel',
  '/blog': 'Blog | Jaman Apparel',
};

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
    return () => revealObserver.disconnect();
  }, [path, html]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

createRoot(document.getElementById('root')).render(<App />);
