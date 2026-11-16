# Radar de Leads no Oracle Cloud (grátis)

Tempo: uns 20 minutos. No fim você acessa o Radar pelo celular, sem o PC ligado.

## 1. Criar a conta
1. Acesse https://www.oracle.com/br/cloud/free/ e clique em **Comece gratuitamente**.
2. Preencha nome, e-mail e endereço. Em **Região**, escolha **Brazil East (São Paulo)**. A região não pode ser trocada depois.
3. Informe o cartão. Ele é só para verificação; o plano "Always Free" não cobra.

## 2. Criar o servidor
1. No painel, abra o menu ☰ → **Compute** → **Instances** → **Create instance**.
2. **Name:** `radar`.
3. **Image and shape** → **Edit**:
   - **Image:** Canonical Ubuntu 24.04.
   - **Shape:** Ampere → `VM.Standard.A1.Flex` com 1 OCPU e 6 GB (marcado "Always Free-eligible").
     Se aparecer "Out of capacity", use `VM.Standard.E2.1.Micro` (AMD) ou tente mais tarde.
4. **Networking:** deixe criar a rede nova e confira que **Assign a public IPv4 address** está marcado.
5. **Add SSH keys:** escolha **Generate a key pair for me** e clique em **Save private key** (guarde o arquivo).
6. Abra **Show advanced options** → aba **Management** → **Paste cloud-init script** e cole isto, trocando a senha na segunda linha:

```bash
#!/bin/bash
export RADAR_SENHA='TROQUE-ESTA-SENHA'
curl -fsSL https://raw.githubusercontent.com/BeckerO01/trabalho/claude/smart-lead-tracker-3ziot6/deploy/instalar.sh | bash
```

   A senha precisa ter pelo menos 8 caracteres e não pode conter aspas simples.
7. Clique em **Create**. Quando ficar verde (**Running**), copie o **Public IP address**.

## 3. Liberar a porta
1. Na página da instância, clique no nome da **Subnet** → depois na **Default Security List**.
2. **Add Ingress Rules**:
   - **Source CIDR:** `0.0.0.0/0`
   - **IP Protocol:** TCP
   - **Destination Port Range:** `8090`
3. **Add Ingress Rules** para salvar.

## 4. Acessar
Espere uns 10 minutos (o servidor está instalando tudo sozinho) e abra no navegador:

```
http://SEU-IP:8090
```

Digite a senha que você escolheu. No celular, é o mesmo endereço.

## Se não abrir
- Espere mais 5 minutos e tente de novo.
- Confira a regra da porta 8090 (passo 3) e se o endereço começa com `http://`, não `https://`.
- Para ver o que aconteceu, entre no servidor (`ssh -i sua-chave.key ubuntu@SEU-IP`) e rode:
  `sudo tail -30 /var/log/radar-instalacao.log`

## Atualizar o programa
No servidor: `sudo radar-atualizar`

## Bom saber
- O acesso é por `http`, sem cadeado. Use uma senha só para o Radar, que você não usa em outro lugar.
- Sem `https`, o botão **Enviar ao Claude** não consegue copiar: ele baixa um arquivo `.json`, que você importa no Radar do Claude em **Escolher arquivo .json**.
- O repositório do GitHub precisa estar **público** para o servidor conseguir baixar o programa.
- O Google pode pedir captcha para buscas vindas da nuvem. Se as buscas voltarem vazias, faça a busca no PC.
- A Oracle pode desligar servidores gratuitos que ficam muitos dias sem uso.
