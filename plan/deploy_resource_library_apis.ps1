$ErrorActionPreference = 'Stop'

$configPath = Join-Path $PSScriptRoot '..\.agents\scripts\db_config.json'
$sqlPath = Join-Path $PSScriptRoot 'resource_library_apis.sql'
$config = Get-Content $configPath -Raw | ConvertFrom-Json

$connectionString = "Server=$($config.server);Database=$($config.database);User ID=$($config.user);Password=$($config.password);Encrypt=False;TrustServerCertificate=True"
$connection = [System.Data.SqlClient.SqlConnection]::new($connectionString)

try {
    $connection.Open()
    $transaction = $connection.BeginTransaction()
    $sql = Get-Content $sqlPath -Raw
    $batches = [regex]::Split($sql, '(?im)^\s*GO\s*$(?:\r?\n)?')

    foreach ($batch in $batches) {
        if ([string]::IsNullOrWhiteSpace($batch)) {
            continue
        }

        $command = $connection.CreateCommand()
        $command.Transaction = $transaction
        $command.CommandTimeout = 120
        $command.CommandText = $batch
        [void]$command.ExecuteNonQuery()
    }

    $transaction.Commit()

    $verify = $connection.CreateCommand()
    $verify.CommandText = @'
SELECT
    p.name AS ProcedureName,
    CASE WHEN EXISTS (
        SELECT 1
        FROM sys.database_permissions dp
        WHERE dp.major_id = p.object_id
          AND dp.permission_name = 'EXECUTE'
          AND dp.state IN ('G', 'W')
    ) THEN 1 ELSE 0 END AS HasExecuteGrant
FROM sys.procedures p
WHERE p.name LIKE 'spAPI_FP_TaiNguyen%'
ORDER BY p.name;
'@

    $reader = $verify.ExecuteReader()
    while ($reader.Read()) {
        Write-Output "$($reader['ProcedureName'])|EXECUTE=$($reader['HasExecuteGrant'])"
    }
    $reader.Close()
}
catch {
    if ($transaction) {
        try { $transaction.Rollback() } catch {}
    }
    throw
}
finally {
    if ($connection) {
        $connection.Close()
    }
}
