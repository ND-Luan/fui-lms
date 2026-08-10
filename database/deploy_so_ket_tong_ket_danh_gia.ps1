$ErrorActionPreference = 'Stop'

$configPath = Join-Path $PSScriptRoot '..\.agents\scripts\db_config.json'
$sqlFiles = @(
    'alter_so_gvcn_so_ket_tong_ket_danh_gia.sql',
    'spAPI_SoGVCNSoKetHKISave.sql',
    'spAPI_SoGVCNSoKetHKIGet.sql',
    'spAPI_SoGVCNTongKetNamC1Save.sql',
    'spAPI_SoGVCNTongKetNamC1Get.sql'
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

    Write-Output "ALL_DEPLOYED_SUCCESSFULLY"
}
catch {
    Write-Error $_.Exception.Message
    exit 1
}
finally {
    if ($connection.State -eq [System.Data.ConnectionState]::Open) {
        $connection.Close()
    }
}
