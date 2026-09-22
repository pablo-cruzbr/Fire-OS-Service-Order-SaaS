import { describe, it, expect, beforeEach } from 'vitest'
import { randomUUID } from 'node:crypto'
import supertest from 'supertest'
import app from '../../app'
import prismaClient from '../../prisma'
import { criarUsuarioELogar, limparBanco } from './helpers'

// Os 3 módulos "técnicos" (AssistenciaTecnica, LaudoTecnico, DocumentacaoTecnica)
// usam o mesmo `authorizeOwnership` genérico que OrdemdeServico — o gap
// original (achado em 14/09, ver GUIA-RBAC-CASL.md) era exatamente esses 3
// módulos deixando qualquer TECNICO editar registro de outro. Este arquivo
// prova a regra passando pelo Express real, um describe por módulo, com o
// mesmo par de cenários (dono atualiza / não-dono toma 403).
describe('Controles técnicos (E2E) — ownership/CASL via HTTP', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  describe('ControleDeAssistenciaTecnica', () => {
    it('cria via HTTP e o técnico dono consegue atualizar', async () => {
      const equipamento = await prismaClient.equipamento.create({
        data: { name: 'Notebook', patrimonio: 'PAT-100' },
      })
      const statusReparo = await prismaClient.statusReparo.create({ data: { name: 'Aguardando' } })
      const tecnico = await prismaClient.tecnico.create({ data: { name: 'Técnico Dono' } })
      const { token } = await criarUsuarioELogar({
        role: 'TECNICO',
        tecnico_id: tecnico.id,
        email: 'tecnico-assist@teste.com',
      })

      const createResponse = await supertest(app)
        .post('/controledeassistenciatecnica')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Impressora com defeito',
          mesAno: '2026-09-01',
          idChamado: 'CH-001',
          assistencia: 'Assistência XYZ',
          observacoes: 'Sem observações',
          osDaAssistencia: 'OS-001',
          dataDeRetirada: '2026-09-05',
          equipamento_id: equipamento.id,
          statusReparo_id: statusReparo.id,
          tecnico_id: tecnico.id,
        })

      expect(createResponse.status).toBe(200)
      expect(createResponse.body.id).toBeDefined()

      const updateResponse = await supertest(app)
        .patch(`/assistenciatecnica/update/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ observacoes: 'Atualizado pelo dono' })

      expect(updateResponse.status).toBe(200)
    })

    it('técnico que não é dono toma 403 ao tentar atualizar', async () => {
      const equipamento = await prismaClient.equipamento.create({
        data: { name: 'Notebook', patrimonio: 'PAT-101' },
      })
      const statusReparo = await prismaClient.statusReparo.create({ data: { name: 'Aguardando' } })
      const tecnicoDono = await prismaClient.tecnico.create({ data: { name: 'Técnico Dono' } })
      const tecnicoOutro = await prismaClient.tecnico.create({ data: { name: 'Técnico Outro' } })

      const registro = await prismaClient.controleDeAssistenciaTecnica.create({
        data: {
          name: 'Impressora com defeito',
          mesAno: new Date('2026-09-01'),
          idChamado: 'CH-002',
          assistencia: 'Assistência XYZ',
          observacoes: 'Sem observações',
          osDaAssistencia: 'OS-002',
          dataDeRetirada: new Date('2026-09-05'),
          equipamento: { connect: { id: equipamento.id } },
          statusReparo: { connect: { id: statusReparo.id } },
          tecnico: { connect: { id: tecnicoDono.id } },
        },
      })

      const { token } = await criarUsuarioELogar({
        role: 'TECNICO',
        tecnico_id: tecnicoOutro.id,
        email: 'tecnico-outro-assist@teste.com',
      })

      const response = await supertest(app)
        .patch(`/assistenciatecnica/update/${registro.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ observacoes: 'Tentando mexer no registro alheio' })

      expect(response.status).toBe(403)
    })

    it('devolve 404 ao atualizar um id inexistente', async () => {
      const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-assist@teste.com' })

      const response = await supertest(app)
        .patch(`/assistenciatecnica/update/${randomUUID()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ observacoes: 'Qualquer coisa' })

      expect(response.status).toBe(404)
    })
  })

  describe('ControleDeLaudoTecnico', () => {
    it('cria via HTTP e o técnico dono consegue atualizar', async () => {
      const equipamento = await prismaClient.equipamento.create({
        data: { name: 'Notebook', patrimonio: 'PAT-102' },
      })
      const instituicaoUnidade = await prismaClient.instituicaoUnidade.create({
        data: { name: 'Unidade Central', endereco: 'Rua Teste, 123' },
      })
      const tecnico = await prismaClient.tecnico.create({ data: { name: 'Técnico Dono' } })
      const { token } = await criarUsuarioELogar({
        role: 'TECNICO',
        tecnico_id: tecnico.id,
        email: 'tecnico-laudo@teste.com',
      })

      const createResponse = await supertest(app)
        .post('/controledelaudotecnico')
        .set('Authorization', `Bearer ${token}`)
        .send({
          descricaodoProblema: 'Não liga',
          mesAno: '2026-09-01',
          osLab: 'OS-LAB-001',
          instituicaoUnidade_id: instituicaoUnidade.id,
          equipamento_id: equipamento.id,
          tecnico_id: tecnico.id,
        })

      expect(createResponse.status).toBe(200)

      const updateResponse = await supertest(app)
        .patch(`/laudotecnico/update/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ osLab: 'OS-LAB-001-REVISADA' })

      expect(updateResponse.status).toBe(200)
    })

    it('técnico que não é dono toma 403 ao tentar atualizar', async () => {
      const equipamento = await prismaClient.equipamento.create({
        data: { name: 'Notebook', patrimonio: 'PAT-103' },
      })
      const instituicaoUnidade = await prismaClient.instituicaoUnidade.create({
        data: { name: 'Unidade Central', endereco: 'Rua Teste, 123' },
      })
      const tecnicoDono = await prismaClient.tecnico.create({ data: { name: 'Técnico Dono' } })
      const tecnicoOutro = await prismaClient.tecnico.create({ data: { name: 'Técnico Outro' } })

      const registro = await prismaClient.controleDeLaudoTecnico.create({
        data: {
          descricaodoProblema: 'Não liga',
          mesAno: new Date('2026-09-01'),
          osLab: 'OS-LAB-002',
          instituicaoUnidade: { connect: { id: instituicaoUnidade.id } },
          equipamento: { connect: { id: equipamento.id } },
          tecnico: { connect: { id: tecnicoDono.id } },
        },
      })

      const { token } = await criarUsuarioELogar({
        role: 'TECNICO',
        tecnico_id: tecnicoOutro.id,
        email: 'tecnico-outro-laudo@teste.com',
      })

      const response = await supertest(app)
        .patch(`/laudotecnico/update/${registro.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ osLab: 'Tentando mexer no laudo alheio' })

      expect(response.status).toBe(403)
    })
  })

  describe('DocumentacaoTecnica', () => {
    it('cria via HTTP e o técnico dono consegue atualizar', async () => {
      const tecnico = await prismaClient.tecnico.create({ data: { name: 'Técnico Dono' } })
      const { token } = await criarUsuarioELogar({
        role: 'TECNICO',
        tecnico_id: tecnico.id,
        email: 'tecnico-doc@teste.com',
      })

      const createResponse = await supertest(app)
        .post('/documentacaotecnica')
        .set('Authorization', `Bearer ${token}`)
        .send({
          titulo: 'Manual de instalação',
          descricao: 'Passo a passo de instalação do equipamento',
          tecnico_id: tecnico.id,
        })

      expect(createResponse.status).toBe(200)

      const updateResponse = await supertest(app)
        .patch(`/documentacaotecnica/update/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ titulo: 'Manual de instalação (revisado)' })

      expect(updateResponse.status).toBe(200)
    })

    it('técnico que não é dono toma 403 ao tentar atualizar', async () => {
      const tecnicoDono = await prismaClient.tecnico.create({ data: { name: 'Técnico Dono' } })
      const tecnicoOutro = await prismaClient.tecnico.create({ data: { name: 'Técnico Outro' } })

      const registro = await prismaClient.documentacaoTecnica.create({
        data: {
          titulo: 'Manual de instalação',
          descricao: 'Passo a passo de instalação do equipamento',
          tecnico: { connect: { id: tecnicoDono.id } },
        },
      })

      const { token } = await criarUsuarioELogar({
        role: 'TECNICO',
        tecnico_id: tecnicoOutro.id,
        email: 'tecnico-outro-doc@teste.com',
      })

      const response = await supertest(app)
        .patch(`/documentacaotecnica/update/${registro.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ titulo: 'Tentando mexer na documentação alheia' })

      expect(response.status).toBe(403)
    })
  })
})
