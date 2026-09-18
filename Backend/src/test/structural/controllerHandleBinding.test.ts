import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

// Guarda de regressão pro achado de 18/09: `new XController().handle` passado
// direto pro Express (`router.post('/x', new XController().handle)`) separa
// o método do `this` — se `handle` for um método comum de prototype e usar
// `this.service`/`this.repository` dentro, ele sempre vira 500
// (`Cannot read properties of undefined`) assim que a rota é chamada de
// verdade, porque o Express nunca faz `instance.handle(...)`, só
// `handle(req, res, next)`. Isso afetou 48 controllers de uma vez (achado só
// depois de escrever o primeiro teste E2E de verdade — nenhum teste unitário
// pega esse tipo de bug, porque eles sempre chamam `handle` já vinculado à
// instância). O fix é `handle = async (req, res) => {...}` (arrow function
// como class field, captura o `this` do construtor). Este teste garante que
// nenhum controller volte a usar o padrão antigo sem ninguém notar.
function listTsFiles(dir: string): string[] {
  const entries = readdirSync(dir)
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      files.push(...listTsFiles(fullPath))
    } else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts')) {
      files.push(fullPath)
    }
  }

  return files
}

describe('Controllers não podem usar "async handle(" como método comum quando acessam this', () => {
  it('todo Controller (em controllers/ ou services/) que usa this.* dentro de handle precisa declarar handle como arrow function (class field)', () => {
    const srcDir = join(__dirname, '..', '..')
    // Varre controllers/ e services/ — pelo menos um Controller (achado real:
    // UpdateOrdemdeServicoController) mora dentro de um arquivo de service.
    const files = [...listTsFiles(join(srcDir, 'controllers')), ...listTsFiles(join(srcDir, 'services'))]
    const arquivosComProblema: string[] = []

    for (const file of files) {
      const content = readFileSync(file, 'utf-8')
      const temClasseController = /class\s+\w*Controller/.test(content)
      if (!temClasseController) continue

      const usaThis = /this\.\w+/.test(content)
      const handleComoMetodoComum = /(?:async\s+)?handle\s*\(\s*req/.test(content)
      const handleComoArrowField = /handle\s*=\s*async\s*\(/.test(content)

      if (usaThis && handleComoMetodoComum && !handleComoArrowField) {
        arquivosComProblema.push(file)
      }
    }

    expect(arquivosComProblema).toEqual([])
  })
})
