const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput= document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
  const converter = new showdown.Converter()
  return converter.makeHtml(text)
}

const perguntarAI = async (question, game, apiKey) => {
  const model = "gemini-2.0-flash"
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const perguntaLOL = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas.
    -Responda sempre de acordo com a lingua do usuário, se o usuário perguntar em português, responda em português, se o usuário perguntar em inglês, responda em inglês para todo o conteúdo.

    ## Regras
  - Se você nao souber a resposta, responda "Desculpe, não sei a resposta para isso" e não tente inventar uma resposta.
  - Se a pergunta não está relacionada ao jogo, responda essa pergunta com "Desculpe, não posso ajudar com isso, por favor pergunte algo relacionado ao jogo ${game}".
  - Considere a data atual ${new Date().toLocaleDateString()} para responder as perguntas, e não use informações desatualizadas.
  - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta precisa e coerente.
  - Nunca responda itens que você não tenha certeza de que existe no patch atual.

    ## Resposta
  -Economize na resposta, seja direto e responda no máximo 500 caracteres.
  -Responda em markdown
  - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
  Pergunta do usuário: "Qual é a melhor build para o campeão X no patch atual?"
  Resposta: "A melhor build e mais atual para o campeão X no patch atual é: \n\n **Itens:**\n\n coloque os itens aqui. \n\n**Runas:**\n\nexemplo de runas\n\n

  ---
  Aqui está a pergunta do usuário: "${question}"
    
  `
  const perguntaValorant = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas.
    -Responda sempre de acordo com a lingua do usuário, se o usuário perguntar em português, responda em português, se o usuário perguntar em inglês, responda em inglês para todo o conteúdo.

    ## Regras
  - Se você nao souber a resposta, responda "Desculpe, não sei a resposta para isso" e não tente inventar uma resposta.
  - Se a pergunta não está relacionada ao jogo, responda essa pergunta com "Desculpe, não posso ajudar com isso, por favor pergunte algo relacionado ao jogo Valorant".
  - Considere a data atual ${new Date().toLocaleDateString()} para responder as perguntas, e não use informações desatualizadas.
  - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta precisa e coerente.
  - Nunca responda itens que você não tenha certeza de que existe no patch atual.

    ## Resposta
  -Economize na resposta, seja direto e responda no máximo 500 caracteres.
  -Responda em markdown
  - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
  Pergunta do usuário: "Qual é o melhor agente para iniciantes?"
  Resposta: "O melhor agente para iniciantes no patch atual é o Sage por sua utilidade e facilidade de uso."

  ---
  Aqui está a pergunta do usuário: "${question}"
  `

  const perguntaCS2 = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}

    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, Builds, Estratégias e dicas.
    -Responda sempre de acordo com a lingua do usuário, se o usuário perguntar em português, responda em português, se o usuário perguntar em inglês, responda em inglês para todo o conteúdo.

    ## Regras
  - Se você nao souber a resposta, responda "Desculpe, não sei a resposta para isso" e não tente inventar uma resposta.
  - Se a pergunta não está relacionada ao jogo, responda essa pergunta com "Desculpe, não posso ajudar com isso, por favor pergunte algo relacionado ao jogo CS2".
  - Considere a data atual ${new Date().toLocaleDateString()} para responder as perguntas, e não use informações desatualizadas.
  - Faça pesquisas atualizadas sobre o meta atual, baseado na data atual, para dar uma resposta precisa e coerente.
  - Nunca responda itens que você não tenha certeza de que existe no patch atual.

    ## Resposta
  -Economize na resposta, seja direto e responda no máximo 500 caracteres.
  -Responda em markdown
  - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.

    ## Exemplo de resposta
  Pergunta do usuário: "Qual a melhor granada para segurar o bomb B?"
  Resposta: "A melhor granada para segurar o bomb B é a smoke CT e molotov no túnel superior."

  ---
  Aqui está a pergunta do usuário: "${question}"
  `

  let pergunta = '' // variável que vai receber o conteúdo da const correspondente

  if (game === 'valorant') {
    pergunta = perguntaValorant
  } else if (game === 'cs2') {
    pergunta = perguntaCS2
  } else if (game === 'lol') {
    pergunta = perguntaLOL
  }

  const contents = [{
    role: "user",
    parts: [{
      text: pergunta
    }]
  }]

  const tools = [{
    google_search: {}
  }]

  // Chamada API
  const response = await fetch(geminiURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents,
      tools
    })
  })

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async (event) => {
    event.preventDefault()
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if (apiKey == '' || game == '' || question == '') {
        alert('Por favor, preencha todos os campos')
        return
    }

  askButton.disabled = true
  askButton.textContent = 'Perguntando...'
  askButton.classList.add('loading')

  try {
   const text = await perguntarAI(question, game, apiKey)
   aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
   aiResponse.classList.remove('hidden')
  } catch (error) {
    console.log('Erro: ', error)
  } finally {
    askButton.disabled = false
    askButton.textContent = 'Perguntar'
    askButton.classList.remove('loading')
  }

}
form.addEventListener('submit', enviarFormulario)