#!/bin/sh
# ============================================
# Script de Teste de Conexão
# ============================================
# Use este script para verificar se o app
# consegue conectar ao banco de dados
# ============================================

echo "🔍 Testando configuração do MK-Ops License Manager"
echo "=================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# 1. Verificar se os containers estão rodando
# ============================================
echo "\n📦 1. Verificando containers..."

DB_RUNNING=$(docker ps --filter "name=mkops_licenses_db" --format "{{.Status}}" 2>/dev/null)
APP_RUNNING=$(docker ps --filter "name=mkops_licenses_app" --format "{{.Status}}" 2>/dev/null)

if [ -z "$DB_RUNNING" ]; then
    echo "${RED}❌ Container do banco (mkops_licenses_db) não está rodando${NC}"
    exit 1
else
    echo "${GREEN}✅ DB Container: $DB_RUNNING${NC}"
fi

if [ -z "$APP_RUNNING" ]; then
    echo "${RED}❌ Container do app (mkops_licenses_app) não está rodando${NC}"
    exit 1
else
    echo "${GREEN}✅ App Container: $APP_RUNNING${NC}"
fi

# ============================================
# 2. Verificar rede
# ============================================
echo "\n🌐 2. Verificando rede..."

DB_NETWORK=$(docker inspect mkops_licenses_db --format '{{range $key, $value := .NetworkSettings.Networks}}{{$key}} {{end}}' 2>/dev/null)
APP_NETWORK=$(docker inspect mkops_licenses_app --format '{{range $key, $value := .NetworkSettings.Networks}}{{$key}} {{end}}' 2>/dev/null)

if [ "$DB_NETWORK" = "$APP_NETWORK" ]; then
    echo "${GREEN}✅ Ambos containers estão na rede: $DB_NETWORK${NC}"
else
    echo "${RED}❌ Containers em redes diferentes!${NC}"
    echo "   DB: $DB_NETWORK"
    echo "   App: $APP_NETWORK"
    exit 1
fi

# ============================================
# 3. Verificar variáveis de ambiente do App
# ============================================
echo "\n🔐 3. Verificando variáveis de ambiente..."

DATABASE_URL=$(docker exec mkops_licenses_app printenv DATABASE_URL 2>/dev/null)

if [ -z "$DATABASE_URL" ]; then
    echo "${RED}❌ DATABASE_URL não está definida no container!${NC}"
    exit 1
else
    # Mascarar a senha na exibição
    MASKED_URL=$(echo "$DATABASE_URL" | sed -E 's/:([^@]+)@/:****@/')
    echo "${GREEN}✅ DATABASE_URL: $MASKED_URL${NC}"
fi

# ============================================
# 4. Testar conexão PostgreSQL
# ============================================
echo "\n🔌 4. Testando conexão com PostgreSQL..."

PG_READY=$(docker exec mkops_licenses_db pg_isready -U postgres 2>&1)

if echo "$PG_READY" | grep -q "accepting connections"; then
    echo "${GREEN}✅ PostgreSQL está aceitando conexões${NC}"
else
    echo "${RED}❌ PostgreSQL não está pronto: $PG_READY${NC}"
    exit 1
fi

# ============================================
# 5. Testar conexão do Prisma
# ============================================
echo "\n🔗 5. Testando conexão Prisma..."

PRISMA_TEST=$(docker exec mkops_licenses_app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect()
  .then(() => { 
    console.log('CONNECTED'); 
    return prisma.\$disconnect(); 
  })
  .catch((e) => { 
    console.error('ERROR:', e.message); 
    process.exit(1); 
  });
" 2>&1)

if echo "$PRISMA_TEST" | grep -q "CONNECTED"; then
    echo "${GREEN}✅ Prisma conseguiu conectar ao banco${NC}"
else
    echo "${RED}❌ Prisma não conseguiu conectar:${NC}"
    echo "$PRISMA_TEST"
    exit 1
fi

# ============================================
# 6. Testar API Health
# ============================================
echo "\n🏥 6. Testando endpoint /api/health..."

HEALTH_CHECK=$(docker exec mkops_licenses_app node -e "
require('http').get('http://localhost:3000/api/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', data);
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
}).on('error', (e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
" 2>&1)

if echo "$HEALTH_CHECK" | grep -q "STATUS: 200"; then
    echo "${GREEN}✅ API Health check passou${NC}"
    echo "$HEALTH_CHECK"
else
    echo "${RED}❌ API Health check falhou:${NC}"
    echo "$HEALTH_CHECK"
    exit 1
fi

# ============================================
# 7. Verificar logs recentes
# ============================================
echo "\n📋 7. Últimas linhas dos logs do app..."
echo "---"
docker logs mkops_licenses_app --tail 10 2>&1
echo "---"

# ============================================
# RESUMO
# ============================================
echo "\n=================================================="
echo "${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
echo "=================================================="
echo "O app está configurado corretamente e pode conectar ao banco."
echo ""
echo "Próximos passos:"
echo "  • Acesse: http://localhost:3000/api/health"
echo "  • Configure o Nginx Proxy Manager para apontar para: http://mkops_licenses_app:3000"
echo ""
