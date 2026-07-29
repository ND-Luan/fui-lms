$ErrorActionPreference = 'Stop'

$configPath = Join-Path $PSScriptRoot '.agents\scripts\db_config.json'
$sqlFiles = @(
    'alter_so_gvcn_ke_hoach_tuan.sql',
    'spAPI_SoGVCNKeHoachTuanGet.sql',
    'spAPI_SoGVCNKeHoachTuanClear.sql',
    'spAPI_SoGVCNKeHoachTuanSave.sql'
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
    ObjectName = 'tblSoGVCNKeHoachTuan',
    IsReady = CASE WHEN OBJECT_ID('dbo.tblSoGVCNKeHoachTuan', 'U') IS NOT NULL THEN 1 ELSE 0 END,
    HasExecuteGrant = CAST(NULL AS int)
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
          AND principal.name = 'public'
    ) THEN 1 ELSE 0 END
FROM sys.procedures p
WHERE p.name IN (
    'spAPI_SoGVCNKeHoachTuanGet',
    'spAPI_SoGVCNKeHoachTuanClear',
    'spAPI_SoGVCNKeHoachTuanSave'
)
ORDER BY ObjectType, ObjectName;
'@

    $reader = $verify.ExecuteReader()
    while ($reader.Read()) {
        Write-Output "$($reader['ObjectType'])|$($reader['ObjectName'])|READY=$($reader['IsReady'])|EXECUTE=$($reader['HasExecuteGrant'])"
    }
    $reader.Close()
}
finally {
    if ($connection) {
        $connection.Close()
    }
}
