# InteriorDesign

An admin-only interior design management application with independent ASP.NET Core and React projects.

## Backend setup

Requirements: .NET 10 SDK.

From `Backend/InteriorDesign.Api`:

```powershell
dotnet run --launch-profile http
```

For local development, the ignored `appsettings.Development.local.json` file configures the initial admin and a JWT signing key. The password is hashed with PBKDF2 before it is stored in SQLite. Change the development credential before using the application outside a local demo.

The API listens on `http://localhost:5000`; Swagger UI is at `/swagger`. On startup it applies checked-in EF Core migrations and creates the initial admin only when seed credentials are configured and no matching admin exists. SQLite is stored at `Backend/InteriorDesign.Api/Data/interior-design.db`. Uploaded images are saved under `wwwroot/uploads` and the database stores relative paths.

The ignored local settings file is for development only. To change these local development values, edit the ignored local settings file. Environment variables can override it. Production requires a strong `Jwt:SigningKey` of at least 32 bytes and an explicitly configured admin seed.

For a new schema change, install/use the EF CLI matching the .NET 10 EF packages and run from the API project directory:

```powershell
dotnet ef migrations add DescribeYourChange
```

## Frontend setup

Requirements: Node.js 20.19+ or 22.12+.

In a separate terminal, from `Frontend/interior-design-ui`:

```powershell
npm install
npm run dev
```

Vite runs at `http://localhost:5173` (or the next available port) and calls the API at `http://localhost:5000/api`. Set `VITE_API_URL` to override that API base URL. Backend CORS allows the default Vite development origin and its first fallback port.

The backend and frontend run independently. Start the API first, then open the Vite URL and sign in with the configured administrator credentials.


