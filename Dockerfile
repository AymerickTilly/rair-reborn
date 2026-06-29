FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app
COPY RairCore/*.csproj RairCore/
RUN dotnet restore RairCore/RairCore.csproj
COPY RairCore/ RairCore/
RUN dotnet publish RairCore/RairCore.csproj -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/out .
ENTRYPOINT ["dotnet", "RairCore.dll"]
