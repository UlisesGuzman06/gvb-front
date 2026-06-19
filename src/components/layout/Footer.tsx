import React from 'react';
import Link from 'next/link';
import { theme } from '@/styles/theme';
import { cn } from '@/lib/utils';

export function Footer() {
  const links = [
    { label: 'Reglamento', href: '/reglamento' },
    { label: 'Ranking', href: '/#ranking' },
    { label: 'Fixture', href: '/#fixture' },
    { label: 'Estadísticas', href: '/#estadisticas' },
  ];

  const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]";

  return (
    <footer className="bg-[#111111] text-white py-12 border-t border-[#1A1A1A]">
      <div className={cn("mx-auto", theme.layout.container)}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link 
              href="/" 
              className={cn(
                "text-4xl tracking-widest text-[#F4F1EA] hover:text-[#B8860B] transition-colors", 
                theme.typography.heading,
                focusClasses
              )}
              aria-label="Ir al inicio"
            >
              GVB WORLD CUP <span className="text-[#B8860B]">2026</span>
            </Link>
            {/* Contrast fix: replacing #5A5A5A with #F4F1EA opacity-70 for better legibility on dark background */}
            <p className="text-[#F4F1EA] opacity-70 mt-2 text-sm max-w-sm">Plataforma Oficial de Pronósticos para el Mundial 2026.</p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-sm font-bold uppercase tracking-widest text-[#F4F1EA] opacity-80 hover:opacity-100 hover:text-[#B8860B] transition-all",
                  focusClasses
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

        </div>
        
        <div className="mt-12 pt-8 border-t border-[#1A1A1A] text-center text-[#F4F1EA] opacity-50 text-xs font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} GVB WORLD CUP. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
