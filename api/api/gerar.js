javascriptexport default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Texto do pedido (prompt) não informado' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'Chave de API não configurada no servidor. Configure a variável ANTHROPIC_API_KEY na Vercel.'
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'Erro ao chamar a API da Anthropic'
      });
    }

    const texto = (data.content || [])
      .map((bloco) => bloco.text || '')
      .join('\n');

    return res.status(200).json({ texto });
  } catch (err) {
    return res.status(500).json({ error: 'Erro de conexão com a API: ' + err.message });
  }
}
