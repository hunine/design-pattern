// RAW: A calculator that parses and evaluates math expressions using
// ad-hoc string splitting. Adding new operators or supporting parentheses
// requires rewriting the fragile string-manipulation logic. There is no
// grammar, no AST, and no clean way to extend the language.

function evaluate(expression: string): number {
  expression = expression.trim();

  // Handle addition (scan right-to-left to respect left-associativity).
  const addIndex = expression.lastIndexOf("+");
  if (addIndex > 0) {
    const left = evaluate(expression.slice(0, addIndex));
    const right = evaluate(expression.slice(addIndex + 1));
    return left + right;
  }

  // Handle subtraction.
  const subIndex = expression.lastIndexOf("-");
  if (subIndex > 0) {
    const left = evaluate(expression.slice(0, subIndex));
    const right = evaluate(expression.slice(subIndex + 1));
    return left - right;
  }

  // Handle multiplication.
  const mulIndex = expression.lastIndexOf("*");
  if (mulIndex > 0) {
    const left = evaluate(expression.slice(0, mulIndex));
    const right = evaluate(expression.slice(mulIndex + 1));
    return left * right;
  }

  // Handle division.
  const divIndex = expression.lastIndexOf("/");
  if (divIndex > 0) {
    const left = evaluate(expression.slice(0, divIndex));
    const right = evaluate(expression.slice(divIndex + 1));
    if (right === 0) throw new Error("Division by zero");
    return left / right;
  }

  // Base case: plain number.
  const num = parseFloat(expression);
  if (isNaN(num)) throw new Error(`Cannot parse: "${expression}"`);
  return num;
}

// Works for simple cases but breaks with parentheses or operator precedence.
console.log(evaluate("3+5"));       // 8
console.log(evaluate("10-2+3"));    // 11
console.log(evaluate("2*3+4"));     // wrong order — no precedence handling
