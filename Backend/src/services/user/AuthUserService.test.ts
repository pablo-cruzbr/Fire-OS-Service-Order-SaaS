import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
}))

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn(() => 'token-de-teste'),
}))

import { compare } from 'bcryptjs'
import { AuthUserService } from './AuthUserService'
import { UserRepository } from '../../repositories/UserRepository'

function makeFakeRepository() {
  return {
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  } as unknown as UserRepository
}

const usuarioFalso = {
  id: 'uuid-123',
  name: 'Pablo Cruz',
  email: 'pablo@allti.com',
  password: 'hash-no-banco',
  role: 'ADMIN' as const,
  tecnico_id: null,
}

describe('AuthUserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar token e dados do usuário quando credenciais estão corretas', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.findByEmail).mockResolvedValue(usuarioFalso as any)
    vi.mocked(compare).mockResolvedValue(true as never)

    const service = new AuthUserService(repository)
    const resultado = await service.execute({
      email: 'pablo@allti.com',
      password: '123456',
    })

    expect(resultado.token).toBe('token-de-teste')
    expect(resultado.email).toBe('pablo@allti.com')
    expect(resultado.name).toBe('Pablo Cruz')
    expect(resultado.role).toBe('ADMIN')
  })

  it('lança UnauthorizedError quando o usuário não existe no banco', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.findByEmail).mockResolvedValue(null)

    const service = new AuthUserService(repository)

    await expect(
      service.execute({ email: 'naoexiste@email.com', password: '123456' })
    ).rejects.toThrow('usuário ou senha está incorreta')
  })

  it('lança UnauthorizedError quando a senha estiver incorreta', async () => {
    const repository = makeFakeRepository()
    vi.mocked(repository.findByEmail).mockResolvedValue(usuarioFalso as any)
    vi.mocked(compare).mockResolvedValue(false as never)

    const service = new AuthUserService(repository)

    await expect(
      service.execute({ email: 'pablo@allti.com', password: 'senha-errada' })
    ).rejects.toThrow('usuário ou senha está incorreta')
  })
})
