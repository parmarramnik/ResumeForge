# Build stage for Tectonic LaTeX Engine & FastAPI Compiler
FROM rust:1.83-slim-bookworm AS tectonic-builder
RUN apt-get update && apt-get install -y --no-install-recommends \
    libfontconfig1-dev \
    libgraphite2-dev \
    libharfbuzz-dev \
    libicu-dev \
    libssl-dev \
    zlib1g-dev \
    pkg-config \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN cargo install tectonic --locked

# Final minimal execution stage
FROM python:3.11-slim-bookworm

# Install runtime libraries for tectonic and latex fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    libfontconfig1 \
    libgraphite2-3 \
    libharfbuzz0b \
    libicu72 \
    libssl3 \
    zlib1g \
    fontconfig \
    fonts-lmodern \
    fonts-texgyre \
    texlive-fonts-recommended \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-plain-generic \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy tectonic from builder
COPY --from=tectonic-builder /usr/local/cargo/bin/tectonic /usr/local/bin/tectonic

# Create isolated non-root user
RUN groupadd -g 10001 sandboxgroup && \
    useradd -u 10001 -g sandboxgroup -s /bin/bash -m sandboxuser

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/

# Set sandbox permissions
RUN chown -R sandboxuser:sandboxgroup /app /home/sandboxuser

USER sandboxuser

ENV PYTHONUNBUFFERED=1
ENV COMPILER_TIMEOUT=8
ENV MAX_INPUT_BYTES=2097152

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
