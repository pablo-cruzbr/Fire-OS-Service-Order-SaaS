import { describe, it, expect, beforeEach } from 'vitest'
import { randomUUID } from 'node:crypto'
import supertest from 'supertest'
import app from '../../app'
import { uploadQueue } from '../../queue/uploadQueue'
import { criarUsuarioELogar, limparBanco } from './helpers'

// Fluxo de upload/fila (BullMQ + Redis) — deixado fora de propósito nas
// rodadas anteriores de item 7 porque provar o pipeline inteiro (worker
// subindo de verdade, upload real pro Cloudinary) tem custo de infra alto
// pro retorno. O que dá pra provar com custo baixo, e que o unitário de
// fotoController.test.ts (que mocka `uploadQueue` inteiro) nunca prova: que
// `POST /foto` realmente publica um job na fila, com o formato certo, num
// Redis de verdade — não só que o código *chamou* `queue.add(...)`. Sem
// worker rodando, o job fica esperando ("waiting") — é exatamente esse
// estado que os testes leem de volta.
describe('Upload de foto — fila via Redis real (E2E)', () => {
  beforeEach(async () => {
    await limparBanco()
    await uploadQueue.obliterate({ force: true })
  })

  it('POST /foto enfileira um job de verdade no Redis, com o payload certo', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-upload@teste.com' })
    const ordemdeServico_id = randomUUID()

    const response = await supertest(app)
      .post('/foto')
      .set('Authorization', `Bearer ${token}`)
      .field('ordemdeServico_id', ordemdeServico_id)
      .attach('file', Buffer.from('conteúdo fake de imagem'), 'foto.jpg')

    expect(response.status).toBe(202)
    expect(response.body.message).toContain('1 foto')

    const jobs = await uploadQueue.getJobs(['waiting', 'active'])
    expect(jobs).toHaveLength(1)
    expect(jobs[0].name).toBe('upload-foto-os')
    expect(jobs[0].data.ordemdeServico_id).toBe(ordemdeServico_id)
    expect(jobs[0].data.tempFilePath).toBeDefined()
  })

  it('POST /foto com múltiplos arquivos enfileira um job por arquivo', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-upload2@teste.com' })
    const ordemdeServico_id = randomUUID()

    const response = await supertest(app)
      .post('/foto')
      .set('Authorization', `Bearer ${token}`)
      .field('ordemdeServico_id', ordemdeServico_id)
      .attach('file', Buffer.from('foto 1'), 'foto1.jpg')
      .attach('file', Buffer.from('foto 2'), 'foto2.jpg')

    expect(response.status).toBe(202)
    expect(response.body.message).toContain('2 foto')

    const jobs = await uploadQueue.getJobs(['waiting', 'active'])
    expect(jobs).toHaveLength(2)
  })

  it('devolve 422 quando falta o arquivo', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-upload3@teste.com' })

    const response = await supertest(app)
      .post('/foto')
      .set('Authorization', `Bearer ${token}`)
      .field('ordemdeServico_id', randomUUID())

    expect(response.status).toBe(422)

    const jobs = await uploadQueue.getJobs(['waiting', 'active'])
    expect(jobs).toHaveLength(0)
  })

  it('devolve 401 sem token', async () => {
    const response = await supertest(app)
      .post('/foto')
      .field('ordemdeServico_id', randomUUID())
      .attach('file', Buffer.from('conteúdo fake'), 'foto.jpg')

    expect(response.status).toBe(401)
  })
})
