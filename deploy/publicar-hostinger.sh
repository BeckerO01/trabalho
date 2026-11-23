#!/bin/bash
# Envia um arquivo para a hospedagem Hostinger pelo protocolo TUS.
# As chaves são temporárias: o Claude gera na hora com o conector da Hostinger
# (hosting_files_generate-upload-url) e passa por variável de ambiente. Nunca salve chaves no repositório.
# Uso: HOST_URL=... HOST_AUTH=... HOST_REST=... bash deploy/publicar-hostinger.sh <arquivo-local> <destino-em-public_html>
# Ex.:  ... bash deploy/publicar-hostinger.sh sites/clinica-x/index.html clinica-x/index.html
set -euo pipefail
ARQ="$1"; DEST="$2"
: "${HOST_URL:?falta HOST_URL}" "${HOST_AUTH:?falta HOST_AUTH}" "${HOST_REST:?falta HOST_REST}"
SIZE=$(stat -c%s "$ARQ" 2>/dev/null || stat -f%z "$ARQ")
H=(-H "X-Auth: $HOST_AUTH" -H "X-Auth-Rest: $HOST_REST" -H "Tus-Resumable: 1.0.0")
code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$HOST_URL/$DEST?override=true" "${H[@]}" -H "Upload-Length: $SIZE" -H "Upload-Offset: 0")
[ "$code" = "201" ] || { echo "Falha ao criar o envio ($code)"; exit 1; }
off=$(curl -s -D - -o /dev/null -X PATCH "$HOST_URL/$DEST?override=true" "${H[@]}" -H "Content-Type: application/offset+octet-stream" -H "Upload-Offset: 0" --data-binary "@$ARQ" | tr -d '\r' | awk -F': ' 'tolower($1)=="upload-offset"{print $2}')
[ "$off" = "$SIZE" ] || { echo "Envio incompleto ($off de $SIZE bytes)"; exit 1; }
echo "Enviado: $DEST ($SIZE bytes)"
