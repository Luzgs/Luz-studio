import { useState, useEffect } from 'react';
import { Check, MapPin, Home, Calendar, Clock, Phone, CreditCard, User, Sparkles, Image as ImageIcon, RefreshCw } from 'lucide-react';

// --- CONSTANTES ---
const WHATSAPP_NUMBER = '584121822751'; 
const DISCOUNT_PERCENTAGE = 0.10; 
const DOMICILIO_FEE_EUR = 3;
const HORARIO = 'Lunes a Sábado: 8am - 8pm';
const FALLBACK_EURO_RATE = 42.85; // Tasa de emergencia

// Direcciones de los estudios
const DIRECCIONES_ESTUDIO = {
  bebedero: 'Av. 03 Principal de Bebedero, Cumaná.',
  campeche: 'Campeche, Villa Campestre calle 4, Cumaná.'
};

const INVENTORY = [
  { id: 's1', category: 'Cejas', name: 'Cejas Depiladas y Pigmentado', priceEur: 5 },
  { id: 's2', category: 'Pestañas', name: 'Pestañas por Punto', priceEur: 10 },
  { id: 's3', category: 'Depilación', name: 'Depilación Bozo', priceEur: 2 },
  { id: 's4', category: 'Cejas', name: 'Laminado de Cejas', priceEur: 15 },
  { id: 's5', category: 'Pestañas', name: 'Lifting de Pestañas', priceEur: 15 },
];

const PAGO_MOVIL = {
  banco: '0102 - Banco de Venezuela',
  cedula: 'V-29.760.300',
  telefono: '0412-1822751'
};

// --- GALERÍA DE FOTOS (Tus enlaces reales de ImgBB) ---
const GALLERY_IMAGES = [
  'https://i.ibb.co/604W08Fx/IMG-20260221-215909.jpg',
  'https://i.ibb.co/mCn97rLP/IMG-20260221-215905.jpg',
  'https://i.ibb.co/rKwKsnk1/IMG-20251231-164705.jpg',
  'https://i.ibb.co/RTmQ2wh1/IMG-20251229-172249.jpg',
  'https://i.ibb.co/BKyNSVmy/IMG-20251127-163335.jpg',
  'https://i.ibb.co/KxTFvpND/IMG-20251123-133548.jpg',
  'https://i.ibb.co/pBKqWYjH/IMG-20251122-182335.jpg',
  'https://i.ibb.co/PZLYnntx/IMG-20251121-000313.jpg',
  'https://i.ibb.co/fY7RDRSz/IMG-20250831-WA0238-075245.jpg',
  'https://i.ibb.co/gYYdcdr/Screenshot-20250912-144833-Photos-075239.jpg',
  'https://i.ibb.co/VYDXSFLx/IMG-20260305-021528.jpg'
];

// Componente Logo (SVG)
const LogoLG = () => (
  <svg viewBox="0 0 300 160" className="w-full h-32 max-w-[250px] mx-auto drop-shadow-md">
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#BF953F" />
        <stop offset="25%" stopColor="#FCF6BA" />
        <stop offset="50%" stopColor="#B38728" />
        <stop offset="75%" stopColor="#FBF5B7" />
        <stop offset="100%" stopColor="#AA771C" />
      </linearGradient>
    </defs>
    <text x="130" y="110" fontFamily="'Playfair Display', 'Georgia', serif" fontSize="110" fontWeight="bold" textAnchor="middle" fill="#111" letterSpacing="-10">
      L
    </text>
    <text x="175" y="110" fontFamily="'Playfair Display', 'Georgia', serif" fontSize="110" fontWeight="bold" textAnchor="middle" fill="url(#goldGradient)">
      G
    </text>
    <text x="150" y="145" fontFamily="sans-serif" fontSize="13" fontWeight="300" textAnchor="middle" fill="#333" letterSpacing="4">
      CEJAS Y PESTAÑAS
    </text>
  </svg>
);

