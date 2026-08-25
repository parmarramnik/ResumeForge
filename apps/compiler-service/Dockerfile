# Multi-engine, comprehensive LaTeX Compiler Service Dockerfile
FROM python:3.11-slim-bookworm

# Install runtime libraries, fonts, and LaTeX engines (pdflatex, xelatex, lualatex, full TeX Live packages)
RUN apt-get -o Acquire::Check-Valid-Until=false -o Acquire::Check-Date=false update && \
    apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    fontconfig \
    cm-super \
    fonts-lmodern \
    fonts-texgyre \
    fonts-font-awesome \
    fonts-roboto \
    fonts-open-sans \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-xetex \
    texlive-luatex \
    texlive-pictures \
    texlive-science \
    texlive-plain-generic \
    tar \
    gzip \
    && fc-cache -fv \
    && rm -rf /var/lib/apt/lists/*

# Install official precompiled standalone static musl Tectonic binary (zero glibc issue)
RUN curl -fsSL https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.15.0/tectonic-0.15.0-x86_64-unknown-linux-musl.tar.gz | tar -xz -C /usr/local/bin && \
    chmod +x /usr/local/bin/tectonic

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
ENV COMPILER_TIMEOUT=15
ENV MAX_INPUT_BYTES=2097152

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["python", "src/standalone_server.py"]
