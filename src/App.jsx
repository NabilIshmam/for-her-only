import { useEffect, useMemo, useRef, useState } from "react";
import lovesvg from "./assets/All You Need Is Love SVG Cut File.svg";
import lovesvg2 from "./assets/Love In The Air SVG Cut File.svg";

const startOffsetSeconds = 1409 * 86400 + 6 * 3600 + 15 * 60;

const noteFull =
  "Maisha,\n\nFrom the very first moment,\nyou made my world softer,\nbrighter,\nand infinitely more beautiful.\n\nEvery laugh, every memory,\nevery little moment with you\nmeans more to me than words can say.\n\nSo today, and every day,\nI choose you.";

export default function Page() {
  const [hasStarted, setHasStarted] = useState(false);
  const [stage, setStage] = useState("idle");
  const [now, setNow] = useState(new Date());
  const [noAttempts, setNoAttempts] = useState(0);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [noRotate, setNoRotate] = useState(0);
  const [noScale, setNoScale] = useState(1);
  const [noteText, setNoteText] = useState("");
  const [noteDone, setNoteDone] = useState(false);
  const [noDisabled, setNoDisabled] = useState(false);
  const audioRef = useRef(null);
  const noButtonRef = useRef(null);
  const lastMoveRef = useRef(0);
  const fadeRef = useRef(0);
  const startTimeRef = useRef(null);

  const hearts = useMemo(
    () => [
      { src: lovesvg, size: 90, left: "8%", top: "14%", duration: "10s" },
      { src: lovesvg2, size: 110, left: "70%", top: "10%", duration: "12s" },
      { src: lovesvg, size: 70, left: "15%", top: "70%", duration: "9s" },
      { src: lovesvg2, size: 80, left: "78%", top: "68%", duration: "11s" },
      { src: lovesvg, size: 60, left: "45%", top: "78%", duration: "8s" },
    ],
    []
  );

  const setInitialNoPosition = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    setNoPos({ x: width * 0.65, y: height * 0.7 });
  };

  useEffect(() => {
    setInitialNoPosition();
    const handleResize = () => setInitialNoPosition();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [hasStarted]);

  useEffect(() => {
    if (stage !== "note") return;
    setNoteText("");
    setNoteDone(false);
    let index = 0;
    const typing = setInterval(() => {
      index += 1;
      setNoteText(noteFull.slice(0, index));
      if (index >= noteFull.length) {
        clearInterval(typing);
        setNoteDone(true);
      }
    }, 35);
    return () => clearInterval(typing);
  }, [stage]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = true;
    }
  }, []);

  useEffect(() => {
    startTimeRef.current = Date.now();
    setHasStarted(true);
    setNow(new Date());
    if (audioRef.current) {
      audioRef.current.muted = true;
    }
    fadeInAudio();
  }, []);

  useEffect(() => {
    const handleUnlock = () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.muted = false;
      const playPromise = audio.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }
      window.removeEventListener("pointerdown", handleUnlock);
      window.removeEventListener("touchstart", handleUnlock);
      window.removeEventListener("keydown", handleUnlock);
    };
    window.addEventListener("pointerdown", handleUnlock);
    window.addEventListener("touchstart", handleUnlock);
    window.addEventListener("keydown", handleUnlock);
    return () => {
      window.removeEventListener("pointerdown", handleUnlock);
      window.removeEventListener("touchstart", handleUnlock);
      window.removeEventListener("keydown", handleUnlock);
    };
  }, []);

  const formatTimer = () => {
    const elapsedSeconds =
      hasStarted && startTimeRef.current
        ? Math.max(0, Math.floor((now.getTime() - startTimeRef.current) / 1000))
        : 0;
    const totalSeconds = startOffsetSeconds + elapsedSeconds;
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const fadeInAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0;
    const playPromise = audio.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {});
    }
    const start = performance.now();
    const duration = 2000;
    const step = () => {
      const progress = Math.min(1, (performance.now() - start) / duration);
      audio.volume = progress;
      if (progress < 1) {
        fadeRef.current = requestAnimationFrame(step);
      }
    };
    fadeRef.current = requestAnimationFrame(step);
  };

  const updateNoButton = (attempts) => {
    const buttonRect = noButtonRef.current?.getBoundingClientRect();
    const width = window.innerWidth;
    const height = window.innerHeight;
    const margin = 70;
    const maxX = width - (buttonRect?.width || 100) - margin;
    const maxY = height - (buttonRect?.height || 50) - margin;
    const x = Math.max(margin, Math.random() * maxX + margin * 0.4);
    const y = Math.max(margin, Math.random() * maxY + margin);
    setNoPos({ x, y });
    const scale = attempts >= 8 ? 0.35 : Math.max(0.6, 1 - attempts * 0.05);
    setNoScale(scale);
    setNoRotate(Math.random() * 16 - 8);
    if (navigator.vibrate) {
      navigator.vibrate(attempts >= 8 ? 80 : 40);
    }
  };

  const triggerNoEscape = () => {
    setNoAttempts((prev) => {
      const next = prev + 1;
      updateNoButton(next);
      return next;
    });
  };

  const handlePointerMove = (clientX, clientY) => {
    if (stage !== "idle" || noDisabled || !noButtonRef.current) return;
    const nowTime = performance.now();
    if (nowTime - lastMoveRef.current < 140) return;
    const rect = noButtonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(clientX - centerX, clientY - centerY);
    if (distance < 120) {
      lastMoveRef.current = nowTime;
      triggerNoEscape();
    }
  };

  const handleYesClick = () => {
    if (stage !== "idle") return;
    setNoDisabled(true);
    setStage("note");
  };

  const handleReplay = () => {
    setHasStarted(false);
    setStage("idle");
    setNoAttempts(0);
    setNoScale(1);
    setNoRotate(0);
    setNoteText("");
    setNoteDone(false);
    setNoDisabled(false);
    startTimeRef.current = null;
    setInitialNoPosition();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (fadeRef.current) {
      cancelAnimationFrame(fadeRef.current);
    }
  };

  const noButtonText = noAttempts >= 5 ? "Maisha please 🥺" : "No";
  const noSpeed = noAttempts >= 8 ? 80 : 160;

  return (
    <div className="relative h-screen w-screen overflow-hidden text-rose-50 selection:bg-rose-600 selection:text-white">
      <div className="absolute inset-0 romance-bg" />
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" />
      <FloatingHearts hearts={hearts} />
      <div
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center gap-4"
        onMouseMove={(event) => handlePointerMove(event.clientX, event.clientY)}
        onTouchMove={(event) => {
          const touch = event.touches[0];
          if (touch) handlePointerMove(touch.clientX, touch.clientY);
        }}
      >
        {stage !== "note" && (
          <img
            className="h-40 w-40 object-contain rounded-3xl drop-shadow-xl"
            src="https://gifdb.com/images/high/cute-love-bear-roses-ou7zho5oosxnpo6k.webp"
          />
        )}
        <h1
          className={`font-semibold tracking-wide drop-shadow ${
            stage === "note"
              ? "text-2xl sm:text-3xl md:text-4xl"
              : "text-3xl sm:text-4xl md:text-5xl"
          }`}
        >
          {stage === "note" ? "MAISHA SAID YES!!! 💕" : "Maisha, will you be my Valentine?"}
        </h1>
        <div className="text-sm sm:text-base text-rose-100/90">
          We’ve been creating memories for:
        </div>
        <div className="text-lg sm:text-xl font-semibold text-rose-50">
          {formatTimer()}
        </div>

        {stage === "idle" && (
          <div className="flex flex-col items-center gap-3 mt-4">
            <button
              className="bg-rose-500/90 hover:bg-rose-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition"
              onClick={handleYesClick}
            >
              Yes
            </button>
            <button
              ref={noButtonRef}
              onTouchStart={(event) => {
                event.preventDefault();
                triggerNoEscape();
              }}
              onMouseEnter={triggerNoEscape}
              className="bg-rose-900/80 text-rose-50 font-semibold py-3 px-8 rounded-full shadow-lg"
              style={{
                position: "fixed",
                left: noPos.x,
                top: noPos.y,
                transform: `translate(-50%, -50%) scale(${noScale}) rotate(${noRotate}deg)`,
                transition: `left ${noSpeed}ms ease, top ${noSpeed}ms ease, transform 120ms ease`,
                pointerEvents: noDisabled ? "none" : "auto",
              }}
            >
              {noButtonText}
            </button>
          </div>
        )}

        {stage === "note" && (
          <div className="mt-1 w-full max-w-md px-6 py-5 paper-note text-rose-900">
            <div className="mx-auto mb-3 w-32 sm:w-36">
              <div className="relative w-full" style={{ paddingTop: "83.5%" }}>
                <iframe
                  src="https://tenor.com/embed/20345042"
                  className="absolute inset-0 h-full w-full rounded-2xl"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            </div>
            <div className="font-handmade whitespace-pre-line text-lg sm:text-xl leading-relaxed">
              {noteText}
            </div>
          </div>
        )}

        {noteDone && (
          <button
            className="mt-6 text-rose-100/80 hover:text-rose-50 text-sm sm:text-base border border-rose-200/40 px-4 py-2 rounded-full backdrop-blur-sm transition"
            onClick={handleReplay}
          >
            Replay Our Moment 💞
          </button>
        )}
      </div>

      {stage === "fireworks" && (
        <FireworksCanvas
          onComplete={() => {
            setNoDisabled(true);
            setStage("note");
          }}
        />
      )}

      <video
        ref={audioRef}
        src="/blue.mp4"
        preload="auto"
        autoPlay
        muted
        playsInline
        loop
        className="hidden"
      />
    </div>
  );
}

