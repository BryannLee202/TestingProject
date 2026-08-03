#!/usr/bin/env bash
#
# Chay bo kiem thu API Member 5 bang Newman va xuat bao cao HTML.
#
#   ./run-newman.sh              # dung environment Local (mac dinh)
#   ./run-newman.sh docker       # dung environment Docker (chay trong mang compose)
#
# Script kiem tra backend co song khong TRUOC khi chay, vi loi hay gap nhat
# khong phai loi test ma la quen bat backend.

set -euo pipefail

cd "$(dirname "$0")"

COLLECTION="YiYi_Book_API_Collection_Tai.json"
PROFILE="${1:-local}"

if [ "$PROFILE" = "docker" ]; then
  ENVIRONMENT="YiYi_Book_Docker_Environment_Tai.json"
else
  ENVIRONMENT="YiYi_Book_Local_Environment_Tai.json"
fi

# Lay baseUrl tu chinh file environment de khong khai bao trung o hai noi.
BASE_URL="$(node -e "
  const env = require('./${ENVIRONMENT}');
  const v = env.values.find(x => x.key === 'baseUrl');
  process.stdout.write(v ? v.value : '');
")"

echo "==> Collection : ${COLLECTION}"
echo "==> Environment: ${ENVIRONMENT}"
echo "==> Base URL   : ${BASE_URL}"
echo

echo "==> Kiem tra backend..."
if ! curl -sS -f -m 10 "${BASE_URL}/ping" > /dev/null 2>&1; then
  echo "LOI: khong goi duoc ${BASE_URL}/ping" >&2
  echo "" >&2
  echo "Hay bat backend truoc:" >&2
  echo "  docker compose up --build       (tu thu muc goc cua repo)" >&2
  echo "" >&2
  echo "Neu backend chay o cong khac, sua 'baseUrl' trong ${ENVIRONMENT}." >&2
  exit 1
fi
echo "    backend OK"
echo

# Uu tien newman cai cuc bo (npm install trong thu muc nay), sau do moi den ban global.
if [ -x "node_modules/.bin/newman" ]; then
  NEWMAN="node_modules/.bin/newman"
elif command -v newman > /dev/null 2>&1; then
  NEWMAN="newman"
else
  echo "LOI: chua cai newman." >&2
  echo "Chay: npm install        (cai cuc bo trong thu muc nay)" >&2
  echo "hoac: npm install -g newman newman-reporter-htmlextra" >&2
  exit 1
fi

mkdir -p newman

"${NEWMAN}" run "${COLLECTION}" \
  --environment "${ENVIRONMENT}" \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export "newman/newman-report.html" \
  --reporter-htmlextra-title "YiYi Bookstore API Test Report - Member 5" \
  --delay-request 100

# set -e da lo phan exit code: newman tra khac 0 khi co test that bai.
echo
echo "==> Bao cao HTML: $(pwd)/newman/newman-report.html"
