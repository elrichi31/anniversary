// Todo lo personalizable de la celebracion vive aqui.
// Edita estos valores y el resto del proyecto se actualiza solo.

export const birthdayConfig = {
  // Nombre (o apodo) de la cumpleanera.
  name: "Preciosa",

  // Fecha de su cumpleanos (mes 1-12, dia) y cuantos cumple este ano.
  birthdayMonth: 12,
  birthdayDay: 18,
  turningAge: 25,

  // Hora a la que se desbloquea la sorpresa el dia del cumpleanos.
  unlockHour: 0,
  unlockMinute: 0,

  // Desde cuando estan juntos (alimenta el contador "Nuestro tiempo").
  relationshipStart: new Date("2022-12-18T00:00:00"),
  relationshipStartLabel: "18 . 12 . 2022",

  signature: "Con amor, tu lokitoo 🦅",
  pageTitle: "Feliz cumpleaños preciosa 🎂",
  pageDescription:
    "Feliz cumpleaños, mi amor. Esta sorpresa es solo para ti.",
};

// Proxima fecha de desbloqueo: este ano si aun no pasa su cumpleanos,
// o el dia mismo (queda desbloqueado todo ese dia).
export function getUnlockDate(now: Date = new Date()) {
  const { birthdayMonth, birthdayDay, unlockHour, unlockMinute } = birthdayConfig;
  const thisYear = new Date(
    now.getFullYear(),
    birthdayMonth - 1,
    birthdayDay,
    unlockHour,
    unlockMinute,
    0,
  );
  const endOfBirthday = new Date(thisYear);
  endOfBirthday.setDate(endOfBirthday.getDate() + 1);

  if (now.getTime() < endOfBirthday.getTime()) {
    return thisYear;
  }

  return new Date(
    now.getFullYear() + 1,
    birthdayMonth - 1,
    birthdayDay,
    unlockHour,
    unlockMinute,
    0,
  );
}

export function formatUnlockLabel(date: Date) {
  const day = date.getDate();
  const month = date.toLocaleDateString("es", { month: "long" });
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `Se abre el ${day} de ${month} a las ${hour}:${minute}`;
}

export const letterParagraphs = [
  `Feliz cumpleaños, ${birthdayConfig.name}. Hoy celebramos el dia en que el mundo se hizo un poquito mejor porque tu llegaste a el. Gracias por ser como eres: tu risa, tu paciencia y tu forma de cuidar a todos a tu alrededor me inspiran todos los dias.`,
  `Este ano que empieza quiero verte lograr todo lo que te propongas y estar a tu lado para celebrarlo. Gracias por dejarme ser parte de tu vida, por cada momento juntos, y por hacerme tan feliz. Te amo muchisimo, mi amor. Que cumplas muchos, muchos mas 🎂❤️`,
];
