FROM mcr.microsoft.com/dotnet/sdk:10.0.101 AS build
WORKDIR /src

COPY apps/api/src/AtomicHabits.Api/*.csproj apps/api/src/AtomicHabits.Api/
RUN dotnet restore apps/api/src/AtomicHabits.Api/AtomicHabits.Api.csproj

COPY apps/api/src/AtomicHabits.Api/ apps/api/src/AtomicHabits.Api/
WORKDIR /src/apps/api/src/AtomicHabits.Api
RUN rm -rf obj bin && dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0.1 AS runtime
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish .
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} exec dotnet AtomicHabits.Api.dll"]
