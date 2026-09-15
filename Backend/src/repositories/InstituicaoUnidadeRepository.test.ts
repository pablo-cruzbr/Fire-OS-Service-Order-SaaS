import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../prisma', () => ({
  default: {
    instituicaoUnidade: { update: vi.fn() },
  },
}))

import prismaClient from '../prisma'
import { InstituicaoUnidadeRepository } from './InstituicaoUnidadeRepository'

describe('InstituicaoUnidadeRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('update delega pro prismaClient.instituicaoUnidade.update com where e select corretos', async () => {
    vi.mocked(prismaClient.instituicaoUnidade.update).mockResolvedValue({ id: 'inst-1' } as any)
    const repository = new InstituicaoUnidadeRepository()

    await repository.update('inst-1', { name: 'Nova secretaria' } as any)

    expect(prismaClient.instituicaoUnidade.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'inst-1' },
        data: { name: 'Nova secretaria' },
      })
    )
  })
})
