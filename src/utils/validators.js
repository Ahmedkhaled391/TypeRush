const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|co\.eg|io|dev)$/i; 
// Password: min 8 chars, at least 1 number or special character
const PASSWORD_REGEX = /^(?=.*[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(.{8,})$/;
// Username: 3-20 chars, letters, numbers, underscore only
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export function isValidEmail(email) {
  return EMAIL_REGEX.test(String(email).trim());
}

export function isValidPass(pass){
    return PASSWORD_REGEX.test(pass)
}

export function isValidUsername(username) {
  return USERNAME_REGEX.test(String(username).trim());
}
