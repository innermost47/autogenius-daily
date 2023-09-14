export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function truncateText(text, length) {
  if (text.length > length) {
    return text.substring(0, length) + "...";
  } else {
    return text;
  }
}

export const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const passwordRegex = {
  caractersMinLen: 8,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  digit: /\d/,
  specialCaracter: /[!@#$%^&*(),.?":{}|<>]/,
};
