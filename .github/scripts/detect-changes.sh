#!/bin/bash

# 변경 감지 스크립트
# main 브랜치와 비교하여 변경된 서비스를 감지합니다.

set -e

BASE_BRANCH="${1:-origin/main}"
CHANGED_FILES=$(git diff --name-only "$BASE_BRANCH"...HEAD)

echo "Changed files:"
echo "$CHANGED_FILES"
echo ""

# 변경된 서비스 추적
CHANGED_SERVICES=()

# 각 서비스별 변경 감지
check_service_change() {
  local service_name=$1
  local service_path=$2

  if echo "$CHANGED_FILES" | grep -q "^${service_path}/"; then
    CHANGED_SERVICES+=("$service_name")
    return 0
  fi
  return 1
}

# 공통 패키지 변경 감지 및 의존 서비스 추가
check_package_dependencies() {
  local package_name=$1
  shift
  local dependent_services=("$@")

  if echo "$CHANGED_FILES" | grep -q "^packages/${package_name}/"; then
    echo "Package ${package_name} changed, adding dependent services..."
    for service in "${dependent_services[@]}"; do
      if [[ ! " ${CHANGED_SERVICES[@]} " =~ " ${service} " ]]; then
        CHANGED_SERVICES+=("$service")
      fi
    done
  fi
}

# 서비스별 변경 감지
check_service_change "frontend" "frontend" || true
check_service_change "api-server" "backend/api-server" || true
check_service_change "ticket-server" "backend/ticket-server" || true
check_service_change "queue-backend" "queue-backend" || true

# 공통 패키지 변경 시 의존 서비스 추가
check_package_dependencies "shared-types" "api-server" "ticket-server"
check_package_dependencies "backend-config" "queue-backend"
check_package_dependencies "shared-constants" "queue-backend"

# 결과 출력
if [ ${#CHANGED_SERVICES[@]} -eq 0 ]; then
  echo "No services changed"
  echo "changed_services=[]" >> $GITHUB_OUTPUT
  echo "has_changes=false" >> $GITHUB_OUTPUT
else
  echo "Changed services:"
  printf '%s\n' "${CHANGED_SERVICES[@]}"

  # JSON 배열 생성 (jq 없이)
  SERVICES_JSON="["
  FIRST=true
  for service in "${CHANGED_SERVICES[@]}"; do
    if [ "$FIRST" = true ]; then
      SERVICES_JSON+="\"$service\""
      FIRST=false
    else
      SERVICES_JSON+=",\"$service\""
    fi
  done
  SERVICES_JSON+="]"

  echo "changed_services=$SERVICES_JSON" >> $GITHUB_OUTPUT
  echo "has_changes=true" >> $GITHUB_OUTPUT
fi

# 개별 서비스 플래그 설정 (변경 여부와 관계없이 항상 설정)
for service in "frontend" "api-server" "ticket-server" "queue-backend"; do
  if [[ " ${CHANGED_SERVICES[@]} " =~ " ${service} " ]]; then
    echo "${service//-/_}_changed=true" >> $GITHUB_OUTPUT
  else
    echo "${service//-/_}_changed=false" >> $GITHUB_OUTPUT
  fi
done
