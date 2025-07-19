import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// 1. Crear el servidor.
// Es la interfaz principal con el protocolo MCP. Maneja la comunicación entre el cliente y el servidor.
const server = new McpServer({
  name: 'Demo',
  version: '1.0.0',
});

// 2. Definir las herramientas.
// Las herramientas le permite al LLM realizar acciones a través de tu servidor.
// Le pasamos un nombre, una descripción y un esquema de entrada y salida para cada herramienta.
// Cuanta más informaación demos, más contexto tendrá el LLM para usarlas correctamente.
server.tool(
  'Flutter-Chat-Crear-usuario', // título de la herramienta
  'Flutter-Chat - Crear un usuario nuevo', // descripción de la herramienta
  {
    nombre: z.string().describe('Nombre del usuario'),
    email: z.string().email().describe('Email del usuario'),
    password: z.string().describe('Contraseña del usuario'),
  },
  // Lo que queramos que haga la herramienta.
  async ({ nombre, email, password }) => {
    const response = await fetch(`http://localhost:3000/api/login/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre, email, password }),
    });
    const data = await response.json();
    // IMPORTANTE: Nosotros no tratamos los datos de la API, sino que el LLM lo hace.

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

server.tool(
  'Flutter-Chat-Login', // título de la herramienta
  'Flutter-Chat - Hacer login', // descripción de la herramienta
  {
    email: z.string().email().describe('Email del usuario'),
    password: z.string().describe('Contraseña del usuario'),
  },
  // Lo que queramos que haga la herramienta.
  async ({ email, password }) => {
    const response = await fetch(`http://localhost:3000/api/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    // IMPORTANTE: Nosotros no tratamos los datos de la API, sino que el LLM lo hace.

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(data, null, 2),
        },
      ],
    };
  }
);

// 3. Escuchar las conexiones del cliente.
// Indicamos StdioServerTransport porque queremos que se ejecute en local.
const transport = new StdioServerTransport();
await server.connect(transport);
