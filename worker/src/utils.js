/**
 * Generate UUID
 * https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid#2117523
 * 
 * @returns 
 */
export function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

/**
 * Validates email with regex
 * 
 * @param {*} email 
 * @returns 
 */
export function validateEmail(email) {
  return email.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/);
}

/**
 * Zip two arrays
 * https://stackoverflow.com/questions/4856717/javascript-equivalent-of-pythons-zip-function
 * 
 * @param {*} arr1 
 * @param {*} arr2 
 * @param {*} i 
 */
export function* zip(arr1, arr2, i = 0) {
  while (arr1[i] || arr2[i]) yield [arr1[i], arr2[i++]].filter(x => !!x);
}