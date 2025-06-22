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
  'fetch-weather', // título de la herramienta
  'Tool to fetch the weather of a city', // descripción de la herramienta
  {
    city: z.string().describe('City name'),
  },
  // Lo que queramos que haga la herramienta.
  async ({ city }) => {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=es&format=json`
    );
    const data = await response.json();

    if (data.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `No se encontró información para ${city}`,
          },
        ],
      };
    }

    const {latitude, longitude} = data.results[0];
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current=temperature_2m,precipitation,is_day,rain&forecast_days=1`
    );
    const weatherData = await weatherResponse.json();
    // IMPORTANTE: Nosotros no tratamos los datos de la API, sino que el LLM lo hace.

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(weatherData, null, 2),
        },
      ],
    };
  }
);

// 3. Escuchar las conexiones del cliente.
// Indicamos StdioServerTransport porque queremos que se ejecute en local.
const transport = new StdioServerTransport();
await server.connect(transport);