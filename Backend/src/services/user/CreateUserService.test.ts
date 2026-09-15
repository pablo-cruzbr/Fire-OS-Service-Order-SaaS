import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('bcryptjs', () => ({
  hash: vi.fn(() => 'hash-gerado'),
}))

import { CreateUserService } from './CreateUserService'
import { UserRepository } from '../../repositories/UserRepository'

function makeFakeRepository() {
  return {
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  } as unknown as UserRepository
}

const usuarioCriadoFalso = {
  id: 'uuid-456',
  name: 'João Técnico',
  email: 'joao@allti.com',
  tecnico_id: null,
  instituicaoUnidade: null,
  cliente: null,
  setor: null,
}

describe('CreateUserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve criar usuário com sucesso quando email não existe', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.findByEmail).mockResolvedValue(null)
    vi.mocked(repository.create).mockResolvedValue(usuarioCriadoFalso as any)

    const service = new CreateUserService(repository)
    const resultado = await service.execute({
      name: 'João Técnico',
      email: 'joao@allti.com',
      password: 'senha123',
    })

    expect(resultado.email).toBe('joao@allti.com')
    expect(resultado.name).toBe('João Técnico')
    expect(repository.create).toHaveBeenCalledOnce()
  })

  it('lança ConflictError quando email já está cadastrado', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.findByEmail).mockResolvedValue({ id: 'uuid-existente' } as any)

    const service = new CreateUserService(repository)

    await expect(
      service.execute({ name: 'João', email: 'joao@allti.com', password: 'senha123' })
    ).rejects.toThrow('Esse email já existe.')
    expect(repository.create).not.toHaveBeenCalled()
  })
})
