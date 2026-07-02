'use client';

import React, { useEffect, useState, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNav(false);
      } else if (currentScrollY < lastScrollY || currentScrollY <= 100) {
        setShowNav(true);
      }
      setLastScrollY(currentScrollY);
    };

    const handleClickOutside = (event: MouseEvent) => {
      // Ignore clicks on the toggle button itself — let its own onClick handle toggling
      if (toggleRef.current && toggleRef.current.contains(event.target as Node)) {
        return;
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [lastScrollY]);

  const navbarVariants = {
    hidden: { y: '-120%' },
    visible: {
      y: 0,
      transition: { duration: 0.5, delay: 0.2 },
    },
  };

  const navLinks = [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Guest book', href: '/guestbook' },
  ];

  return (
    <>
      <motion.nav
        className="sticky top-4 z-50 w-full px-4"
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
      >
        <div
          className={twMerge(
            `mx-auto mt-2 sm:mt-4 flex h-[60px] sm:h-[70px] md:h-[80px] w-full 
max-w-4xl
            items-center justify-between px-3 sm:px-6 transition-transform
            duration-300 ease-in-out bg-yellow-300 dark:bg-yellow-300
            border-[3px] border-black dark:border-black
            shadow-[8px_8px_0px_0px_#000000] 
dark:shadow-[8px_8px_0px_0px_#000000]
            overflow-visible`,
            showNav ? 'translate-y-0' : '-translate-y-[calc(100%+40px)]',
          )}
        >
          {/* Logo + Text */}
          <div className="relative -mt-2 sm:-mt-3 md:-mt-4">
            <Link
              href="/"
              className="flex items-end gap-2 sm:gap-3 transform -rotate-2 
hover:rotate-0 transition-transform
                duration-300 min-w-fit"
            >
              <img
                src="/media/cropped-because-birds-logo-bird-2.png"
                alt="becausebirds logo"
                width={80}
                height={80}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
              />
              <span className="text-xl sm:text-2xl md:text-3xl font-black 
tracking-tight text-black pb-1">
                becausebirds
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center text-base lg:text-lg space-x-4">
  {navLinks.map((link) => (
    <Link
      key={link.href}
      href={link.href}
      className="px-4 py-2 font-bold text-black bg-[#76fbd9] rounded-base
        border-2 border-black
        shadow-[4px_4px_0px_0px_#000000]
        hover:translate-x-0.5 hover:translate-y-0.5 
        hover:shadow-[2px_2px_0px_0px_#000000]
        active:translate-x-1 active:translate-y-1 
        active:shadow-none
        transition-all duration-100
        transform"
    >
      {link.label}
    </Link>
  ))}
</div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button
              ref={toggleRef}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 bg-[rgb(118_251_217)] rounded-base transform 
hover:-rotate-3 
transition-transform
                border-2 border-black
                shadow-[4px_4px_0px_0px_#000000]"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-0.5 bg-black mb-1"></div>
              <div className="w-6 h-0.5 bg-black mb-1"></div>
              <div className="w-6 h-0.5 bg-black"></div>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed top-[90px] sm:top-[110px] z-50 w-full px-2 
sm:px-4" ref={menuRef}>
          <div
            className="w-full max-w-4xl mx-auto bg-yellow-300 p-4
              border-[3px] border-black
              shadow-[8px_8px_0px_0px_#000000]"
          >
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="p-3 text-center text-lg font-bold bg-[#76fbd9] text-black rounded-base
                        border-2 border-black
        shadow-[4px_4px_0px_0px_#000000]
        hover:translate-x-0.5 hover:translate-y-0.5 
        hover:shadow-[2px_2px_0px_0px_#000000]
        active:translate-x-1 active:translate-y-1 
        active:shadow-none
        transition-all duration-100
        transform"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
