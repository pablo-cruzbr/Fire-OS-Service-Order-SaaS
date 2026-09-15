import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../prisma', () => ({
  default: {
    controledeMaquinasPendentesOro: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

import prismaClient from '../prisma'
import { MaquinasPendentesOroRepository } from './MaquinasPendentesOroRepository'

describe('MaquinasPendentesOroRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create delega pro prismaClient.controledeMaquinasPendentesOro.create', async () => {
    vi.mocked(prismaClient.controledeMaquinasPendentesOro.create).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new MaquinasPendentesOroRepository()

    await repository.create({ osInstalacao: 'OS-1' } as any)

    expect(prismaClient.controledeMaquinasPendentesOro.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { osInstalacao: 'OS-1' } })
    )
  })

  it('update delega pro prismaClient.controledeMaquinasPendentesOro.update com where correto', async () => {
    vi.mocked(prismaClient.controledeMaquinasPendentesOro.update).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new MaquinasPendentesOroRepository()

    await repository.update('reg-1', { osRetirada: 'OS-2' } as any)

    expect(prismaClient.controledeMaquinasPendentesOro.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'reg-1' }, data: { osRetirada: 'OS-2' } })
    )
  })

  it('delete delega pro prismaClient.controledeMaquinasPendentesOro.delete', async () => {
    vi.mocked(prismaClient.controledeMaquinasPendentesOro.delete).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new MaquinasPendentesOroRepository()

    await repository.delete('reg-1')

    expect(prismaClient.controledeMaquinasPendentesOro.delete).toHaveBeenCalledWith({ where: { id: 'reg-1' } })
  })
})
