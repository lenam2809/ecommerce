# =============================================================================
# Stage 1: Build
# =============================================================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files first for layer caching
COPY Ecommerce.sln ./
COPY Ecommerce.Domain/Ecommerce.Domain.csproj ./Ecommerce.Domain/
COPY Ecommerce.Application/Ecommerce.Application.csproj ./Ecommerce.Application/
COPY Ecommerce.Infrastructure/Ecommerce.Infrastructure.csproj ./Ecommerce.Infrastructure/
COPY Ecommerce.WebAPI/Ecommerce.WebAPI.csproj ./Ecommerce.WebAPI/

# Restore dependencies
RUN dotnet restore Ecommerce.WebAPI/Ecommerce.WebAPI.csproj

# Copy full source code
COPY . .

# Build and publish
RUN dotnet publish Ecommerce.WebAPI/Ecommerce.WebAPI.csproj -c Release -o /app/publish --no-restore

# =============================================================================
# Stage 2: Runtime
# =============================================================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Create non-root user for security
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Copy published output
COPY --from=build /app/publish .

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000

# Environment variables
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

# Entry point
ENTRYPOINT ["dotnet", "Ecommerce.WebAPI.dll"]
