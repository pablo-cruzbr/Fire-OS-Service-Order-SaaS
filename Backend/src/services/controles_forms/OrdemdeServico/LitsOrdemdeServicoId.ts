import prismaClient from "../../../prisma";

interface GetOSRequest {
    id: string;
}

class ListOrdemdeServicoId {
    async execute({ id }: GetOSRequest) {

        const ordem = await prismaClient.ordemdeServico.findUnique({
            where: {
                id: id, 
            },
            select: {
                id: true,
                numeroOS: true,
                name: true,
                descricaodoProblemaouSolicitacao: true,
                patrimoniodoequipamento: true,
                nomedoContatoaserProcuradonoLocal: true,
                agendadoEm: true,
                created_at: true,
                updatedAt: true,
                nameTecnico: true,
                diagnostico: true,
                solucao: true,
                assinante: true,
                bannerassinatura: true,
                startedAt: true,
                endedAt: true,
                duracao: true,
                equipamento: {
                    select: {
                        id: true,
                        name: true,
                        patrimonio: true,
                    }
                },
                statusOrdemdeServico: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                instituicaoUnidade: {
                    select: {
                        id: true,
                        name: true,
                        endereco: true,
                    },
                },
                informacoesSetor: {
                    select: {
                        id: true,
                        usuario: true,
                        ramal: true,
                        andar: true,
                        setor: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        instituicaoUnidade: {
                            select: {
                                id: true,
                                name: true,
                                endereco: true,
                            }
                        },
                        cliente: {
                            select: {
                                id: true,
                                name: true,
                                endereco: true,
                                cnpj: true
                            }
                        }
                    }
                },
                cliente: {
                    select: {
                        id: true,
                        name: true,
                        endereco: true,
                    },
                },
                tecnico: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                tipodeChamado: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                tipodeOrdemdeServico: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                prioridade: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                tarefa: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                atividades: {
                    select: {
                        id: true,
                        atividadePadrao: {
                            select: {
                                id: true,
                                descricao: true,
                                categoria: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return ordem; 
    }
}

export { ListOrdemdeServicoId };