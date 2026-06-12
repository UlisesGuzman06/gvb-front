export const theme = {
  colors: {
    background: {
      primary: 'bg-[#F4F1EA]',
      secondary: 'bg-[#E8E2D6]',
      dark: 'bg-[#0B2545]',
      darker: 'bg-[#13315C]',
      white: 'bg-white',
    },
    text: {
      primary: 'text-[#111111]',
      secondary: 'text-[#5A5A5A]',
      light: 'text-[#F4F1EA]',
      gold: 'text-[#B8860B]',
      success: 'text-[#2D6A4F]',
      error: 'text-[#B00020]',
    },
    border: {
      primary: 'border-[#111111]',
      light: 'border-[#E8E2D6]',
      gold: 'border-[#B8860B]',
      dark: 'border-[#0B2545]',
    }
  },
  typography: {
    heading: 'font-bebas tracking-wide',
    body: 'font-inter',
    numbers: 'font-space font-medium tracking-tight',
  },
  layout: {
    section: 'py-16 md:py-24',
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    card: 'border border-[#111111] bg-white p-6 shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(17,17,17,1)]', 
    // Usamos solid shadows para mantener el diseño premium de esquinas rectas y brutalismo elegante
  }
}
