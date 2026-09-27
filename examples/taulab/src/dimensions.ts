export type Dimension = readonly [
  mass: number,
  length: number,
  time: number,
  temperature: number,
  charge: number,
]

export type ValueShape =
  | "scalar"
  | "vector"
  | "symmetricTensor"
  | "antisymmetricTensor"
  | "tensor"

export interface SymbolShape {
  readonly id: string
  readonly dimension: Dimension
  readonly shape: ValueShape
}

export type SymbolTable = ReadonlyMap<string, SymbolShape>

export type Expression =
  | { readonly kind: "symbol"; readonly id: string }
  | {
      readonly kind: "literal"
      readonly value: number
      readonly dimension: Dimension
      readonly shape: "scalar"
    }
  | { readonly kind: "negate"; readonly value: Expression }
  | {
      readonly kind: "add" | "subtract" | "multiply" | "divide"
      readonly left: Expression
      readonly right: Expression
    }
  | { readonly kind: "power"; readonly value: Expression; readonly exponent: number }
  | {
      readonly kind: "gradient" | "divergence" | "curl" | "timeDerivative"
      readonly value: Expression
    }

export interface InferredValue {
  readonly dimension: Dimension
  readonly shape: ValueShape
}

export const DIMENSIONLESS: Dimension = [0, 0, 0, 0, 0]
export const MASS: Dimension = [1, 0, 0, 0, 0]
export const LENGTH: Dimension = [0, 1, 0, 0, 0]
export const TIME: Dimension = [0, 0, 1, 0, 0]
export const TEMPERATURE: Dimension = [0, 0, 0, 1, 0]
export const CHARGE: Dimension = [0, 0, 0, 0, 1]

export const addDimensions = (left: Dimension, right: Dimension): Dimension => [
  left[0] + right[0],
  left[1] + right[1],
  left[2] + right[2],
  left[3] + right[3],
  left[4] + right[4],
]

export const scaleDimension = (dimension: Dimension, scale: number): Dimension => [
  dimension[0] * scale,
  dimension[1] * scale,
  dimension[2] * scale,
  dimension[3] * scale,
  dimension[4] * scale,
]

export const divideDimensions = (left: Dimension, right: Dimension): Dimension =>
  addDimensions(left, scaleDimension(right, -1))

export const equalDimensions = (left: Dimension, right: Dimension): boolean =>
  left.every((value, index) => value === right[index])

export const formatDimension = (dimension: Dimension): string => {
  const axes = ["M", "L", "T", "Theta", "Q"]
  const terms = dimension.flatMap((exponent, index) =>
    exponent === 0 ? [] : [`${axes[index]}^${exponent}`],
  )
  return terms.length === 0 ? "1" : terms.join(" ")
}

export const symbol = (id: string): Expression => ({ kind: "symbol", id })

export const literal = (
  value: number,
  dimension: Dimension = DIMENSIONLESS,
): Expression => ({
  kind: "literal",
  value,
  dimension,
  shape: "scalar",
})

export const negate = (value: Expression): Expression => ({ kind: "negate", value })

export const add = (left: Expression, right: Expression): Expression => ({
  kind: "add",
  left,
  right,
})

export const subtract = (left: Expression, right: Expression): Expression => ({
  kind: "subtract",
  left,
  right,
})

export const multiply = (left: Expression, right: Expression): Expression => ({
  kind: "multiply",
  left,
  right,
})

export const divide = (left: Expression, right: Expression): Expression => ({
  kind: "divide",
  left,
  right,
})

export const power = (value: Expression, exponent: number): Expression => ({
  kind: "power",
  value,
  exponent,
})

export const gradient = (value: Expression): Expression => ({ kind: "gradient", value })
export const divergence = (value: Expression): Expression => ({ kind: "divergence", value })
export const curl = (value: Expression): Expression => ({ kind: "curl", value })
export const timeDerivative = (value: Expression): Expression => ({
  kind: "timeDerivative",
  value,
})

const assertSame = (
  operation: string,
  left: InferredValue,
  right: InferredValue,
): InferredValue => {
  if (!equalDimensions(left.dimension, right.dimension)) {
    throw new Error(
      `${operation} dimension mismatch: ${formatDimension(left.dimension)} versus ${formatDimension(right.dimension)}`,
    )
  }
  if (left.shape !== right.shape) {
    throw new Error(`${operation} shape mismatch: ${left.shape} versus ${right.shape}`)
  }
  return left
}

const multiplyShape = (
  operation: "multiply" | "divide",
  left: ValueShape,
  right: ValueShape,
): ValueShape => {
  if (operation === "multiply") {
    if (left === "scalar") return right
    if (right === "scalar") return left
    throw new Error(`multiply shape is undefined for ${left} and ${right}`)
  }

  if (right !== "scalar") {
    throw new Error(`divide shape requires a scalar divisor, received ${right}`)
  }
  return left
}

export const inferExpression = (
  expression: Expression,
  symbols: SymbolTable,
): InferredValue => {
  switch (expression.kind) {
    case "symbol": {
      const value = symbols.get(expression.id)
      if (!value) throw new Error(`undefined symbol: ${expression.id}`)
      return { dimension: value.dimension, shape: value.shape }
    }
    case "literal":
      return { dimension: expression.dimension, shape: expression.shape }
    case "negate":
      return inferExpression(expression.value, symbols)
    case "add":
    case "subtract":
      return assertSame(
        expression.kind,
        inferExpression(expression.left, symbols),
        inferExpression(expression.right, symbols),
      )
    case "multiply":
    case "divide": {
      const left = inferExpression(expression.left, symbols)
      const right = inferExpression(expression.right, symbols)
      return {
        dimension:
          expression.kind === "multiply"
            ? addDimensions(left.dimension, right.dimension)
            : divideDimensions(left.dimension, right.dimension),
        shape: multiplyShape(expression.kind, left.shape, right.shape),
      }
    }
    case "power": {
      const value = inferExpression(expression.value, symbols)
      if (value.shape !== "scalar") {
        throw new Error(`power requires a scalar base, received ${value.shape}`)
      }
      return {
        dimension: scaleDimension(value.dimension, expression.exponent),
        shape: "scalar",
      }
    }
    case "gradient": {
      const value = inferExpression(expression.value, symbols)
      const shape: ValueShape =
        value.shape === "scalar"
          ? "vector"
          : value.shape === "vector"
            ? "tensor"
            : (() => {
                throw new Error(`gradient shape is undefined for ${value.shape}`)
              })()
      return {
        dimension: divideDimensions(value.dimension, LENGTH),
        shape,
      }
    }
    case "divergence": {
      const value = inferExpression(expression.value, symbols)
      const shape: ValueShape =
        value.shape === "vector"
          ? "scalar"
          : value.shape === "tensor" ||
              value.shape === "symmetricTensor" ||
              value.shape === "antisymmetricTensor"
            ? "vector"
            : (() => {
                throw new Error(`divergence shape is undefined for ${value.shape}`)
              })()
      return {
        dimension: divideDimensions(value.dimension, LENGTH),
        shape,
      }
    }
    case "curl": {
      const value = inferExpression(expression.value, symbols)
      if (value.shape !== "vector") {
        throw new Error(`curl requires a vector, received ${value.shape}`)
      }
      return {
        dimension: divideDimensions(value.dimension, LENGTH),
        shape: "vector",
      }
    }
    case "timeDerivative": {
      const value = inferExpression(expression.value, symbols)
      return {
        dimension: divideDimensions(value.dimension, TIME),
        shape: value.shape,
      }
    }
  }
}

