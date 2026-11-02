@echo off
REM ==============================================================================
REM PROJECTX-RAY AI — BUILD MULTI-LANGUAGE SANDBOX RUNNER IMAGES (WINDOWS)
REM ==============================================================================

echo ====================================================================
echo  Building ProjectX-Ray AI Multi-Language Sandbox Runner Images...
echo ====================================================================

echo [1/6] Building runner-python:3.11...
docker build -t runner-python:3.11 -f Dockerfile.python .

echo [2/6] Building runner-rust:1.75...
docker build -t runner-rust:1.75 -f Dockerfile.rust .

echo [3/6] Building runner-java:21...
docker build -t runner-java:21 -f Dockerfile.java .

echo [4/6] Building runner-go:1.22...
docker build -t runner-go:1.22 -f Dockerfile.go .

echo [5/6] Building runner-cpp:13...
docker build -t runner-cpp:13 -f Dockerfile.cpp .

echo [6/6] Building runner-node:20...
docker build -t runner-node:20 -f Dockerfile.node .

echo ====================================================================
echo  All Multi-Language Sandbox Runner Images Successfully Built!
echo ====================================================================

