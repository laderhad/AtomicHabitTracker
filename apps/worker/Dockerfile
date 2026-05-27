FROM mcr.microsoft.com/dotnet/sdk:10.0.101 AS build
WORKDIR /src

COPY apps/worker/src/AtomicHabits.Worker/*.csproj apps/worker/src/AtomicHabits.Worker/
RUN dotnet restore apps/worker/src/AtomicHabits.Worker/AtomicHabits.Worker.csproj

COPY apps/worker/src/AtomicHabits.Worker/ apps/worker/src/AtomicHabits.Worker/
WORKDIR /src/apps/worker/src/AtomicHabits.Worker
RUN rm -rf obj bin && dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/runtime:10.0.1 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "AtomicHabits.Worker.dll"]
