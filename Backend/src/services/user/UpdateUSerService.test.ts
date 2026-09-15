import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('bcryptjs', () => ({
  hash: vi.fn(() => 'hash-gerado'),
}))

import { hash } from 'bcryptjs'
import { UpdateUserService } from './UpdateUSerService'
import { UserRepository } from '../../repositories/UserRepository'

function makeFakeRepository() {
  return {
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  } as unknown as UserRepository
}

describe('UpdateUserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('atualiza nome e email sem mexer na senha quando ela não é informada', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'user-1', name: 'Novo nome' } as any)

    const service = new UpdateUserService(repository)
    await service.execute('user-1', { name: 'Novo nome' })

    expect(hash).not.toHaveBeenCalled()
    const [, dataEnviada] = vi.mocked(repository.update).mock.calls[0]
    expect(dataEnviada).toMatchObject({ name: 'Novo nome' })
    expect(dataEnviada).not.toHaveProperty('password')
  })

  it('faz hash da senha nova quando ela é informada', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'user-1' } as any)

    const service = new UpdateUserService(repository)
    await service.execute('user-1', { password: 'senhaNova123' })

    expect(hash).toHaveBeenCalledWith('senhaNova123', 8)
    expect(repository.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ password: 'hash-gerado' })
    )
  })

  it('conecta cliente_id/setor_id/tecnico_id/instituicaoUnidade_id quando informados', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.update).mockResolvedValue({ id: 'user-1' } as any)

    const service = new UpdateUserService(repository)
    await service.execute('user-1', { tecnico_id: 'tecnico-1' })

    expect(repository.update).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({ tecnico: { connect: { id: 'tecnico-1' } } })
    )
  })
})
