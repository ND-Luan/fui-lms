CREATE OR ALTER PROCEDURE [dbo].[spAPI_EL_Teacher_GetQuestionFromHocLieu]
    @KhoiID INT,
    @MonHocID INT,
    @SYS_USERID VARCHAR(9)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @DSHocLieu TABLE (HocLieuID INT PRIMARY KEY);

    INSERT INTO @DSHocLieu (HocLieuID)
    SELECT hl.HocLieuID
    FROM dbo.tblHocLieu_FP AS hl
    WHERE hl.KhoiID = @KhoiID
      AND hl.MonHocID = @MonHocID
      AND hl.Is_Xoa = 0
      AND hl.Loai = 'HOC_LIEU';

    SELECT
        hl.HocLieuID,
        hl.TenHocLieu,
        hl.MonHocID,
        hl.KhoiID,
        hl.ThumbnailURL,
        hl.TinhTrang,
        hl.CreateUser,
        hl.CreateTime
    FROM dbo.tblHocLieu_FP AS hl
    INNER JOIN @DSHocLieu AS ds ON ds.HocLieuID = hl.HocLieuID;

    SELECT
        nd.NoiDungID,
        nd.HocLieuID,
        nd.TenNoiDung,
        nd.LoaiNoiDung,
        nd.DataJson
    FROM dbo.tblNoiDungHocLieu_FP AS nd
    INNER JOIN @DSHocLieu AS ds ON ds.HocLieuID = nd.HocLieuID
    WHERE nd.Is_Xoa = 0
      AND nd.LoaiNoiDung IN (
          'QUIZ_SINGLE_CHOICE', 'QUIZ_MULTIPLE_CHOICE', 'QUIZ_TRUE_FALSE',
          'QUIZ_MULTIPLE_TRUE_FALSE', 'QUIZ_FILL_IN_BLANK', 'QUIZ_MATCHING',
          'QUIZ_COMPOSITE'
      );
END;
GO

GRANT EXECUTE ON [dbo].[spAPI_EL_Teacher_GetQuestionFromHocLieu] TO [lmslhbs];
GO
