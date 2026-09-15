import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../prisma', () => ({
  default: {
    controleDeMaquinasPendentesLaboratorio: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}))

import prismaClient from '../prisma'
import { MaquinasPendentesLabRepository } from './MaquinasPendentesLabRepository'

describe('MaquinasPendentesLabRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('create delega pro prismaClient.controleDeMaquinasPendentesLaboratorio.create', async () => {
    vi.mocked(prismaClient.controleDeMaquinasPendentesLaboratorio.create).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new MaquinasPendentesLabRepository()

    await repository.create({ numeroDeSerie: 'SN-1' } as any)

    expect(prismaClient.controleDeMaquinasPendentesLaboratorio.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { numeroDeSerie: 'SN-1' } })
    )
  })

  it('update delega pro prismaClient.controleDeMaquinasPendentesLaboratorio.update com where correto', async () => {
    vi.mocked(prismaClient.controleDeMaquinasPendentesLaboratorio.update).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new MaquinasPendentesLabRepository()

    await repository.update('reg-1', { ssd: '512GB' } as any)

    expect(prismaClient.controleDeMaquinasPendentesLaboratorio.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'reg-1' }, data: { ssd: '512GB' } })
    )
  })

  it('delete delega pro prismaClient.controleDeMaquinasPendentesLaboratorio.delete', async () => {
    vi.mocked(prismaClient.controleDeMaquinasPendentesLaboratorio.delete).mockResolvedValue({ id: 'reg-1' } as any)
    const repository = new MaquinasPendentesLabRepository()

    await repository.delete('reg-1')

    expect(prismaClient.controleDeMaquinasPendentesLaboratorio.delete).toHaveBeenCalledWith({ where: { id: 'reg-1' } })
  })
})
