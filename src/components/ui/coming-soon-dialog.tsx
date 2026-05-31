import { useEffect, useRef, useState } from "react";
import { X, Sparkles, Smartphone, Shield, BellRing, WifiOff } from "lucide-react";

interface ComingSoonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  platform: "iOS" | "Android" | null;
}

export default function ComingSoonDialog({ isOpen, onClose, platform }: ComingSoonDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-lg overflow-hidden">
      {/* Background Animations */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <CircleAnimation />
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <CharactersAnimation />
      </div>

      {/* Glassmorphic Modal Content Card */}
      <div
        className={`relative z-[110] w-[92%] max-w-xl bg-neutral-950/80 border border-neutral-800 rounded-3xl p-8 md:p-10 shadow-[0_0_50px_rgba(99,102,241,0.15)] transition-all duration-700 transform ${
          isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        {/* Glow effect */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full border border-neutral-800 hover:border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all hover:scale-105"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4 animate-pulse">
            <Sparkles size={12} />
            Coming Soon to {platform || "Mobile"}
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Native Mobile App
          </h3>
          <p className="text-neutral-400 text-sm mt-2 max-w-sm">
            We are wrapping up packaging for {platform === "iOS" ? "Apple TestFlight" : "Google Play Beta"}.
          </p>
        </div>

        {/* Feature List (Shipped With) */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-4 p-3.5 rounded-2xl border border-neutral-900 bg-neutral-900/20 hover:bg-neutral-900/40 transition-colors">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 shrink-0">
              <WifiOff size={20} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Offline Attendance Sync</h4>
              <p className="text-neutral-400 text-xs mt-0.5">
                Check buffers, calculate needed bunks, and view schedules offline. Syncs instantly when online.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3.5 rounded-2xl border border-neutral-900 bg-neutral-900/20 hover:bg-neutral-900/40 transition-colors">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <BellRing size={20} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Instant Push Notifications</h4>
              <p className="text-neutral-400 text-xs mt-0.5">
                Daily checks alert you on your lock screen the second attendance changes are uploaded to ARMS.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3.5 rounded-2xl border border-neutral-900 bg-neutral-900/20 hover:bg-neutral-900/40 transition-colors">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Secure Biometric Keychain</h4>
              <p className="text-neutral-400 text-xs mt-0.5">
                Saved credentials use hardware-level AES-256 encryption locked behind FaceID/Fingerprint scan.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3.5 rounded-2xl border border-neutral-900 bg-neutral-900/20 hover:bg-neutral-900/40 transition-colors">
            <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 shrink-0">
              <Smartphone size={20} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Interactive Lockscreen Widgets</h4>
              <p className="text-neutral-400 text-xs mt-0.5">
                Glance at your overall average percentage and buffer class countdowns without even unlocking.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-lg text-sm"
        >
          Awesome, Notify Me!
        </button>
      </div>
    </div>
  );
}

// Sub-component: Characters Animation
type StickFigure = {
  top?: string;
  bottom?: string;
  src: string;
  transform?: string;
  speedX: number;
  speedRotation?: number;
};

function CharactersAnimation() {
  const charactersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stickFigures: StickFigure[] = [
      {
        top: "5%",
        src: "https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick0.svg",
        transform: "rotateZ(-90deg)",
        speedX: 2000,
      },
      {
        top: "15%",
        src: "https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick1.svg",
        speedX: 3500,
        speedRotation: 2000,
      },
      {
        top: "30%",
        src: "https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick2.svg",
        speedX: 6000,
        speedRotation: 1000,
      },
      {
        bottom: "8%",
        src: "https://raw.githubusercontent.com/RicardoYare/imagenes/9ef29f5bbe075b1d1230a996d87bca313b9b6a63/sticks/stick3.svg",
        speedX: 0,
      },
    ];

    if (charactersRef.current) {
      charactersRef.current.innerHTML = "";
    }

    stickFigures.forEach((figure, index) => {
      const stick = document.createElement("img");
      stick.style.position = "absolute";
      stick.style.width = "14%";
      stick.style.height = "14%";

      if (figure.top) stick.style.top = figure.top;
      if (figure.bottom) stick.style.bottom = figure.bottom;

      stick.src = figure.src;

      if (figure.transform) stick.style.transform = figure.transform;

      charactersRef.current?.appendChild(stick);

      if (index === 3) return;

      stick.animate([{ left: "100%" }, { left: "-20%" }], {
        duration: figure.speedX,
        easing: "linear",
        fill: "forwards",
      });

      if (index === 0) return;

      if (figure.speedRotation) {
        stick.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(-360deg)" }], {
          duration: figure.speedRotation,
          iterations: Infinity,
          easing: "linear",
        });
      }
    });

    return () => {
      if (charactersRef.current) {
        charactersRef.current.innerHTML = "";
      }
    };
  }, []);

  return <div ref={charactersRef} className="absolute w-[99%] h-[95%]" />;
}

// Sub-component: Circle Canvas Animation
interface Circulo {
  x: number;
  y: number;
  size: number;
}

function CircleAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef<number>();
  const timerRef = useRef(0);
  const circulosRef = useRef<Circulo[]>([]);

  const initArr = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    circulosRef.current = [];

    for (let index = 0; index < 150; index++) {
      const randomX =
        Math.floor(Math.random() * (canvas.width * 3 - canvas.width * 1.2 + 1)) +
        canvas.width * 1.2;

      const randomY =
        Math.floor(Math.random() * (canvas.height - canvas.height * -0.2 + 1)) +
        canvas.height * -0.2;

      const size = canvas.width / 1200;

      circulosRef.current.push({ x: randomX, y: randomY, size });
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    timerRef.current++;
    context.setTransform(1, 0, 0, 1, 0, 0);

    const distanceX = canvas.width / 90;
    const growthRate = canvas.width / 1200;

    context.fillStyle = "rgba(255, 255, 255, 0.4)";
    context.clearRect(0, 0, canvas.width, canvas.height);

    circulosRef.current.forEach((circulo) => {
      context.beginPath();

      if (timerRef.current < 65) {
        circulo.x = circulo.x - distanceX;
        circulo.size = circulo.size + growthRate;
      }

      if (timerRef.current > 65 && timerRef.current < 500) {
        circulo.x = circulo.x - distanceX * 0.02;
        circulo.size = circulo.size + growthRate * 0.2;
      }

      context.arc(circulo.x, circulo.y, circulo.size, 0, 360);
      context.fill();
    });

    if (timerRef.current > 500) {
      timerRef.current = 0;
      initArr();
    }

    requestIdRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    timerRef.current = 0;
    initArr();
    draw();

    const handleResize = () => {
      if (!canvas) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      timerRef.current = 0;
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }

      const context = canvas.getContext("2d");
      if (context) {
        context.reset();
      }

      initArr();
      draw();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
