$ErrorActionPreference = 'Stop'

$configPath = Join-Path $PSScriptRoot '.agents\scripts\db_config.json'
$procPath = Join-Path $PSScriptRoot '.agents\docs\lhbs\sql_export\spAPI_SoGVCNPhuLucTab2Save.sql'
$config = Get-Content $configPath -Raw | ConvertFrom-Json
$connectionString = "Server=$($config.server);Database=$($config.database);User ID=$($config.user);Password=$($config.password);Encrypt=False;TrustServerCertificate=True"
$connection = [System.Data.SqlClient.SqlConnection]::new($connectionString)

try {
    $connection.Open()

    $procCommand = $connection.CreateCommand()
    $procCommand.CommandTimeout = 120
    $procCommand.CommandText = Get-Content $procPath -Raw
    [void]$procCommand.ExecuteNonQuery()
    Write-Output 'DEPLOYED|spAPI_SoGVCNPhuLucTab2Save.sql'

    $indexCommand = $connection.CreateCommand()
    $indexCommand.CommandTimeout = 120
    $indexCommand.CommandText = @'
IF EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.tblSoGVCNGiaoVienBoMon')
      AND name = N'UX_tblSoGVCNGiaoVienBoMon_SoGVCNID_RowIndex'
      AND filter_definition IS NULL
)
    DROP INDEX UX_tblSoGVCNGiaoVienBoMon_SoGVCNID_RowIndex ON dbo.tblSoGVCNGiaoVienBoMon;

IF NOT EXISTS
(
    SELECT 1
    FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.tblSoGVCNGiaoVienBoMon')
      AND name = N'UX_tblSoGVCNGiaoVienBoMon_SoGVCNID_RowIndex'
)
    CREATE UNIQUE INDEX UX_tblSoGVCNGiaoVienBoMon_SoGVCNID_RowIndex
        ON dbo.tblSoGVCNGiaoVienBoMon(SoGVCNID, RowIndex) WHERE Enable = 1;
'@
    [void]$indexCommand.ExecuteNonQuery()
    Write-Output 'DEPLOYED|filtered unique index'

    $verifyCommand = $connection.CreateCommand()
    $verifyCommand.CommandText = @'
SELECT
    IndexName = i.name,
    FilterDefinition = i.filter_definition,
    HasLmslhbsGrant = CASE WHEN EXISTS (
        SELECT 1
        FROM sys.database_permissions dp
        JOIN sys.database_principals principal ON principal.principal_id = dp.grantee_principal_id
        WHERE dp.major_id = OBJECT_ID(N'dbo.spAPI_SoGVCNPhuLucTab2Save')
          AND dp.permission_name = 'EXECUTE'
          AND dp.state IN ('G', 'W')
          AND principal.name = 'lmslhbs'
    ) THEN 1 ELSE 0 END,
    HasPublicGrant = CASE WHEN EXISTS (
        SELECT 1
        FROM sys.database_permissions dp
        JOIN sys.database_principals principal ON principal.principal_id = dp.grantee_principal_id
        WHERE dp.major_id = OBJECT_ID(N'dbo.spAPI_SoGVCNPhuLucTab2Save')
          AND dp.permission_name = 'EXECUTE'
          AND dp.state IN ('G', 'W')
          AND principal.name = 'public'
    ) THEN 1 ELSE 0 END
FROM sys.indexes i
WHERE i.object_id = OBJECT_ID(N'dbo.tblSoGVCNGiaoVienBoMon')
  AND i.name = N'UX_tblSoGVCNGiaoVienBoMon_SoGVCNID_RowIndex';
'@
    $reader = $verifyCommand.ExecuteReader()
    while ($reader.Read()) {
        Write-Output "VERIFY|Index=$($reader['IndexName'])|Filter=$($reader['FilterDefinition'])|lmslhbs=$($reader['HasLmslhbsGrant'])|public=$($reader['HasPublicGrant'])"
    }
    $reader.Close()
}
finally {
    if ($connection) {
        $connection.Close()
    }
}
