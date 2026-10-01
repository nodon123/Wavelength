export class CodeTakenError extends Error {
  constructor(code: string) {
    super(`The code ${code} is already in use.`)
  }
}
