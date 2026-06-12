'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';
import { useMatches } from '@/hooks/useMatches';
import { theme } from '@/styles/theme';
import { cn } from '@/lib/utils';
import { ArrowLeft, User, Mail, Lock, Shield, CheckCircle, AlertCircle, Trophy, Target, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { user, setUser } = useAppStore();
  const { data: allMatches = [] } = useMatches();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  // 1 = account info, 2 = bonus predictions
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Bonus predictions state
  const [champion, setChampion] = useState('');
  const [subchampion, setSubchampion] = useState('');
  const [topScorer, setTopScorer] = useState('');
  const [goldenBall, setGoldenBall] = useState('');
  const [goldenGlove, setGoldenGlove] = useState('');
  
  // Feedback States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8860B]";

  // Only include real group-stage teams (no knockout placeholders like W1, L2, TBD, Runner-up, etc.)
  const PLACEHOLDER_PATTERNS = /^(W|L|Runner|Winner|Loser|TBD|\d)/i;
  const teamsList = useMemo(() => {
    const teams = new Set<string>();
    allMatches.forEach(m => {
      // Only include teams from group stage matches
      const isGroupMatch = m.round?.toLowerCase().includes('matchday') || m.group;
      if (!isGroupMatch) return;
      if (m.home?.name && !PLACEHOLDER_PATTERNS.test(m.home.name)) teams.add(m.home.name);
      if (m.away?.name && !PLACEHOLDER_PATTERNS.test(m.away.name)) teams.add(m.away.name);
    });
    return Array.from(teams).sort();
  }, [allMatches]);

  // Subchampion list excludes whatever is selected as champion
  const subchampionList = useMemo(() => teamsList.filter(t => t !== champion), [teamsList, champion]);

  // Redirect if already logged in
  useEffect(() => {
    const storedUser = localStorage.getItem('gvb_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (!user || user.id !== parsed.id) {
        setUser(parsed);
      }
      router.push('/prode');
    } else if (user) {
      router.push('/prode');
    }
  }, [user, router, setUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.message || 'Credenciales incorrectas o error en el servidor.');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      localStorage.setItem('gvb_user', JSON.stringify(data.user));
      setUser(data.user, data.access_token);
      setSuccess('¡Sesión iniciada con éxito! Redirigiendo...');
      setTimeout(() => router.push('/prode'), 1000);
    } catch (err) {
      setError('Error de conexión con el servidor.');
      setIsLoading(false);
    }
  };

  const handleRegisterStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    // Pre-check if email is already taken before moving to step 2
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:4000/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.message || 'Ese correo ya está registrado.');
        setIsLoading(false);
        return;
      }
    } catch {
      // If endpoint doesn't exist yet, skip pre-check — backend will reject on submit
    }
    setIsLoading(false);
    setRegisterStep(2);
  };

  const handleRegisterStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!champion || !subchampion || !topScorer) {
      setError('Por favor, completa al menos el Campeón, Subcampeón y Goleador.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, champion, subchampion, topScorer, goldenBall, goldenGlove }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.message || 'Error al registrar el usuario.');
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      localStorage.setItem('gvb_user', JSON.stringify(data.user));
      setUser(data.user, data.access_token);
      setSuccess('¡Registro completado! Redirigiendo al Prode...');
      setTimeout(() => router.push('/prode'), 1000);
    } catch (err) {
      setError('Error de conexión con el servidor.');
      setIsLoading(false);
    }
  };

  const SelectField = ({ label, value, onChange, icon, teams }: { label: string; value: string; onChange: (v: string) => void; icon?: React.ReactNode; teams?: string[] }) => {
    const options = teams ?? teamsList;
    return (
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-[#B8860B] mb-2">
          {label}
        </label>
        <div className="relative">
          {icon && <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none z-10">{icon}</span>}
          <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className={cn(
              "block w-full border-2 border-[#111111] bg-[#0B2545] text-white font-inter text-sm py-3 appearance-none",
              icon ? "pl-10 pr-3" : "px-3",
              focusClasses
            )}
          >
            <option value="">-- Seleccionar --</option>
            {options.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B2545] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        
        {/* BACK BUTTON */}
        <div className="mb-6 text-center sm:text-left px-4">
          <Link 
            href="/" 
            className={cn(
              "inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#B8860B] hover:text-white transition-colors",
              focusClasses
            )}
          >
            <ArrowLeft size={16} /> Volver al Inicio
          </Link>
        </div>

        {/* LOGO / TITLE */}
        <h2 className={cn("text-center text-4xl sm:text-5xl text-white tracking-widest uppercase mb-8", theme.typography.heading)}>
          GVB <span className="text-[#B8860B]">WORLD CUP</span>
        </h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-[#13315C] border-2 border-[#111111] shadow-[8px_8px_0px_0px_#111111] overflow-hidden">
          
          {/* TAB BUTTONS */}
          <div className="flex border-b-2 border-[#111111]">
            <button
              onClick={() => {
                setActiveTab('login');
                setError('');
                setSuccess('');
                setRegisterStep(1);
              }}
              className={cn(
                "flex-1 py-4 text-sm font-bold uppercase tracking-widest border-r-2 border-[#111111] transition-colors",
                activeTab === 'login' 
                  ? "bg-[#B8860B] text-[#111111]" 
                  : "bg-[#0B2545] text-gray-400 hover:text-white"
              )}
            >
              Ingresar
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setError('');
                setSuccess('');
                setRegisterStep(1);
              }}
              className={cn(
                "flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors",
                activeTab === 'register' 
                  ? "bg-[#B8860B] text-[#111111]" 
                  : "bg-[#0B2545] text-gray-400 hover:text-white"
              )}
            >
              Registrarse
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* NOTIFICATIONS */}
            {error && (
              <div className="bg-red-950/40 border-2 border-[#B00020] text-[#F4F1EA] p-4 flex gap-3 items-start text-sm">
                <AlertCircle className="text-[#B00020] shrink-0 mt-0.5" size={18} />
                <div>{error}</div>
              </div>
            )}

            {success && (
              <div className="bg-green-950/40 border-2 border-[#2D6A4F] text-[#F4F1EA] p-4 flex gap-3 items-start text-sm">
                <CheckCircle className="text-[#2D6A4F] shrink-0 mt-0.5" size={18} />
                <div>{success}</div>
              </div>
            )}

            {activeTab === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#B8860B] mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@gvb.com"
                      required
                      className={cn(
                        "block w-full pl-10 pr-3 py-3 border-2 border-[#111111] bg-[#0B2545] text-white placeholder-gray-500 font-inter text-sm",
                        focusClasses
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#B8860B] mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="******"
                      required
                      className={cn(
                        "block w-full pl-10 pr-3 py-3 border-2 border-[#111111] bg-[#0B2545] text-white placeholder-gray-500 font-inter text-sm",
                        focusClasses
                      )}
                    />
                  </div>
                </div>



                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "w-full bg-[#B8860B] text-[#111111] py-3.5 text-sm font-bold uppercase tracking-widest border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#111111] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50",
                      focusClasses
                    )}
                  >
                    {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
                  </button>
                </div>
              </form>
            ) : (
              /* REGISTER FORM — 2 STEPS */
              <div>

                {/* Step Indicator */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={cn(
                    "w-8 h-8 flex items-center justify-center font-bold text-sm border-2 border-[#111111] transition-colors",
                    registerStep >= 1 ? "bg-[#B8860B] text-[#111111]" : "bg-[#0B2545] text-gray-500"
                  )}>1</div>
                  <div className="flex-1 h-0.5 bg-gray-700">
                    <div className={cn("h-full bg-[#B8860B] transition-all", registerStep >= 2 ? "w-full" : "w-0")} />
                  </div>
                  <div className={cn(
                    "w-8 h-8 flex items-center justify-center font-bold text-sm border-2 border-[#111111] transition-colors",
                    registerStep >= 2 ? "bg-[#B8860B] text-[#111111]" : "bg-[#0B2545] text-gray-500"
                  )}>2</div>
                  <div className="text-xs text-gray-400 font-mono shrink-0">
                    {registerStep === 1 ? 'Tu cuenta' : 'Tus pronósticos'}
                  </div>
                </div>

                {registerStep === 1 ? (
                  /* STEP 1: Account info */
                  <form onSubmit={handleRegisterStep1} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-[#B8860B] mb-2">
                        Nombre / Apodo
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                          <User size={18} />
                        </span>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Juan Pérez"
                          required
                          className={cn(
                            "block w-full pl-10 pr-3 py-3 border-2 border-[#111111] bg-[#0B2545] text-white placeholder-gray-500 font-inter text-sm",
                            focusClasses
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-[#B8860B] mb-2">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                          <Mail size={18} />
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nombre@ejemplo.com"
                          required
                          className={cn(
                            "block w-full pl-10 pr-3 py-3 border-2 border-[#111111] bg-[#0B2545] text-white placeholder-gray-500 font-inter text-sm",
                            focusClasses
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-[#B8860B] mb-2">
                        Contraseña
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                          <Lock size={18} />
                        </span>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Mínimo 6 caracteres"
                          required
                          minLength={6}
                          className={cn(
                            "block w-full pl-10 pr-3 py-3 border-2 border-[#111111] bg-[#0B2545] text-white placeholder-gray-500 font-inter text-sm",
                            focusClasses
                          )}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={cn(
                        "w-full bg-[#B8860B] text-[#111111] py-3.5 text-sm font-bold uppercase tracking-widest border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#111111] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2",
                        focusClasses
                      )}
                    >
                      Siguiente <ChevronRight size={16} />
                    </button>
                  </form>
                ) : (
                  /* STEP 2: Bonus predictions */
                  <form onSubmit={handleRegisterStep2} className="space-y-5">
                    <div className="bg-[#0B2545] border border-[#B8860B]/40 p-3 text-xs text-gray-300 font-inter">
                      <span className="text-[#B8860B] font-bold">★ Pronósticos Especiales:</span> Elegí tus ganadores antes de que empiece el mundial. Estos se bloquean al inicio del torneo y no se pueden cambiar.
                    </div>

                    <div className="space-y-4">
                      <SelectField
                        label="Campeón del Mundo (+10 pts)"
                        value={champion}
                        onChange={(v) => { setChampion(v); if (v === subchampion) setSubchampion(''); }}
                        icon={<Trophy size={16} />}
                      />

                      <SelectField
                        label="Subcampeón (+5 pts)"
                        value={subchampion}
                        onChange={setSubchampion}
                        icon={<Trophy size={16} />}
                        teams={subchampionList}
                      />

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#B8860B] mb-2">
                          Goleador / Bota de Oro (+5 pts)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                            <Target size={16} />
                          </span>
                          <input
                            type="text"
                            value={topScorer}
                            onChange={e => setTopScorer(e.target.value)}
                            placeholder="Ej: Lionel Messi"
                            className={cn(
                              "block w-full pl-10 pr-3 py-3 border-2 border-[#111111] bg-[#0B2545] text-white placeholder-gray-500 font-inter text-sm",
                              focusClasses
                            )}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#B8860B] mb-2">
                          Balón de Oro / Mejor Jugador (+5 pts)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                            <Sparkles size={16} />
                          </span>
                          <input
                            type="text"
                            value={goldenBall}
                            onChange={e => setGoldenBall(e.target.value)}
                            placeholder="Ej: Erling Haaland"
                            className={cn(
                              "block w-full pl-10 pr-3 py-3 border-2 border-[#111111] bg-[#0B2545] text-white placeholder-gray-500 font-inter text-sm",
                              focusClasses
                            )}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-[#B8860B] mb-2">
                          Guante de Oro / Mejor Arquero (+5 pts)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                            <Shield size={16} />
                          </span>
                          <input
                            type="text"
                            value={goldenGlove}
                            onChange={e => setGoldenGlove(e.target.value)}
                            placeholder="Ej: Emiliano Martínez"
                            className={cn(
                              "block w-full pl-10 pr-3 py-3 border-2 border-[#111111] bg-[#0B2545] text-white placeholder-gray-500 font-inter text-sm",
                              focusClasses
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => { setRegisterStep(1); setError(''); }}
                        className={cn(
                          "flex-1 bg-[#0B2545] text-gray-300 py-3 text-sm font-bold uppercase tracking-widest border-2 border-[#111111] hover:text-white transition-colors",
                          focusClasses
                        )}
                      >
                        Atrás
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className={cn(
                          "flex-[2] bg-[#B8860B] text-[#111111] py-3 text-sm font-bold uppercase tracking-widest border-2 border-[#111111] shadow-[4px_4px_0px_0px_#111111] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#111111] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50",
                          focusClasses
                        )}
                      >
                        {isLoading ? 'Registrando...' : '¡Unirse al Prode!'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5 font-bold uppercase tracking-widest">
          <Shield size={14} className="text-[#B8860B]" /> Conexión Local Segura GVB World Cup
        </div>

      </div>
    </div>
  );
}
