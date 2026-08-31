# Memória Pleno — Copy de Landing Page

Nome de trabalho pro conceito documentado em `CONCEITO-CELINE-APLICADO.md` — inspirado no padrão do Oi Celine, aplicado à jornada de virar pleno. Mesmo formato das outras páginas do portfólio (badge > headline > subtítulo > CTA; cards de feature; passos numerados). Sem depoimento fabricado ou prova social falsa — é conceito, não produto no ar.

---

## Hero

**[badge]** SUA JORNADA PRA PLENO, NUM LUGAR SÓ

# Você não esqueceu.
## Só está espalhado em 6 lugares diferentes.

Cola o roadmap, os projetos, as decisões que você já tomou. Pergunta em português simples. A Memória Pleno responde só com o que é seu — e avisa quando você ainda não estudou aquilo.

**[botão primário]** Organizar meu roadmap →
**[link secundário]** Como funciona ↓

---

## A dor, nas suas próprias palavras

*(princípio de copy: descobrir a dor antes de vender, e repetir com as palavras exatas que a pessoa usou — pra ela se enxergar no texto, não ler um discurso genérico. Essa é literalmente a frase que você usou pra descrever o problema.)*

### Você fica perguntando de IA pra IA, de chat em chat, de forma bagunçada.

Cada resposta nova apaga o contexto da anterior. Você reexplica o mesmo roadmap, a mesma decisão, o mesmo projeto — de novo, e de novo. Só nessa sessão de estudo, isso já virou 7 documentos diferentes pra você não perder o fio. Você lembra que documentou aquela decisão sobre fila — mas em qual arquivo mesmo? Você acha que já domina RBAC, mas faz três semanas que não revisita o assunto.

---

## O preço de continuar assim

*(princípio de copy: não venda o que a pessoa ganha, mostre o que ela já está perdendo — dinheiro e tempo, não benefício futuro)*

### Não é sobre o que você ganha organizando. É sobre o que você já está perdendo.

Faltam poucos meses pro prazo que você mesmo se deu pra virar pleno. Cada vez que você abre um chat novo pra perguntar de novo algo que já foi respondido — é tempo que não virou linha de código, não virou projeto no portfólio, não virou prova pra entrevista. Isso não é hipotético: é literalmente o que aconteceu enquanto essa página estava sendo planejada.

---

## Features

*(4 cards, mesma grade das outras páginas do portfólio)*

**🧠 Memória, não busca**
Pergunta com suas palavras. A resposta vem do que você mesmo escreveu — com a fonte citada, não um palpite genérico de IA.

**🚦 Prioridade pelo tempo que resta**
Faltam 60 dias? A Memória Pleno te diz o que estudar essa semana, não despeja tudo de uma vez.

**🗺️ Mapa do que já é seu**
Não é uma lista de checkbox. É um mapa visual: não estudado, estudado, aplicado num projeto de verdade.

**🔁 Revisão no momento certo**
Marcou RBAC como estudado há um mês e não tocou mais no assunto? Ela lembra você antes que esqueça de vez.

---

## O que muda o jogo

*(equivalente ao "She only answers with what's yours" da Celine — a explicação do RAG, em linguagem de benefício, não de tecnologia)*

### Ela só fala o que é seu.

Sem conselho genérico de "10 dicas pra virar pleno" que você já leu 20 vezes. Pergunta "o que falta no Crivo pra cobrir cache?" e a resposta vem do `PROJETO-CRIVO.md`, com a fonte citada. Se a resposta não estiver documentada em lugar nenhum, ela diz isso — não inventa.

---

## A diferença de código, junior pra pleno

*(prova concreta, não abstrata — o mesmo problema, duas soluções, um número real de performance)*

### Não é sintaxe. É o que acontece quando alguém está esperando.

**Júnior resolve a funcionalidade:**
```ts
// upload de foto — trava a tela até o Cloudinary responder
const resultado = await cloudinary.uploader.upload(file.tempFilePath);
await prisma.fotoOrdemServico.create({ data: { url: resultado.secure_url } });
return res.json({ ok: true }); // o técnico esperou o tempo todo
```

**Pleno resolve sabendo o que acontece com 5 pessoas usando ao mesmo tempo:**
```ts
// só enfileira — quem sobe a foto de verdade é o worker, depois
await filaDeMidia.add("upload-foto", { caminho: file.tempFilePath });
return res.status(202).json({ ok: true }); // o técnico não espera nada
```

**O número real, medido, não estimado:** no protótipo testado ao vivo desse mesmo raciocínio, enfileirar 4 jobs levou **36 milissegundos**. A versão síncrona, com o técnico esperando o Cloudinary responder, levava a tela travada por vários segundos — a diferença entre um app que "funciona no teste manual" e um que aguenta uso real, o mesmo salto de nível que separa júnior de pleno.

---

## Como funciona

*(3 passos numerados)*

### Do documento espalhado à resposta certa

**01 — Organize uma vez**
Seus arquivos de roadmap, projeto e decisões viram a base de conhecimento — sem precisar reorganizar nada, do jeito que já estão.

**02 — Pergunte do seu jeito**
Nada de lembrar em qual arquivo estava. Pergunta em português solto, ela busca.

**03 — Reveja no ritmo certo**
Ela aponta o que está esfriando, o que ainda falta, e o que já virou prova real (projeto no ar, não só teoria).

---

## Feito pra fechar o círculo, não pra vender curso

Diferente de uma imersão ou um curso: a Memória Pleno não ensina tecnologia nova — ela garante que o que você **já** aprendeu não se perde no meio do caminho, e deixa claro o que falta pra você chegar no próximo nível. O conteúdo é seu. Ela só ajuda a não esquecer onde ele está, e a enxergar o que vem depois.

### E a prova não é certificado. É código no ar.

Você não precisa de diploma pra provar que sabe — precisa pegar o que aprendeu e **implementar num projeto de verdade**. É por isso que cada conceito na Memória Pleno tem 3 estágios, não 2: não estudado, estudado, **aplicado num projeto real**. Você aprende, constrói, e sente na prática por que aquilo importa — não porque alguém te disse que importa.

---

## CTA Final

*(princípio de copy: nunca pergunte "o que você achou" — pergunte algo que já assume que a pessoa vai começar, tipo "segunda ou quarta?")*

### Você começa organizando hoje, ou amanhã de manhã?

**[botão primário]** Hoje →
**[botão secundário]** Amanhã de manhã →

---

## Rodapé

Memória Pleno — construído pelo mesmo dev que está usando.
Conceito documentado, ainda não construído — ver `CONCEITO-CELINE-APLICADO.md` pro raciocínio completo e `IDEIAS-PROJETOS-PLENO.md` pra prioridade real dos próximos 3 meses.
