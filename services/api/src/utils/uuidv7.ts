// file: services/api/src/utils/uuidv7.ts
import { randomBytes } from "crypto"

function cryptoRandHex(nHex: number): string {
  return randomBytes(Math.ceil(nHex / 2)).toString("hex").slice(0, nHex)
}

export function uuidv7(): string {
  const ms = Date.now()
  const timeHex = ms.toString(16).padStart(12, "0") // 48bit
  const rand = cryptoRandHex(20) // 80bit

  const part1 = timeHex.slice(0, 8)
  const part2 = timeHex.slice(8, 12)

  const r1 = rand.slice(0, 4)
  const r2 = rand.slice(4, 8)
  const r3 = rand.slice(8, 12)
  const r4 = rand.slice(12, 20)

  const timeHiAndVersion = "7" + r1.slice(1) // version=7
  const variantNibble = ((parseInt(r2[0], 16) & 0x3) | 0x8).toString(16) // 10xx
  const variant = variantNibble + r2.slice(1)

  return `${part1}-${part2}-${timeHiAndVersion}-${variant}${r3.slice(1)}-${r4}`
}
