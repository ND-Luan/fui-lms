USE [LMS-LHBS]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROC [dbo].[spAPI_BaoCao_ChiTieu_TA1_Save]
    @JsonChiTieu NVARCHAR(MAX),
    @HocKi NVARCHAR(100),
    @SYS_USERID VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @DefaultCapID INT = 1;
    DECLARE @UpdateUser VARCHAR(20) = LEFT(COALESCE(NULLIF(@SYS_USERID, ''), SUSER_SNAME()), 20);
    DECLARE @MergeActions TABLE (ActionName NVARCHAR(10));

    ;WITH JsonData AS
    (
        SELECT
              TRY_CAST(JSON_VALUE(j.value, '$.KhoiID') AS INT) AS KhoiID
            , JSON_VALUE(j.value, '$.LopID') AS LopIDRaw
            , TRY_CAST(JSON_VALUE(j.value, '$.CapID') AS INT) AS CapID
            , JSON_VALUE(j.value, '$.HocKi') AS HocKi
            , TRY_CAST(JSON_VALUE(j.value, '$.ChiTieuID') AS INT) AS ChiTieuID
            , TRY_CAST(JSON_VALUE(j.value, '$.C1_ChuaHoanThanh') AS DECIMAL(5,2)) AS C1_ChuaHoanThanh
            , TRY_CAST(JSON_VALUE(j.value, '$.C1_HoanThanh') AS DECIMAL(5,2)) AS C1_HoanThanh
            , TRY_CAST(JSON_VALUE(j.value, '$.C1_Tot') AS DECIMAL(5,2)) AS C1_Tot
        FROM OPENJSON(@JsonChiTieu) j
    ),
    PreparedData AS
    (
        SELECT
              COALESCE(jd.CapID, @DefaultCapID) AS CapID
            , COALESCE(NULLIF(jd.HocKi, ''), @HocKi) AS HocKi
            , COALESCE(NULLIF(jd.LopIDRaw, ''), CASE WHEN jd.KhoiID IS NOT NULL THEN CONCAT('__all_k', jd.KhoiID, '__') END) AS LopID
            , jd.ChiTieuID
            , jd.C1_ChuaHoanThanh
            , jd.C1_HoanThanh
            , jd.C1_Tot
        FROM JsonData jd
    ),
    SourceData AS
    (
        SELECT
              pd.CapID
            , pd.LopID
            , pd.HocKi
            , ISNULL(MAX(pd.ChiTieuID), 0) AS ChiTieuID
            , ISNULL(MAX(pd.C1_ChuaHoanThanh), 0) AS C1_ChuaHoanThanh
            , ISNULL(MAX(pd.C1_HoanThanh), 0) AS C1_HoanThanh
            , ISNULL(MAX(pd.C1_Tot), 0) AS C1_Tot
        FROM PreparedData pd
        WHERE pd.LopID IS NOT NULL
        GROUP BY
              pd.CapID
            , pd.LopID
            , pd.HocKi
    )
    MERGE dbo.tblChiTieu_TA1 AS tgt
    USING SourceData AS src
       ON tgt.Enable = 1
      AND tgt.CapID = src.CapID
      AND tgt.LopID = src.LopID
      AND tgt.HocKi = src.HocKi
    WHEN MATCHED THEN
        UPDATE SET
              tgt.C1_ChuaHoanThanh = ISNULL(src.C1_ChuaHoanThanh, 0)
            , tgt.C1_HoanThanh = ISNULL(src.C1_HoanThanh, 0)
            , tgt.C1_Tot = ISNULL(src.C1_Tot, 0)
            , tgt.ChuaDat = ISNULL(src.C1_ChuaHoanThanh, 0)
            , tgt.Dat = ISNULL(src.C1_HoanThanh, 0)
            , tgt.Tot = ISNULL(src.C1_Tot, 0)
            , tgt.UpdateUser = @UpdateUser
            , tgt.UpdateTime = GETDATE()
    WHEN NOT MATCHED BY TARGET THEN
        INSERT
        (
              CapID
            , LopID
            , HocKi
            , ChuaDat
            , Dat
            , Kha
            , Tot
            , C1_HoanThanh
            , C1_ChuaHoanThanh
            , C1_Tot
            , Enable
            , CreateUser
            , CreateTime
            , UpdateUser
            , UpdateTime
        )
        VALUES
        (
              src.CapID
            , src.LopID
            , src.HocKi
            , ISNULL(src.C1_ChuaHoanThanh, 0)
            , ISNULL(src.C1_HoanThanh, 0)
            , 0
            , ISNULL(src.C1_Tot, 0)
            , ISNULL(src.C1_HoanThanh, 0)
            , ISNULL(src.C1_ChuaHoanThanh, 0)
            , ISNULL(src.C1_Tot, 0)
            , 1
            , @UpdateUser
            , GETDATE()
            , @UpdateUser
            , GETDATE()
          )
        OUTPUT $action INTO @MergeActions(ActionName);

        SELECT
            SUM(CASE WHEN ActionName = 'INSERT' THEN 1 ELSE 0 END) AS InsertedCount
          , SUM(CASE WHEN ActionName = 'UPDATE' THEN 1 ELSE 0 END) AS UpdatedCount
        FROM @MergeActions;
END
GO
