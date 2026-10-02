import { describe, it, expect, beforeEach } from 'vitest'
import prismaClient from '../../prisma'
import { OrdemdeServicoRepository } from '../../repositories/OrdemdeServicoRepository'
import { limparBanco } from './helpers'

// Os fluxos HTTP de OrdemdeServico (criar, listar, relatório) já têm E2E em
// ordemDeServico.e2e.test.ts / relatoriosOrdemDeServico.e2e.test.ts — o que
// falta provar contra Postgres real são os métodos do repository que esses
// fluxos não exercitam diretamente: os filtros usados pela tela de assinatura
// e pelas telas específicas de técnico/status.
describe('OrdemdeServicoRepository (integração, Postgres real)', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  async function criarOrdemBase() {
    const tipodeChamado = await prismaClient.tipodeChamado.create({ data: { name: 'Manutenção' } })
    const status = await prismaClient.statusOrdemdeServico.create({ data: { name: 'Aberto' } })
    const tecnico = await prismaClient.tecnico.create({ data: { name: 'Téc 1' } })
    const user = await prismaClient.user.create({
      data: { name: 'User', email: 'repo-os@teste.com', password: 'hash', role: 'ADMIN' },
    })
    const repository = new OrdemdeServicoRepository()

    const ordem = await repository.create({
      name: 'OS repo',
      tipodeChamado: { connect: { id: tipodeChamado.id } },
      statusOrdemdeServico: { connect: { id: status.id } },
      tecnico: { connect: { id: tecnico.id } },
      user: { connect: { id: user.id } },
    })

    return { repository, ordem, status, tecnico }
  }

  it('findByStatus e findByTecnico filtram pela FK de verdade', async () => {
    const { repository, ordem, status, tecnico } = await criarOrdemBase()

    expect(await repository.findByStatus(status.id)).toHaveLength(1)
    expect(await repository.findByStatus('00000000-0000-0000-0000-000000000000')).toHaveLength(0)

    const porTecnico = await repository.findByTecnico(tecnico.id)
    expect(porTecnico).toHaveLength(1)
    expect(porTecnico[0].id).toBe(ordem.id)
  })

  it('existsById reflete presença real no banco', async () => {
    const { repository, ordem } = await criarOrdemBase()

    expect(await repository.existsById(ordem.id)).toBe(true)
    expect(await repository.existsById('00000000-0000-0000-0000-000000000000')).toBe(false)
  })

  it('findAssinatura + updateAssinatura leem/escrevem o campo assinaturaDigital de verdade', async () => {
    const { repository, ordem } = await criarOrdemBase()

    expect((await repository.findAssinatura(ordem.id))?.assinaturaDigital).toBeNull()

    await repository.updateAssinatura(ordem.id, 'https://cdn.exemplo.com/assinatura.png')

    expect((await repository.findAssinatura(ordem.id))?.assinaturaDigital).toBe(
      'https://cdn.exemplo.com/assinatura.png'
    )
  })
})
