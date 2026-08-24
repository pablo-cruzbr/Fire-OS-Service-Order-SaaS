import "dotenv/config";
import express from "express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { uploadQueue } from "./uploadQueue";

// Painel visual só pra olhar a fila — não tem nada a ver com a API
// principal do Fire OS, é só uma ferramenta de desenvolvimento.
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullMQAdapter(uploadQueue)],
  serverAdapter,
});

const app = express();
app.use("/admin/queues", serverAdapter.getRouter());

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Painel da fila em http://localhost:${PORT}/admin/queues`);
});
