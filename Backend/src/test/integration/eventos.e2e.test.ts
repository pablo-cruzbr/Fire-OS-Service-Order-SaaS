import { describe, it, expect, beforeEach } from 'vitest'
import supertest from 'supertest'
import app from '../../app'
import { criarUsuarioELogar, limparBanco } from './helpers'

// Módulo de eventos do calendário, deixado fora de propósito nas rodadas
// anteriores de item 7. Único módulo do projeto com id numérico
// autoincrement (em vez de uuid) e um Update que recebe o id pelo body
// (PUT /events) em vez de :id na URL — os dois pontos que valem prova E2E
// aqui, além do CRUD básico.
describe('Eventos do calendário (E2E)', () => {
  beforeEach(async () => {
    await limparBanco()
  })

  it('cria, lista, atualiza (id pelo body) e apaga um evento via HTTP', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-evento@teste.com' })

    const createResponse = await supertest(app)
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Manutenção preventiva', start_date: '2026-10-01T09:00:00.000Z', end_date: '2026-10-01T11:00:00.000Z' })

    expect(createResponse.status).toBe(200)
    expect(createResponse.body.id).toBeDefined()
    const id = createResponse.body.id

    const listResponse = await supertest(app).get('/events').set('Authorization', `Bearer ${token}`)
    expect(listResponse.status).toBe(200)
    expect(listResponse.body).toHaveLength(1)

    const updateResponse = await supertest(app)
      .put('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ id, text: 'Manutenção preventiva (revisada)' })
    expect(updateResponse.status).toBe(200)
    expect(updateResponse.body.text).toBe('Manutenção preventiva (revisada)')

    const deleteResponse = await supertest(app).delete(`/events/${id}`).set('Authorization', `Bearer ${token}`)
    expect(deleteResponse.status).toBe(200)

    const listAfterDelete = await supertest(app).get('/events').set('Authorization', `Bearer ${token}`)
    expect(listAfterDelete.body).toHaveLength(0)
  })

  it('devolve 401 sem token', async () => {
    const response = await supertest(app).get('/events')
    expect(response.status).toBe(401)
  })

  it('devolve 422 quando falta start_date', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-evento2@teste.com' })

    const response = await supertest(app)
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Evento incompleto', end_date: '2026-10-01T11:00:00.000Z' })

    expect(response.status).toBe(422)
  })

  it('devolve 404 ao apagar um id inexistente', async () => {
    const { token } = await criarUsuarioELogar({ role: 'ADMIN', email: 'admin-evento3@teste.com' })

    const response = await supertest(app).delete('/events/999999').set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(404)
  })
})
