$ErrorActionPreference = 'Stop'

$configPath = Join-Path $PSScriptRoot '.agents\scripts\db_config.json'
$sqlFiles = @(
    'alter_so_gvcn_nhan_xet_thang_lms.sql',
    'spAPI_SoGVCNHsNhanXetThangLmsSave.sql',
    'spAPI_SoGVCNHsNhanXetThangLmsGet.sql'
)
$config = Get-Content $configPath -Raw | ConvertFrom-Json
$connectionString = "Server=$($config.server);Database=$($config.database);User ID=$($config.user);Password=$($config.password);Encrypt=False;TrustServerCertificate=True"
$connection = [System.Data.SqlClient.SqlConnection]::new($connectionString)

try {
    $connection.Open()

    foreach ($sqlFile in $sqlFiles) {
        $sqlPath = Join-Path $PSScriptRoot $sqlFile
        $sql = Get-Content $sqlPath -Raw
        $batches = [regex]::Split($sql, '(?im)^\s*GO\s*$(?:\r?\n)?')

        foreach ($batch in $batches) {
            if ([string]::IsNullOrWhiteSpace($batch)) {
                continue
            }

            $command = $connection.CreateCommand()
            $command.CommandTimeout = 120
            $command.CommandText = $batch
            [void]$command.ExecuteNonQuery()
        }

        Write-Output "DEPLOYED|$sqlFile"
    }

    $verify = $connection.CreateCommand()
    $verify.CommandText = @'
SELECT
    ObjectType = 'TABLE',
    ObjectName = target.ObjectName,
    IsReady = CASE WHEN OBJECT_ID('dbo.' + target.ObjectName, 'U') IS NOT NULL THEN 1 ELSE 0 END,
    HasExecuteGrant = CAST(NULL AS int)
FROM (VALUES
    ('tblSoGVCNHocSinhNhanXetThangLms')
) target(ObjectName)
UNION ALL
SELECT
    ObjectType = 'PROCEDURE',
    ObjectName = p.name,
    IsReady = 1,
    HasExecuteGrant = CASE WHEN EXISTS (
        SELECT 1
        FROM sys.database_permissions dp
        JOIN sys.database_principals principal
          ON principal.principal_id = dp.grantee_principal_id
        WHERE dp.major_id = p.object_id
          AND dp.permission_name = 'EXECUTE'
          AND dp.state IN ('G', 'W')
          AND principal.name IN ('lmslhbs', 'public')
    ) THEN 1 ELSE 0 END
FROM sys.procedures p
WHERE p.name IN (
    'spAPI_SoGVCNHsNhanXetThangLmsSave',
    'spAPI_SoGVCNHsNhanXetThangLmsGet'
)
ORDER BY ObjectType, ObjectName;
'@

    $reader = $verify.ExecuteReader()
    while ($reader.Read()) {
        $objType = $reader['ObjectType']
        $objName = $reader['ObjectName']
        $isReady = $reader['IsReady']
        $grantExec = $reader['HasExecuteGrant']
        Write-Output "$objType|$objName|READY=$isReady|EXECUTE=$grantExec"
    }
    $reader.Close()
}
finally {
    $connection.Dispose()
}
