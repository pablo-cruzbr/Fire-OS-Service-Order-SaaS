import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../queue/uploadQueue', () => ({
  uploadQueue: { add: vi.fn() },
}))

import { uploadQueue } from '../../../queue/uploadQueue'
import { fotoController } from './fotoController'

function makeRes() {
  const res: any = {}
  res.status = vi.fn(() => res)
  res.json = vi.fn(() => res)
  return res
}

function makeReq(body: unknown, files: unknown) {
  return { body, files, headers: { 'content-type': 'multipart/form-data' } } as any
}

describe('fotoController.handle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('enfileira um job por foto e responde 202 sem subir nada pro Cloudinary aqui', async () => {
    const controller = new fotoController()
    const files = {
      file: [
        { name: 'foto1.jpg', tempFilePath: '/tmp/foto1.jpg' },
        { name: 'foto2.jpg', tempFilePath: '/tmp/foto2.jpg' },
      ],
    }
    const res = makeRes()

    await controller.handle(makeReq({ ordemdeServico_id: 'os-uuid-123' }, files), res)

    expect(uploadQueue.add).toHaveBeenCalledTimes(2)
    expect(uploadQueue.add).toHaveBeenNthCalledWith(1, 'upload-foto-os', {
      ordemdeServico_id: 'os-uuid-123',
      tempFilePath: '/tmp/foto1.jpg',
    })
    expect(res.status).toHaveBeenCalledWith(202)
    expect(res.json).toHaveBeenCalledWith({ message: '2 foto(s) recebida(s), processando em segundo plano.' })
  })

  it('enfileira 1 job quando só uma foto é enviada (express-fileupload não manda array)', async () => {
    const controller = new fotoController()
    const files = { file: { name: 'foto1.jpg', tempFilePath: '/tmp/foto1.jpg' } }
    const res = makeRes()

    await controller.handle(makeReq({ ordemdeServico_id: 'os-uuid-123' }, files), res)

    expect(uploadQueue.add).toHaveBeenCalledOnce()
  })

  it('lança ValidationError sem enfileirar nada quando nenhum arquivo é enviado', async () => {
    const controller = new fotoController()
    const res = makeRes()

    await expect(
      controller.handle(makeReq({ ordemdeServico_id: 'os-uuid-123' }, {}), res)
    ).rejects.toThrow('Arquivo não enviado')

    expect(uploadQueue.add).not.toHaveBeenCalled()
  })
})
