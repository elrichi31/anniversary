"use client";

import { useEffect, useState } from "react";
import BirthdayIntro from "@/components/BirthdayIntro";
import BirthdayStory from "@/components/BirthdayStory";
import Confetti from "@/components/Confetti";
import Starfield from "@/components/Starfield";
import { birthdayConfig, formatUnlockLabel, getUnlockDate } from "@/data/birthday";
import { getCountdownParts, getTogetherParts } from "@/lib/time";

const DEV_FORCE_UNLOCK = process.env.NEXT_PUBLIC_FORCE_UNLOCK === "true";

export default function Home() {
  const [now, setNow] = useState<Date | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const tick = () => setNow(new Date());

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const unlockDate = now ? getUnlockDate(now) : null;
  const unlocked = Boolean(now && unlockDate && unlockDate.getTime() - now.getTime() <= 0);
  const canEnter = DEV_FORCE_UNLOCK || unlocked;

  return (
    <>
      <Starfield />
      <Confetti />
      {entered ? (
        <BirthdayStory together={getTogetherParts(now, birthdayConfig.relationshipStart)} />
      ) : (
        <BirthdayIntro
          name={birthdayConfig.name}
          countdown={getCountdownParts(now, unlockDate)}
          canEnter={canEnter}
          lockedLabel={unlockDate ? formatUnlockLabel(unlockDate) : "Cargando..."}
          onEnter={() => setEntered(true)}
        />
      )}
    </>
  );
}