const App = () => {
  // Ajustes estrictos de TypeScript añadidos: <any[]>, :any
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    modality: 'estudio',
    selectedStudio: 'bebedero', // Por defecto seleccionado
    address: ''
  });
  const [showGallery, setShowGallery] = useState(false);
  
  // Estados para la Tasa del Euro
  const [euroRate, setEuroRate] = useState(FALLBACK_EURO_RATE);
  const [isRateLoading, setIsRateLoading] = useState(true);

  // EFECTO: Obtener la tasa del Euro automáticamente
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch('https://ve.dolarapi.com/v1/euros/oficial');
        if (!response.ok) throw new Error('Error en la red');
        
        const data = await response.json();
        if (data && data.promedio) {
          setEuroRate(data.promedio);
        }
      } catch (error) {
        console.error("No se pudo obtener la tasa, usando tasa de emergencia:", error);
      } finally {
        setIsRateLoading(false);
      }
    };

    fetchRate();
  }, []);

  // --- CÁLCULOS ---
  const subtotalEur = selectedServices.reduce((sum: number, service: any) => sum + service.priceEur, 0);
  const hasDiscount = selectedServices.length >= 2;
  const discountAmountEur = hasDiscount ? (subtotalEur * DISCOUNT_PERCENTAGE) : 0;
  const domicilioFeeEur = formData.modality === 'domicilio' ? DOMICILIO_FEE_EUR : 0;
  const totalEur = subtotalEur - discountAmountEur + domicilioFeeEur;

  const eurToBs = (amountEur: any) => (amountEur * euroRate).toFixed(2);

  // --- MANEJO DE ESTADO ---
  const toggleService = (service: any) => {
    setSelectedServices((prev: any[]) => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      }
      return [...prev, service];
    });
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- WHATSAPP CHECKOUT ---
  const handleWhatsAppCheckout = () => {
    if (selectedServices.length === 0) {
      alert('Por favor selecciona al menos un servicio.');
      return;
    }
    if (!formData.name || !formData.date || !formData.time) {
      alert('Por favor completa tu nombre, fecha y hora de la cita.');
      return;
    }
    if (formData.modality === 'domicilio' && !formData.address) {
      alert('Por favor indica la dirección para el servicio a domicilio.');
      return;
    }

    let message = `✨ *SOLICITUD DE CITA - LUZ GUZMÁN* ✨\n\n`;
    message += `👤 *Cliente:* ${formData.name}\n`;
    message += `📅 *Fecha:* ${formData.date}\n`;
    message += `⏰ *Hora:* ${formData.time}\n`;
    message += `📍 *Modalidad:* ${formData.modality === 'estudio' ? 'En el Estudio' : 'A Domicilio'}\n`;

    if (formData.modality === 'estudio') {
       message += `🏢 *Sede elegida:* ${formData.selectedStudio === 'bebedero' ? 'Sede Bebedero' : 'Sede Campeche'}\n`;
    } else if (formData.modality === 'domicilio') {
      message += `🏠 *Dirección:* ${formData.address}\n`;
    }

    message += `\n💅 *SERVICIOS SELECCIONADOS:*\n`;
    selectedServices.forEach(s => {
      message += `- ${s.name} (€${s.priceEur.toFixed(2)})\n`;
    });

    message += `\n💰 *RESUMEN DE PAGO (Tasa Oficial: ${euroRate} Bs/€):*\n`;
    message += `Subtotal: €${subtotalEur.toFixed(2)} / Bs.${eurToBs(subtotalEur)}\n`;
    if (hasDiscount) {
      message += `🎁 Descuento Promo (10%): -€${discountAmountEur.toFixed(2)} / -Bs.${eurToBs(discountAmountEur)}\n`;
    }
    if (formData.modality === 'domicilio') {
      message += `🚗 Costo Domicilio: +€${domicilioFeeEur.toFixed(2)} / +Bs.${eurToBs(domicilioFeeEur)}\n`;
    }
    message += `\n*TOTAL A PAGAR: €${totalEur.toFixed(2)} / Bs.${eurToBs(totalEur)}*\n\n`;
    message += `💳 *Método de Pago:* Pago Móvil / Efectivo\n`;
    message += `(Por favor, si ya realizaste el pago móvil, envía el comprobante por aquí).\n\n`;
    message += `¡Gracias! Espero la confirmación de la cita. 💖`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fcfaf5] font-sans text-gray-800 pb-24 selection:bg-[#B38728] selection:text-white">

      {/* HEADER */}
      <header className="bg-white shadow-sm py-10 px-6 text-center rounded-b-3xl border-b-4 border-[#B38728]">
        <div className="mb-2">
          <LogoLG />
        </div>
        <p className="text-gray-500 text-sm mt-4 max-w-md mx-auto italic">
          "Resalta tu belleza natural. Agenda tu cita y luce radiante."
        </p>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-8 space-y-6">

        {/* TASA DE CAMBIO BANNER */}
        <div className="bg-[#fffdf5] border border-[#ebd8b0] rounded-xl p-3 flex items-center justify-center text-sm shadow-sm">
          {isRateLoading ? (
            <span className="flex items-center text-gray-500">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Consultando tasa del día...
            </span>
          ) : (
            <span className="text-[#8a6519] font-medium flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              Tasa del día (BCV): <strong className="ml-1 text-lg"> {euroRate} Bs/€</strong>
            </span>
          )}
        </div>

        {/* SECCIÓN: SERVICIOS */}
        <section className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-[#f5ead5]">
          <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
            <span className="bg-gradient-to-r from-[#BF953F] to-[#B38728] text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 text-sm font-bold shadow-md">1</span>
            Elige tus Servicios
          </h2>

          {hasDiscount && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-5 text-sm font-medium animate-pulse flex items-center shadow-sm">
              <Sparkles className="w-5 h-5 mr-2 text-green-500" />
              ¡Felicidades! Tienes un 10% de descuento. 🎉
            </div>
          )}

          <div className="space-y-3">
            {INVENTORY.map((service) => {
              const isSelected = selectedServices.some(s => s.id === service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service)}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                    isSelected ? 'border-[#B38728] bg-[#fffdf5] shadow-md transform scale-[1.01]' : 'border-gray-100 hover:border-[#ebd8b0] bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${isSelected ? 'bg-gradient-to-br from-[#BF953F] to-[#AA771C] border-transparent' : 'border-gray-300 bg-white'}`}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm sm:text-base ${isSelected ? 'text-[#8a6519]' : 'text-gray-700'}`}>{service.name}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">{service.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${isSelected ? 'text-[#B38728]' : 'text-gray-600'}`}>
                      €{service.priceEur.toFixed(2)}
                    </p>
                    {!isRateLoading && (
                      <p className="text-xs text-gray-400">
                        Bs. {eurToBs(service.priceEur)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECCIÓN: GALERÍA */}
        <section className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-[#f5ead5]">
          <div className="flex items-center justify-between cursor-pointer group" onClick={() => setShowGallery(!showGallery)}>
            <h2 className="text-xl font-bold text-gray-800 flex items-center group-hover:text-[#B38728] transition-colors">
              <ImageIcon className="w-6 h-6 mr-3 text-[#B38728]" />
              Nuestros Trabajos
            </h2>
            <button className="text-[#B38728] bg-[#fffdf5] px-4 py-1.5 rounded-full font-medium text-sm border border-[#ebd8b0] group-hover:bg-[#B38728] group-hover:text-white transition-all">
              {showGallery ? 'Ocultar' : 'Ver Galería'}
            </button>
          </div>
          
          {showGallery && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
              {GALLERY_IMAGES.map((src, index) => (
                <div key={index} className="rounded-xl overflow-hidden shadow-sm border border-gray-100 aspect-square bg-gray-50 flex items-center justify-center">
                  <img src={src} alt={`Resultado de trabajo ${index + 1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" loading="lazy" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* SECCIÓN: DATOS DE LA CITA */}
        <section className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-[#f5ead5]">
          <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
            <span className="bg-gradient-to-r from-[#BF953F] to-[#B38728] text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 text-sm font-bold shadow-md">2</span>
            Detalles de la Cita
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Tu nombre y apellido"
                  className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B38728] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Fecha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B38728] outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hora</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="pl-10 w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B38728] outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">¿Dónde será el servicio?</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, modality: 'estudio' })}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    formData.modality === 'estudio' ? 'border-[#B38728] bg-[#fffdf5] text-[#8a6519] shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <MapPin className="w-6 h-6 mb-2" />
                  <span className="font-medium text-sm">En el Estudio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, modality: 'domicilio' })}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    formData.modality === 'domicilio' ? 'border-[#B38728] bg-[#fffdf5] text-[#8a6519] shadow-sm' : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Home className="w-6 h-6 mb-2" />
                  <span className="font-medium text-sm">A Domicilio</span>
                </button>
              </div>
            </div>

            {/* Selector de Sede o Dirección Domicilio */}
            {formData.modality === 'estudio' ? (
              <div className="bg-gradient-to-r from-[#fffdf5] to-[#f5ead5] p-4 rounded-xl border border-[#ebd8b0] mt-3">
                 <label className="block text-sm font-semibold text-[#8a6519] mb-2 flex items-center">
                   <MapPin className="w-4 h-4 mr-1 text-[#B38728]" />
                   Elige la Sede:
                 </label>
                 <div className="space-y-2">
                   <label className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${formData.selectedStudio === 'bebedero' ? 'bg-white border-[#B38728] shadow-sm' : 'border-transparent hover:bg-white/50'}`}>
                      <input 
                        type="radio" 
                        name="selectedStudio" 
                        value="bebedero" 
                        checked={formData.selectedStudio === 'bebedero'}
                        onChange={handleInputChange}
                        className="mt-1 text-[#B38728] focus:ring-[#B38728]"
                      />
                      <span className="ml-2 text-sm text-gray-700"><strong>Sede Bebedero:</strong> <br/>{DIRECCIONES_ESTUDIO.bebedero}</span>
                   </label>
                   <label className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${formData.selectedStudio === 'campeche' ? 'bg-white border-[#B38728] shadow-sm' : 'border-transparent hover:bg-white/50'}`}>
                      <input 
                        type="radio" 
                        name="selectedStudio" 
                        value="campeche" 
                        checked={formData.selectedStudio === 'campeche'}
                        onChange={handleInputChange}
                        className="mt-1 text-[#B38728] focus:ring-[#B38728]"
                      />
                      <span className="ml-2 text-sm text-gray-700"><strong>Sede Campeche:</strong> <br/>{DIRECCIONES_ESTUDIO.campeche}</span>
                   </label>
                 </div>
              </div>
            ) : (
              <div className="mt-2 space-y-3">
                <div className="bg-amber-50 p-3 rounded-lg text-sm text-amber-800 flex items-center border border-amber-200">
                  <Home className="w-5 h-5 mr-2 text-amber-600" />
                  <span>Se aplica un costo adicional de <strong>€{DOMICILIO_FEE_EUR} {!isRateLoading && `/ Bs.${eurToBs(DOMICILIO_FEE_EUR)}`}</strong> por traslado.</span>
                </div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección a Domicilio</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Ej. Sector, Urbanización, Casa/Apto, Punto de referencia."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#B38728] outline-none min-h-[80px] transition-all"
                />
              </div>
            )}
          </div>
        </section>

        {/* SECCIÓN: RESUMEN Y PAGO */}
        <section className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-[#f5ead5]">
          <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
            <span className="bg-gradient-to-r from-[#BF953F] to-[#B38728] text-white rounded-full w-7 h-7 flex items-center justify-center mr-3 text-sm font-bold shadow-md">3</span>
            Resumen y Pago
          </h2>

          <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-[#B38728]" />
              Datos de Pago Móvil
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-gray-500">Banco:</span> 
                <span className="font-semibold">{PAGO_MOVIL.banco}</span>
              </p>
              <p className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-gray-500">Cédula:</span> 
                <span className="font-semibold">{PAGO_MOVIL.cedula}</span>
              </p>
              <p className="flex justify-between pb-1">
                <span className="text-gray-500">Teléfono:</span> 
                <span className="font-semibold">{PAGO_MOVIL.telefono}</span>
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-5 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({selectedServices.length} servicios)</span>
              <span>€{subtotalEur.toFixed(2)} {!isRateLoading && `/ Bs.${eurToBs(subtotalEur)}`}</span>
            </div>
            {hasDiscount && (
              <div className="flex justify-between text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                <span>Descuento Promoción (10%)</span>
                <span>-€{discountAmountEur.toFixed(2)} {!isRateLoading && `/ -Bs.${eurToBs(discountAmountEur)}`}</span>
              </div>
            )}
            {formData.modality === 'domicilio' && (
              <div className="flex justify-between text-[#B38728] font-medium bg-[#fffdf5] px-2 py-1 rounded">
                <span>Costo por Domicilio</span>
                <span>+€{domicilioFeeEur.toFixed(2)} {!isRateLoading && `/ +Bs.${eurToBs(domicilioFeeEur)}`}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-black text-gray-900 pt-3 border-t border-gray-200 mt-2">
              <span>Total a Pagar</span>
              <div className="text-right">
                <span className="block text-2xl text-[#B38728]">€{totalEur.toFixed(2)}</span>
                {!isRateLoading && (
                  <span className="text-sm text-gray-500 font-medium">Bs. {eurToBs(totalEur)}</span>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-white py-8 mt-12 text-center text-gray-500 text-sm border-t border-gray-200 pb-32">
        <p className="font-bold text-gray-700 mb-3 uppercase tracking-widest text-xs">Luz Guzmán - Cejas y Pestañas</p>
        <p className="flex items-center justify-center mb-1">
          <Clock className="w-4 h-4 mr-2" />
          Horario: {HORARIO}
        </p>
        <p className="flex items-center justify-center mt-1 mb-1">
          <MapPin className="w-4 h-4 mr-2" />
          Sede 1: {DIRECCIONES_ESTUDIO.bebedero}
        </p>
        <p className="flex items-center justify-center mb-4">
          <MapPin className="w-4 h-4 mr-2 text-transparent" />
          Sede 2: {DIRECCIONES_ESTUDIO.campeche}
        </p>
      </footer>

      {/* BOTÓN FLOTANTE PARA ENVIAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-15px_30px_-15px_rgba(0,0,0,0.1)] z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium">Total a Pagar</p>
            <p className="text-2xl font-black text-[#B38728]">
              €{totalEur.toFixed(2)} 
              {!isRateLoading && (
                <span className="text-xs text-gray-400 font-medium block -mt-1">Bs.{eurToBs(totalEur)}</span>
              )}
            </p>
          </div>
          <button
            onClick={handleWhatsAppCheckout}
            disabled={selectedServices.length === 0}
            className={`flex items-center px-6 py-3.5 rounded-xl font-bold text-white transition-all shadow-lg ${
              selectedServices.length === 0
                ? 'bg-gray-300 cursor-not-allowed shadow-none'
                : 'bg-[#25D366] hover:bg-[#20b858] active:scale-95'
            }`}
          >
            <Phone className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Agendar por WhatsApp</span>
            <span className="sm:hidden">Agendar</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default App;