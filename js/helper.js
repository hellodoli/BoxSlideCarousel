function isNumber (input) {
  return !isNaN(parseInt(input)) && isFinite(input);
}
  
function isPositiveNumber (input, isZero) {
  if (typeof isZero == 'undefined') isZero = true;
  else isZero = false;

  if (isNumber(input)) {
    if (isZero) {
      if (parseInt(input) >= 0) return true; // default
    } else {
      if (parseInt(input) > 0) return true;
    }
    return false;
  }
  return false;
}

function setFillArray(l) {
  var arr = [];
  for (let i = 0; i < l; i++) {
    arr.push(i + 1);
  }
  return arr;
}