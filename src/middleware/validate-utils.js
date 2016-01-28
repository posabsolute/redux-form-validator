/*!
 * Redux-form-validation
 * Utils
 * Small functions that can be reused throughout the  validation middleware
 */

/**
 * isNumber() - returns a new element
 * based on the passed in tag name
 *
 * @param {Unknown} value
 * @return {Bool} if the value is a number
 */
export function isNumber(value) {
  return (Object.prototype.toString.call(value) === '[object Number]' || Object.prototype.toString.call(value) === '[object String]') && !isNaN(parseFloat(value)) && isFinite(value.toString().replace(/^-/, ''));
}
/**
 * objectValueToArray() - returns a new array from form list object
 * used to change radioList object to an input arra
 *
 * @param {obj} html form object
 * @return {Array}
 */
export function objectValueToArray(obj){
	return [...obj];
}
/**
 * Deferred
 * Create a function with an exposed promise
 *
 */
export class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject)=> {
      this.reject = reject;
      this.resolve = resolve;
    });
  }
}
