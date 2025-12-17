# Flutter Mobile Dockerfile for APK Build
FROM ubuntu:22.04 AS builder

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    xz-utils \
    zip \
    libglu1-mesa \
    openjdk-17-jdk \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set up Flutter
ENV FLUTTER_HOME=/opt/flutter
ENV PATH="$FLUTTER_HOME/bin:$PATH"

RUN git clone --depth 1 --branch stable https://github.com/flutter/flutter.git $FLUTTER_HOME && \
    flutter precache && \
    flutter config --no-analytics && \
    flutter doctor -v

# Set up Android SDK
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"

RUN mkdir -p $ANDROID_SDK_ROOT/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O cmdline-tools.zip && \
    unzip -q cmdline-tools.zip -d $ANDROID_SDK_ROOT/cmdline-tools && \
    mv $ANDROID_SDK_ROOT/cmdline-tools/cmdline-tools $ANDROID_SDK_ROOT/cmdline-tools/latest && \
    rm cmdline-tools.zip

# Accept Android licenses
RUN yes | sdkmanager --licenses || true

# Install Android SDK components
RUN sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"

WORKDIR /app

# Copy Flutter project
COPY pubspec.* ./
RUN flutter pub get

COPY . .

# Build APK
RUN flutter build apk --release

# Copy APK to shared volume
CMD ["sh", "-c", "cp /app/build/app/outputs/flutter-apk/app-release.apk /apk/client.apk && echo 'APK copied to shared volume' && exit 0"]
