'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { theme } from '@/styles/theme';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, setUser } = useAppStore();

  useEffect(() => {
    const storedUser = localStorage.getItem('gvb_user');
    if (storedUser && !user) {
      setUser(JSON.parse(storedUser));
    }
  }, [user, setUser]);

  const baseLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Partidos', href: '/#partidos' },
    { label: 'Reglamento', href: '/reglamento' },
  ];

  const links = user 
    ? [
        ...baseLinks, 
        { label: 'Jugar Prode', href: '/prode' },
        { label: 'Grupo', href: '/grupo' },
        ...(user.role === 'ADMIN' ? [{ label: 'Admin', href: '/admin' }] : [])
      ] 
    : baseLinks;

  const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B2545] text-white border-b-4 border-[#B8860B]">
      <div className={cn("mx-auto px-4 sm:px-6 lg:px-8", theme.layout.container)}>
        <div className="flex justify-between items-center h-20">
          
          <div className="flex-shrink-0 flex items-center">
            <Link 
              href="/" 
              className={cn("text-3xl font-bold tracking-widest", theme.typography.heading, focusClasses)}
              aria-label="Ir al inicio"
            >
              GVB <span className="text-[#B8860B]">WORLD CUP</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-sm font-bold uppercase tracking-widest hover:text-[#B8860B] transition-colors",
                  focusClasses
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center">
            <Link
              href={user ? "/prode" : "/login"}
              className={cn(
                "bg-[#B8860B] text-[#111111] px-6 py-2 text-sm font-bold uppercase tracking-widest transition-transform hover:scale-105 active:scale-95",
                "shadow-[4px_4px_0px_0px_#111111]",
                focusClasses
              )}
            >
              {user ? "Mi Prode" : "Entrar"}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn("p-2 text-white hover:text-[#B8860B] transition-colors", focusClasses)}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
          
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0B2545] border-t border-[#13315C] absolute w-full left-0 top-20 shadow-lg pb-6">
          <div className="flex flex-col px-4 pt-4 pb-2 space-y-4">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block text-lg font-bold uppercase tracking-widest hover:text-[#B8860B] transition-colors",
                  focusClasses
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-[#13315C]">
              <Link
                href={user ? "/prode" : "/login"}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block w-full text-center bg-[#B8860B] text-[#111111] px-6 py-3 text-lg font-bold uppercase tracking-widest",
                  focusClasses
                )}
              >
                {user ? "Mi Prode" : "Entrar"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
