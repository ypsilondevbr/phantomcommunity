# Tutorial Completo: Hospedagem e Configuração do Phantom Community AI 👻

Este é o guia definitivo para configurar as chaves do **Discord** e do **Google Gemini**, colocar o bot para rodar e hospedá-lo 24 horas por dia na **Railway**.

---

## 🚀 Passo 1: Pegando as Chaves Necessárias

### 1. Token do Discord
1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications).
2. Clique em **"New Application"** e dê o nome do seu bot.
3. No menu à esquerda, vá na aba **"Bot"**.
4. Clique em **"Reset Token"** (ou "Copy") e copie o código gerado.
5. 🚨 **ATIVAR INTENTS (OBRIGATÓRIO):** Ainda na tela do Bot, role para baixo até **"Privileged Gateway Intents"**. Ative (deixe azul) os botões:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent
6. Clique em **Save Changes** (botão verde no rodapé).

### 2. Chave de IA (Google Gemini - Grátis)
O Phantom foi projetado para usar o incrível plano gratuito do Gemini 2.5 Pro.
1. Acesse o [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Faça login com uma conta Google.
3. Clique no botão azul **"Create API key"** no topo esquerdo.
4. Clique em "Create API key in new project".
5. Copie a chave (API Key) que foi gerada. Guarde bem.

---

## ⚙️ Passo 2: Configurando o Projeto

1. Na pasta `phantom-community` que foi criada para o seu projeto, existe um arquivo chamado `.env.example`.
2. **Renomeie** este arquivo apenas para `.env` (removendo o `.example`).
3. Abra-o no Bloco de Notas ou VS Code e preencha com as chaves copiadas no Passo 1.
   
Ele deve ficar parecido com isso (mas com os seus códigos reais):
```env
DISCORD_TOKEN=MTE5xyz123...
GEMINI_API_KEY=AIzaSyA...
PORT=3000
```
4. Salve o arquivo.

*(Se quiser testar o bot no seu PC antes de enviar para a nuvem, basta abrir o terminal na pasta `phantom-community`, digitar `npm install` e depois `npm start`)*.

---

## ☁️ Passo 3: Hospedagem 24/7 na Railway

### Preparando o Projeto para Nuvem
Como seu projeto tem mais de uma pasta (o bot antigo e o `phantom-community`), a forma mais fácil é criar um novo repositório no GitHub contendo **apenas** o conteúdo de dentro da pasta `phantom-community`.

1. Arraste todos os arquivos de dentro da pasta `phantom-community` para um novo repositório do GitHub chamado, por exemplo, `phantom-community-bot`.
2. O arquivo `nixpacks.toml` que instrui a instalação do Python e ferramentas de compilação já está incluído lá dentro para evitar o erro antigo!

### Hospedando (Deploy)
1. Acesse a [Railway](https://railway.app) e faça login.
2. Clique em **"New Project"** -> **"Deploy from GitHub repo"**.
3. Escolha o seu novo repositório (`phantom-community-bot`).
4. **IMPORTANTE:** Vá imediatamente na aba **"Variables"** desse projeto na Railway.
5. Adicione as mesmas variáveis do seu `.env` lá na Railway:
   - Nome: `DISCORD_TOKEN` | Valor: (Cole o token)
   - Nome: `GEMINI_API_KEY` | Valor: (Cole a chave)
   - *(A Railway criará a PORT sozinha).*
6. O deploy vai iniciar automaticamente. 

Como nós configuramos um *Express Server* em `src/index.js`, a Railway verá que o bot "abriu a porta 3000" para acesso web e vai manter seu processo vivo para sempre, sem dar erro de saúde (healthcheck).

---

## 🎮 Passo 4: Convidando e Usando

1. Volte ao [Discord Developer Portal](https://discord.com/developers/applications).
2. Vá em **"OAuth2" -> "URL Generator"**.
3. Em *Scopes*, marque a opção **`bot`**.
4. Em *Bot Permissions*, marque **`Administrator`** (necessário para a IA criar canais e cargos sozinha).
5. Copie o link lá embaixo, cole no navegador e coloque o bot no seu servidor.

### Teste Rápido
No Discord, digite:
```
.phantom status
```
O bot deve responder rapidamente confirmando que o Banco SQLite e a IA estão conectados.
Em seguida, digite:
```
.phantom o que você é?
```
E você verá o Google Gemini (Cérebro do Phantom) respondendo a você como um administrador do seu servidor!

Parabéns, seu Agente Administrativo Autônomo está operacional! 🎉
