import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../prisma', () => ({
  default: {
    user: {
      findFirst: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
}))

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn(() => 'token-de-teste'),
}))

import prismaClient from '../../prisma'
import { compare } from 'bcryptjs'
import { AuthUserService } from './AuthUserService'

const usuarioFalso = {
  id: 'uuid-123',
  name: 'Pablo Cruz',
  email: 'pablo@allti.com',
  password: 'hash-no-banco',
  role: 'ADMIN' as const,
  tecnico_id: null,
  cliente_id: null,
  setor_id: null,
  instituicaoUnidade_id: null,
  updated_at: new Date(),
  created_at: new Date(),
}

describe('AuthUserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar token e dados do usuário quando credenciais estão corretas', async () => {
    vi.mocked(prismaClient.user.findFirst).mockResolvedValue(usuarioFalso)
    vi.mocked(compare).mockResolvedValue(true as never)

    const service = new AuthUserService()
    const resultado = await service.execute({
      email: 'pablo@allti.com',
      password: '123456',
    })

    expect(resultado.token).toBe('token-de-teste')
    expect(resultado.email).toBe('pablo@allti.com')
    expect(resultado.name).toBe('Pablo Cruz')
    expect(resultado.role).toBe('ADMIN')
  })

  it('deve lançar erro quando o usuário não existe no banco', async () => {
    vi.mocked(prismaClient.user.findFirst).mockResolvedValue(null)

    const service = new AuthUserService()

    await expect(
      service.execute({ email: 'naoexiste@email.com', password: '123456' })
    ).rejects.toThrow('usuário ou senha está incorreta')
  })

  it('deve lançar erro quando a senha estiver incorreta', async () => {
    vi.mocked(prismaClient.user.findFirst).mockResolvedValue(usuarioFalso)
    vi.mocked(compare).mockResolvedValue(false as never)

    const service = new AuthUserService()

    await expect(
      service.execute({ email: 'pablo@allti.com', password: 'senha-errada' })
    ).rejects.toThrow('usuário ou senha está incorreta')
  })
})
