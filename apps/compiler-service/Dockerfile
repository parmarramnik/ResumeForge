# Multi-stage secure Dockerfile for LaTeX Compiler Service
FROM python:3.11-slim-bookworm

# Install runtime libraries, fonts, and LaTeX engines
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    fontconfig \
    fonts-lmodern \
    fonts-texgyre \
    texlive-fonts-recommended \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-plain-generic \
    && rm -rf /var/lib/apt/lists/*

# Install official precompiled standalone Tectonic binary
RUN curl -fsSL https://drop-sh.fullyjustified.net | sh && \
    mv tectonic /usr/local/bin/tectonic

# Create isolated non-root user
RUN groupadd -g 10001 sandboxgroup && \
    useradd -u 10001 -g sandboxgroup -s /bin/bash -m sandboxuser

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/

# Set permissions
RUN chown -R sandboxuser:sandboxgroup /app /home/sandboxuser

USER sandboxuser

ENV PYTHONUNBUFFERED=1
ENV COMPILER_TIMEOUT=8
ENV MAX_INPUT_BYTES=2097152

EXPOSE 8000

CMD ["python", "src/standalone_server.py"]
