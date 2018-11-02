/**
 * Good to have utilities
 */

export const trimStrLength = (str, length) => {
  length = length || 30;
  if(str.length > length) {
    let eachSide = parseInt(length/2-1)
    return str.substr(0,eachSide) + '...' + str.substr(-eachSide);
  }
  return str;
}
