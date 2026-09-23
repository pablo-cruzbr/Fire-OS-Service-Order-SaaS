import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { z } from "zod";
import { ListTecnicoService } from "../status_categorias/tecnico/ListTecnicoService";
import { ListOrdemdeServicoService } from "../controles_forms/OrdemdeServico/ListOrdemdeServicoService";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Falha de chamada ao Groq (rate limit, API fora do ar, etc.) sobe sozinha
// pro errorHandler global agora — antes virava sempre um 500 manual com
// error.message vazando no corpo da resposta.
class AIChatService {
  constructor(
    private tecnicoService: ListTecnicoService = new ListTecnicoService(),
    private osService: ListOrdemdeServicoService = new ListOrdemdeServicoService()
  ) {}

  async execute(question: string, user_id: string) {
    const result = await generateText({
      model: groq("llama-3.3-70b-versatile") as any,
      maxSteps: 5,
      system: `Você é o assistente do AlltiControl.
        Sua tarefa é:
        1. Usar as ferramentas disponíveis para obter dados do sistema.
        2. EXIBIR os dados obtidos de forma clara e profissional para o usuário.
        3. Se recebeu dados, escreva-os sempre em português.`,
      prompt: question,
      tools: {
        getTecnicos: {
          description: "Lista o total e os nomes dos técnicos.",
          parameters: z.object({}),
          execute: async () => {
            const data = await this.tecnicoService.execute();
            return `Temos ${data.total} técnicos cadastrados. Nomes: ${data.controles.map((t: any) => t.name).join(", ")}.`;
          },
        } as any,

        getEstatisticasOS: {
          description: "Obtém a quantidade total de Ordens de Serviço.",
          parameters: z.object({}),
          execute: async () => {
            const data = await this.osService.execute({ user_id });
            return `Atualmente existem ${data.total} Ordens de Serviço no sistema.`;
          },
        } as any,
      },
    } as any);

    const finalAnswer = result.text || (result as any).response?.messages?.slice(-1)[0]?.content || "";

    return finalAnswer || "A IA processou os dados mas não formulou uma frase. Tente perguntar novamente.";
  }
}

export { AIChatService };
