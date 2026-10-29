// Todo lo personalizable de la celebracion vive aqui.
// Edita estos valores y el resto del proyecto se actualiza solo.

export const birthdayConfig = {
  // Nombre (o apodo) de la cumpleañera.
  name: "Preciosa",

  // Fecha de su cumpleaños (mes 1-12, dia) y cuántos cumple este año.
  birthdayMonth: 10,
  birthdayDay: 29,
  turningAge: 24,

  // Hora a la que se desbloquea la sorpresa el día del cumpleaños.
  unlockHour: 0,
  unlockMinute: 0,

  signature: "Con amor, tu lokitoo 🦅",
  pageTitle: "Feliz cumpleaños preciosa 🎂",
  pageDescription:
    "Feliz cumpleaños, mi amor. Esta sorpresa es solo para ti.",
};

// Próxima fecha de desbloqueo: este ano si aun no pasa su cumpleaños,
// o el día mismo (queda desbloqueado todo ese dia).
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
  "Feliz cumpleaños, princesa hermosa. No sabes lo feliz que soy a tu lado, me haces demasiado feliz. Sabes que puedes contar conmigo para lo que sea y que siempre te apoyaré en todo lo que hagas.",
  "Sé que en este año lograrás todo aquello que te propongas, y sabes que voy a estar a tu lado para celebrarlo. Muchas gracias por dejarme ser parte de tu vida y por todos los momentos lindos que hemos tenido.",
  "Te amo muchísimo, princesa, y que cumplas muchos años más.",
];
