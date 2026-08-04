#!/usr/bin/env bash
#
# Chan viec vo tinh keo lai MySQL / SQL Server / Firebase / OTP da bi go khoi du an.
#
# Boi canh: mot so nhanh cu (Sp3-Unitest, epic-3/unit-test) duoc tach ra TRUOC khi
# du an migrate sang PostgreSQL va go dang nhap Google/Firebase. Merge nham cac nhanh
# do se dua stack quay ve trang thai cu ma khong gay xung dot ro rang. Script nay
# chay trong CI de bat truong hop do ngay tren pull request.
#
# Dung: bash scripts/guard-stack.sh   (chay tu thu muc goc cua repo)

set -uo pipefail

fail=0
err() { echo "❌ $1" >&2; fail=1; }
ok()  { echo "✓  $1"; }

# ---------- 1. Driver database trong pom.xml ----------
if grep -q 'org.postgresql' backend/pom.xml; then
  ok "pom.xml dung driver PostgreSQL"
else
  err "pom.xml mat driver PostgreSQL (org.postgresql)"
fi

for bad in mysql-connector-j mssql-jdbc firebase-admin; do
  if grep -q "$bad" backend/pom.xml; then
    err "pom.xml xuat hien lai dependency da go: $bad"
  fi
done

# ---------- 2. Phien ban Java / Spring Boot ----------
if grep -q '<java.version>17</java.version>' backend/pom.xml; then
  ok "java.version = 17"
else
  err "java.version khong con la 17 (nhanh cu dat 25)"
fi

# ---------- 3. File thuoc tinh nang da go ----------
stale=$(git ls-files | grep -iE 'OtpStore|firebase' || true)
if [ -n "$stale" ]; then
  err "File cua tinh nang da go quay lai: $(echo "$stale" | tr '\n' ' ')"
else
  ok "Khong con file OTP / Firebase"
fi

# ---------- 4. docker-compose ----------
if grep -qE 'image:[[:space:]]*postgres' docker-compose.yml; then
  ok "docker-compose dung PostgreSQL"
else
  err "docker-compose khong con service postgres"
fi

if grep -qiE 'image:[[:space:]]*mysql|image:[[:space:]]*.*sqlserver' docker-compose.yml; then
  err "docker-compose xuat hien lai MySQL / SQL Server"
fi

# ---------- 5. Chuoi ket noi trong properties ----------
badprops=$(grep -rlE 'jdbc:(mysql|sqlserver)' backend/src/main/resources/ 2>/dev/null || true)
if [ -n "$badprops" ]; then
  err "Xuat hien lai jdbc:mysql / jdbc:sqlserver trong: $(echo "$badprops" | tr '\n' ' ')"
else
  ok "Properties chi dung jdbc:postgresql"
fi

# ---------- 6. Frontend ----------
if [ -f frontend/package.json ] && grep -q '"firebase"' frontend/package.json; then
  err "frontend/package.json xuat hien lai dependency firebase"
else
  ok "Frontend khong phu thuoc firebase"
fi

echo
if [ $fail -eq 0 ]; then
  echo "✅ Stack nguyen ven: PostgreSQL, khong Firebase, khong OTP."
else
  echo "Stack bi keo lui. Xem README hoac lich su commit 707a37a / f56635a / ee366ce." >&2
fi
exit $fail
