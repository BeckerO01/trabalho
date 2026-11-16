#!/bin/bash
# Instala o Radar de Leads num servidor Ubuntu (Oracle Cloud, plano gratuito).
# Uso (como root):  RADAR_SENHA='sua-senha' bash instalar.sh
set -euo pipefail
exec > >(tee -a /var/log/radar-instalacao.log) 2>&1

REPO="https://github.com/BeckerO01/trabalho.git"
BRANCH="claude/smart-lead-tracker-3ziot6"
DIR=/opt/radar
PORTA=8090

if [ -z "${RADAR_SENHA:-}" ] || [ "${#RADAR_SENHA}" -lt 8 ] || echo "$RADAR_SENHA" | grep -qi troque; then
  echo "ERRO: defina RADAR_SENHA com pelo menos 8 caracteres (e troque a senha de exemplo)."; exit 1
fi
export DEBIAN_FRONTEND=noninteractive

echo "== 1/6 Memória extra (swap de 2 GB) =="
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q /swapfile /etc/fstab || echo "/swapfile none swap sw 0 0" >> /etc/fstab
fi

echo "== 2/6 Node.js 22 e git =="
apt-get update -y
apt-get install -y curl git ca-certificates
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 18 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

echo "== 3/6 Baixando o programa =="
id radar >/dev/null 2>&1 || useradd --system --home "$DIR" --shell /usr/sbin/nologin radar
if [ -d "$DIR/.git" ]; then git -C "$DIR" pull --ff-only; else git clone --depth 1 -b "$BRANCH" "$REPO" "$DIR"; fi
cd "$DIR"
npm ci --omit=dev --no-audit --no-fund

echo "== 4/6 Navegador Chromium =="
export PLAYWRIGHT_BROWSERS_PATH="$DIR/browsers"
npx playwright install --with-deps chromium
mkdir -p "$DIR/data"
chown -R radar:radar "$DIR"

echo "== 5/6 Serviço (liga sozinho ao reiniciar) =="
printf 'RADAR_SENHA=%s\nPORT=%s\nPLAYWRIGHT_BROWSERS_PATH=%s\n' "$RADAR_SENHA" "$PORTA" "$DIR/browsers" > /etc/radar.env
chmod 600 /etc/radar.env
cat > /etc/systemd/system/radar.service <<UNIT
[Unit]
Description=Radar de Leads
After=network-online.target
Wants=network-online.target

[Service]
User=radar
WorkingDirectory=$DIR
EnvironmentFile=/etc/radar.env
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

# comando de atualização: sudo radar-atualizar
cat > /usr/local/bin/radar-atualizar <<UPD
#!/bin/bash
set -e
cd $DIR
sudo -u radar git pull --ff-only
sudo -u radar env PLAYWRIGHT_BROWSERS_PATH=$DIR/browsers npm ci --omit=dev --no-audit --no-fund
systemctl restart radar
echo "Radar atualizado."
UPD
chmod +x /usr/local/bin/radar-atualizar
systemctl daemon-reload
systemctl enable --now radar

echo "== 6/6 Liberando a porta $PORTA no firewall do servidor =="
if command -v iptables >/dev/null; then
  iptables -C INPUT -p tcp --dport "$PORTA" -j ACCEPT 2>/dev/null || iptables -I INPUT -p tcp --dport "$PORTA" -j ACCEPT
  command -v netfilter-persistent >/dev/null && netfilter-persistent save || true
fi

sleep 3
if curl -fsS -o /dev/null "http://127.0.0.1:$PORTA/login"; then
  echo "PRONTO: Radar de Leads no ar em http://IP-DO-SERVIDOR:$PORTA"
else
  echo "ERRO: o serviço não respondeu. Veja: journalctl -u radar -n 50"; exit 1
fi
