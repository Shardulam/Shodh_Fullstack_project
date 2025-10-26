FROM openjdk:17-jdk-slim
WORKDIR /workspace

# This image is intentionally minimal. It allows the service to mount a directory
# containing source (Main.java), compile and run it. The Java service will run
# docker run -v <host>:/workspace -w /workspace openjdk:17 bash -c "javac Main.java && java Main"
RUN apt-get update && apt-get install -y --no-install-recommends bash && rm -rf /var/lib/apt/lists/*

CMD ["bash"]
