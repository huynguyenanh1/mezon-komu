import { EMAIL_DOMAIN } from '../constants/configs';

export function extractMessage(message: string) {
  const args = message.replace('\n', ' ').slice('*'.length).trim().split(/ +/);
  if (args.length > 0) {
    return [args.shift().toLowerCase(), args];
  } else return [false, []];
}

export const cleanAndExtractValidWords = (arr) => {
  const validWords = arr.filter((item) => {
    const cleanedItem = item.replace(/[<>@]/g, '');
    return /[a-zA-Zàáạảãăắằẵặẳâấầẩẫậđèéẹẻẽêềếểễệìíịỉĩòóọỏõôốồổỗộơớờởỡợùúụủũưứừửữựỳỵỷỹý]/.test(
      cleanedItem,
    );
  });

  return validWords.join(' ');
};

export function generateEmail(userName: string) {
  return `${userName}@${EMAIL_DOMAIN}`;
}

export function getUserNameByEmail(string) {
  if (string.includes(EMAIL_DOMAIN)) {
    return string.slice(0, string.length - 9);
  }
}

export const normalizeString = (str) => {
  return (str || '').trim();
};

export function getDateDay(time) {
  let date;

  if (!time) {
    date = new Date();
  } else {
    date = new Date(time);
  }
  const timezone = date.getTimezoneOffset() / -60;
  return {
    morning: {
      fisttime: new Date(setTime(date, 0 + timezone, 0, 0, 0)).getTime(),
      lastime: new Date(setTime(date, 2 + timezone, 31, 0, 0)).getTime(),
    },
    afternoon: {
      fisttime: new Date(setTime(date, 5 + timezone, 0, 0, 0)).getTime(),
      lastime: new Date(setTime(date, 10 + timezone, 1, 0, 0)).getTime(),
    },
    fullday: {
      fisttime: new Date(setTime(date, 0 + timezone, 0, 0, 0)).getTime(),
      lastime: new Date(setTime(date, 10 + timezone, 0, 0, 0)).getTime(),
    },
  };
}

export function setTime(date, hours, minute, second, msValue) {
  return date.setHours(hours, minute, second, msValue);
}

export function checkTimeMention(date: Date): boolean {
  const day = date.getDay();
  if (day === 6 || day === 0) {
    return false;
  }

  const timezone = date.getTimezoneOffset() / -60;

  const firstTimeMorning = new Date().setHours(1 + timezone, 30, 0, 0);
  const lastTimeMorning = new Date().setHours(4 + timezone, 59, 59, 999);
  const firstTimeAfternoon = new Date().setHours(6 + timezone, 0, 0, 0);
  const lastTimeAfternoon = new Date().setHours(10 + timezone, 29, 59, 999);

  const dateInMs = date.getTime();

  return (
    (dateInMs >= firstTimeMorning && dateInMs <= lastTimeMorning) ||
    (dateInMs >= firstTimeAfternoon && dateInMs <= lastTimeAfternoon)
  );
}

export function checkAnswerFormat(answer: string, maxAnswer: number) {
  const num = Number(answer);
  return !isNaN(num) && num <= maxAnswer;
}

export const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'audio/mpeg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png'
  ) {
    cb(null, true);
  } else {
    cb(new Error('You can only upload mp3 file'), false);
  }
};

export const fileName = (req, file, cb) => {
  cb(null, file.fieldname + '-' + Date.now() + '.mp3');
};

export const imageName = (req, file, cb) => {
  cb(null, Date.now() + file.originalname);
};

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getRandomColor(): string {
  const colors: string[] = [
    '#1ABC9C', // Aqua
    '#11806A', // DarkAqua
    '#57F287', // Green
    '#1F8B4C', // DarkGreen
    '#3498DB', // Blue
    '#206694', // DarkBlue
    '#9B59B6', // Purple
    '#71368A', // DarkPurple
    '#E91E63', // LuminousVividPink
    '#AD1457', // DarkVividPink
    '#F1C40F', // Gold
    '#C27C0E', // DarkGold
    '#E67E22', // Orange
    '#A84300', // DarkOrange
    '#ED4245', // Red
    '#992D22', // DarkRed
    '#95A5A6', // Grey
    '#979C9F', // DarkGrey
    '#7F8C8D', // DarkerGrey
    '#BCC0C0', // LightGrey
    '#34495E', // Navy
    '#2C3E50', // DarkNavy
    '#FFFF00', // Yellow
  ];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

export function convertName(fullName: string): string {
  const parts = fullName.toLowerCase().split(' ');
  const firstLetter = parts[0];
  const lastName = parts.slice(1).join('');
  const username = `${firstLetter}.${lastName}`;
  return username;
}