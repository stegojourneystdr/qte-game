import { useEffect, useRef, useState } from "react";

export default function DeadByDaylightStyleQTE() {
  const [needleAngle, setNeedleAngle] = useState(0);
  const [running, setRunning] = useState(false);
  const [hitZone, setHitZone] = useState(300);
  const [result, setResult] = useState("SPACE를 눌러 시작");
  const [speed, setSpeed] = useState(3);
  const [score, setScore] = useState(0);
  const [flashAngle, setFlashAngle] = useState<number | null>(null);

  const angleRef = useRef(0);

  const animationRef = useRef<number | null>(null);

  const zoneSize = 64;
  // 바늘과 판정 영역을 동일한 회전 기준으로 처리

  const startGame = () => {
    setRunning(true);
    setResult("진행 중...");
  };

  const resetZone = () => {
    const random = Math.floor(Math.random() * 360);
    setHitZone(random);
  };

  useEffect(() => {
    if (!running) return;

    const animate = () => {
      setNeedleAngle((prev) => {
        const next = (prev + speed) % 360;
        angleRef.current = next;
        return next;
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [running, speed]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;

      e.preventDefault();

      if (!running) {
        startGame();
        return;
      }

      const current = ((angleRef.current % 360) + 360) % 360;

      const zoneStart = hitZone;
      const zoneEnd = (hitZone + zoneSize) % 360;

      let success = false;

      if (zoneStart <= zoneEnd) {
        success = current >= zoneStart && current <= zoneEnd;
      } else {
        success = current >= zoneStart || current <= zoneEnd;
      }

      // 판정 디버깅용
      console.log({
        current,
        zoneStart,
        zoneEnd,
        success,
      });

      if (success) {
        setResult("GOOD");
        setScore((s) => s + 1);
        setSpeed((s) => Math.min(s + 0.5, 20));
      } else {
        setResult("MISS");
        setScore(0);
        setSpeed(3);
      }

      setFlashAngle(angleRef.current);

      setTimeout(() => {
        setFlashAngle(null);
      }, 1200);

      resetZone();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [hitZone, running, speed]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 gap-6 overflow-hidden">
      <div className="text-center">
        <h1 className="text-5xl font-black tracking-tight">
          우마레이싱 QTE
        </h1>
        <p className="text-zinc-400 mt-2">
          SPACE를 눌러 흰 칸에 맞추세요
        </p>
      </div>

      <div className="relative w-[320px] h-[320px] flex items-center justify-center">
        <div className="absolute w-[220px] h-[220px] rounded-full border-[8px] border-white" />

        <div
          className="absolute w-[220px] h-[220px] rounded-full"
          style={{
            background: `conic-gradient(
              white 0deg ${zoneSize}deg,
              transparent ${zoneSize}deg 360deg
            )`,
            transform: `rotate(${hitZone}deg)`,
            maskImage: "radial-gradient(circle, transparent 58%, black 59%)",
            WebkitMaskImage:
              "radial-gradient(circle, transparent 58%, black 59%)",
            opacity: 0.95,
          }}
        />

        {flashAngle !== null && (
          <div
            className="absolute w-[10px] h-[110px] rounded-full pointer-events-none"
            style={{
              transform: `translateY(-55px) rotate(${flashAngle}deg)`,
              transformOrigin: "bottom center",
              background:
                "linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0))",
              animation: "fadeFlash 1.2s ease-out forwards",
              filter: "blur(2px)",
              opacity: 0.95,
            }}
          />
        )}

        <div
          className="absolute w-[6px] h-[92px] bg-white rounded-full"
          style={{
            transform: `translateY(-46px) rotate(${needleAngle}deg)`,
            transformOrigin: "bottom center",
            boxShadow: "0 0 10px rgba(255,255,255,0.8)",
          }}
        />

        <style>{`
          @keyframes fadeFlash {
            0% {
              opacity: 0.95;
            }
            100% {
              opacity: 0;
            }
          }
        `}</style>

        <div className="absolute px-6 py-2 rounded-xl bg-white text-black font-bold text-2xl shadow-xl border border-zinc-300">
          Space
        </div>
      </div>

      <div className="text-center space-y-2">
        <div className="text-4xl font-black">{result}</div>
        <div className="text-zinc-400">점수: {score}</div>
        <div className="text-zinc-500">속도: {speed.toFixed(1)}</div>
      </div>

      <div className="max-w-md text-center text-zinc-500 leading-relaxed text-sm">
        SPACE 키를 눌러 흰색 판정 구역에 맞추세요.
        <br />
        성공할수록 점점 빨라지고 위치도 계속 바뀝니다.
      </div>
    </div>
  );
}

