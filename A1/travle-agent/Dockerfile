FROM python:3.11-slim

WORKDIR /app

# 의존성 먼저 설치 (레이어 캐시 활용)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 소스 복사
COPY . .

# results 디렉토리 생성 (볼륨 마운트 전 기본값)
RUN mkdir -p results

EXPOSE 8000

# reload 없이 실행 (컨테이너 환경)
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