const FloatingHearts = ({ hearts }) => {
  return (
    <div className="absolute inset-0 -z-0 pointer-events-none">
      {hearts.map((heart, index) => (
        <img
          key={`${heart.left}-${index}`}
          src={heart.src}
          className="absolute opacity-70 heart-float"
          style={{
            width: heart.size,
            left: heart.left,
            top: heart.top,
            animationDuration: heart.duration,
          }}
        />
      ))}
    </div>
  );
};

const FireworksCanvas = ({ onComplete }) => {
  const canvasRef = useRef(null);
  const completedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const colors = ["#ff5da2", "#ff3b6a", "#ffd1e8", "#ffb347"];
    let rockets = [];
    let particles = [];
    let animationId = 0;
    let running = true;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { innerWidth, innerHeight } = window;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      canvas.style.width = `${innerWidth}px`;
      canvas.style.height = `${innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const createExplosion = (x, y) => {
      const count = 18 + Math.floor(Math.random() * 12);
      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = Math.random() * 2 + 1;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 60 + Math.random() * 20,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const launchRocket = () => {
      rockets.push({
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 10,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(Math.random() * 2 + 2.8),
        explodeAt: Math.random() * window.innerHeight * 0.5 + 120,
      });
    };

    const tick = () => {
      if (!running) return;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      rockets.forEach((rocket, index) => {
        rocket.x += rocket.vx;
        rocket.y += rocket.vy;
        rocket.vy += 0.02;
        ctx.fillStyle = "#ffd1e8";
        ctx.fillRect(rocket.x, rocket.y, 2, 2);
        if (rocket.y <= rocket.explodeAt) {
          createExplosion(rocket.x, rocket.y);
          rockets.splice(index, 1);
        }
      });
      particles = particles.filter((particle) => particle.life > 0);
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.03;
        particle.life -= 1;
        ctx.globalAlpha = Math.max(0, particle.life / 80);
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    const launchInterval = setInterval(launchRocket, 420);
    animationId = requestAnimationFrame(tick);

    const stopTimer = setTimeout(() => {
      running = false;
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    }, 5000);

    return () => {
      running = false;
      clearInterval(launchInterval);
      clearTimeout(stopTimer);
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 pointer-events-none"
    />
  );
};
